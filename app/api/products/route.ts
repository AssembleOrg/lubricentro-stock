import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { ProductUseCases } from '@/application/use-cases/product.use-cases';
import { ProductRepository } from '@/infrastructure/repositories/product.repository.impl';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { parseAndValidateRequest, handleApiError } from '@/presentation/utils/request-handler.util';
import { CreateProductDto, ProductResponseDto } from '@/presentation/dto/product.dto';
import { ProductFilters, PaginationParams } from '@/domain/repositories/product.repository';
import { plainToInstance } from 'class-transformer';
import { rateLimiter, getClientIP } from '@/presentation/middleware/rate-limit.middleware';
import {
  sanitizeSearchInput,
  sanitizeNumber,
  validatePagination,
  sanitizeBoolean,
} from '@/presentation/utils/security.util';
import { cacheService, CacheService } from '@/infrastructure/cache/cache.service';
import { verifyAuth } from '@/presentation/middleware/auth.middleware';
import { cookies } from 'next/headers';
import { prisma } from '@/infrastructure/database/prisma.service';

interface PaginatedResponse {
  data: ProductResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const productRepository = new ProductRepository();
const productUseCases = new ProductUseCases(productRepository);

// Helper to access private method
function buildWhereClause(filters?: ProductFilters) {
  return (productRepository as any).buildWhereClause(filters);
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (checks cookie or header)
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiter.check(clientIP);

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        {
          resetAt: rateLimitResult.resetAt,
        }
      );
    }

    // Security headers will be applied by middleware

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const filters: ProductFilters = {};

    // Validate and sanitize pagination
    const pageNum = sanitizeNumber(searchParams.get('page'), 1, undefined, 1);
    const pageSizeNum = sanitizeNumber(searchParams.get('pageSize'), 1, 100, 10);
    const pagination = validatePagination(pageNum, pageSizeNum);

    // Sanitize search input
    if (searchParams.get('search')) {
      filters.search = sanitizeSearchInput(searchParams.get('search')!);
    }

    // Sanitize specific filters
    if (searchParams.get('code')) {
      const code = sanitizeNumber(searchParams.get('code'), 1);
      if (code) filters.code = code;
    }

    if (searchParams.get('description')) {
      filters.description = sanitizeSearchInput(searchParams.get('description')!);
    }

    if (searchParams.get('productTypeId')) {
      const productTypeId = sanitizeNumber(searchParams.get('productTypeId'), 1);
      if (productTypeId) filters.productTypeId = productTypeId;
    }

    if (searchParams.get('isActive')) {
      filters.isActive = sanitizeBoolean(searchParams.get('isActive'));
    }

    if (searchParams.get('includeDeleted')) {
      filters.includeDeleted = sanitizeBoolean(searchParams.get('includeDeleted'));
    }

    // Check cache
    const cacheKey = CacheService.generateKey('products', { filters, pagination });
    const cached = cacheService.get<PaginatedResponse>(cacheKey);

    if (cached) {
      const cachedResponse = createSuccessResponse(cached, 200);
      cachedResponse.headers.set('X-Cache', 'HIT');
      cachedResponse.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
      cachedResponse.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetAt));
      return cachedResponse;
    }

    // Get products directly with productType relation to include it in response
    const where = buildWhereClause(filters);
    const currentPage = pagination.page ?? 1;
    const currentPageSize = pagination.pageSize ?? 10;
    const skip = (currentPage - 1) * currentPageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: currentPageSize,
        orderBy: { code: 'asc' },
        include: {
          productType: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / currentPageSize);

    // Debug: Log first product to see what Prisma returns
    if (products.length > 0 && process.env.NODE_ENV === 'development') {
      console.log('First product from Prisma:', JSON.stringify(products[0], null, 2));
    }

    const productsData = products.map((p) => {
      // Ensure productType is properly mapped
      // Check if productType exists and has valid data
      let productTypeData: { id: number; name: string; description: string | null } | undefined = undefined;
      
      // Check if productType exists and is not null
      if (p.productType !== null && p.productType !== undefined) {
        // Check if it's a valid object with an id
        const pt = p.productType as any;
        if (pt && typeof pt === 'object' && pt.id !== null && pt.id !== undefined) {
          productTypeData = {
            id: Number(pt.id),
            name: pt.name || '',
            description: pt.description ?? null,
          };
        }
      }

      const productData: any = {
        id: p.id,
        code: p.code,
        description: p.description,
        productTypeId: p.productTypeId,
        costPrice: Number(p.costPrice),
        publicPrice: Number(p.publicPrice),
        stock: p.stock,
        isActive: p.isActive,
        deletedAt: p.deletedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };

      // Only add productType if it exists and has valid data
      if (productTypeData) {
        productData.productType = productTypeData;
      }
      // If productType is null/undefined, don't include it in the data object
      // This way plainToInstance won't try to transform an empty object

      return plainToInstance(ProductResponseDto, productData, { excludeExtraneousValues: true });
    });

    // Flatten response structure - no nested data
    const responseData = {
      data: productsData,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages,
    };

    // Cache the result (30 seconds for searches, 60 for regular queries)
    const cacheTTL = filters.search ? 30 : 60;
    cacheService.set(cacheKey, responseData, cacheTTL);

    const apiResponse = createSuccessResponse(responseData, 200);
    apiResponse.headers.set('X-Cache', 'MISS');
    apiResponse.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    apiResponse.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetAt));

    return apiResponse;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimiter.check(clientIP);

    if (!rateLimitResult.allowed) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429,
        {
          resetAt: rateLimitResult.resetAt,
        }
      );
    }

    const { data, errors } = await parseAndValidateRequest(request, CreateProductDto);

    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, errors);
    }

    const product = await productUseCases.create(data);
    
    // Fetch the product with productType included
    const productWithType = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        productType: true,
      },
    });

    if (!productWithType) {
      return createErrorResponse('Product not found after creation', 500);
    }

    const productData: any = {
      id: productWithType.id,
      code: productWithType.code,
      description: productWithType.description,
      productTypeId: productWithType.productTypeId,
      costPrice: Number(productWithType.costPrice),
      publicPrice: Number(productWithType.publicPrice),
      stock: productWithType.stock,
      isActive: productWithType.isActive,
      deletedAt: productWithType.deletedAt,
      createdAt: productWithType.createdAt,
      updatedAt: productWithType.updatedAt,
    };

    // Only add productType if it exists and has valid data
    if (productWithType.productType && productWithType.productType.id) {
      productData.productType = {
        id: productWithType.productType.id,
        name: productWithType.productType.name,
        description: productWithType.productType.description,
      };
    }

    const responseData = plainToInstance(ProductResponseDto, productData, {
      excludeExtraneousValues: true,
    });

    // Invalidate cache
    cacheService.clear();

    const apiResponse = createSuccessResponse(responseData, 201);
    apiResponse.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
    apiResponse.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetAt));

    return apiResponse;
  } catch (error) {
    return handleApiError(error);
  }
}

