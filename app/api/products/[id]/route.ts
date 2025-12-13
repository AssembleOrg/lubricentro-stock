import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { ProductUseCases } from '@/application/use-cases/product.use-cases';
import { ProductRepository } from '@/infrastructure/repositories/product.repository.impl';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { parseAndValidateRequest, handleApiError } from '@/presentation/utils/request-handler.util';
import { UpdateProductDto, ProductResponseDto } from '@/presentation/dto/product.dto';
import { plainToInstance } from 'class-transformer';
import { verifyAuth } from '@/presentation/middleware/auth.middleware';
import { prisma } from '@/infrastructure/database/prisma.service';

const productRepository = new ProductRepository();
const productUseCases = new ProductUseCases(productRepository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return createErrorResponse('Invalid product ID', 400);
    }

    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const product = await productUseCases.getById(productId, includeDeleted);

    if (!product) {
      return createErrorResponse('Product not found', 404);
    }

    // Fetch product with productType included
    const productWithType = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productType: true,
      },
    });

    if (!productWithType) {
      return createErrorResponse('Product not found', 404);
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

    const response = plainToInstance(ProductResponseDto, productData, {
      excludeExtraneousValues: true,
    });

    return createSuccessResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return createErrorResponse('Invalid product ID', 400);
    }

    const { data, errors } = await parseAndValidateRequest(request, UpdateProductDto);

    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, errors);
    }

    const product = await productUseCases.update(productId, data);
    
    // Fetch the updated product with productType included
    const productWithType = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productType: true,
      },
    });

    if (!productWithType) {
      return createErrorResponse('Product not found after update', 500);
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

    const response = plainToInstance(ProductResponseDto, productData, {
      excludeExtraneousValues: true,
    });

    return createSuccessResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return createErrorResponse('Invalid product ID', 400);
    }

    await productUseCases.softDelete(productId);

    return createSuccessResponse({ message: 'Product deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

