import { Product } from '@/domain/entities/product.entity';
import {
  IProductRepository,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  PaginationParams,
  PaginatedResult,
} from '@/domain/repositories/product.repository';
import { prisma } from '../database/prisma.service';

export class ProductRepository implements IProductRepository {
  private buildWhereClause(filters?: ProductFilters) {
    const where: {
      code?: number | { equals: number };
      description?: { contains: string; mode?: 'insensitive' };
      productTypeId?: number;
      isActive?: boolean;
      deletedAt?: null | { not: null };
      OR?: Array<{
        code?: { equals: number };
        description?: { contains: string; mode?: 'insensitive' };
      }>;
    } = {};

    // Search filter (searches in both code and description)
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      const searchNumber = parseInt(searchTerm, 10);
      
      if (!isNaN(searchNumber)) {
        // If search is a number, search by code
        where.code = { equals: searchNumber };
      } else {
        // If search is text, search in description
        where.description = {
          contains: searchTerm,
          mode: 'insensitive',
        };
      }
    }

    // Specific code filter (overrides search if both provided)
    if (filters?.code) {
      where.code = filters.code;
    }

    // Specific description filter (overrides search if both provided)
    if (filters?.description) {
      where.description = {
        contains: filters.description,
        mode: 'insensitive',
      };
    }

    if (filters?.productTypeId) {
      where.productTypeId = filters.productTypeId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (!filters?.includeDeleted) {
      where.deletedAt = null;
    }

    return where;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where = this.buildWhereClause(filters);

    const products = await prisma.product.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return products.map(
      (p) =>
        new Product(
          p.id,
          p.code,
          p.description,
          p.productTypeId,
          Number(p.costPrice),
          Number(p.publicPrice),
          p.stock,
          p.isActive,
          p.deletedAt,
          p.createdAt,
          p.updatedAt
        )
    );
  }

  async findPaginated(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    const where = this.buildWhereClause(filters);
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { code: 'asc' },
        include: {
          productType: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: products.map(
        (p) =>
          new Product(
            p.id,
            p.code,
            p.description,
            p.productTypeId,
            Number(p.costPrice),
            Number(p.publicPrice),
            p.stock,
            p.isActive,
            p.deletedAt,
            p.createdAt,
            p.updatedAt
          )
      ),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findById(id: number, includeDeleted = false): Promise<Product | null> {
    const where: { id: number; deletedAt?: null | { not: null } } = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const product = await prisma.product.findFirst({
      where,
      include: {
        productType: true,
      },
    });

    if (!product) return null;

    return new Product(
      product.id,
      product.code,
      product.description,
      product.productTypeId,
      Number(product.costPrice),
      Number(product.publicPrice),
      product.stock,
      product.isActive,
      product.deletedAt,
      product.createdAt,
      product.updatedAt
    );
  }

  async findByCode(code: number, includeDeleted = false): Promise<Product | null> {
    const where: { code: number; deletedAt?: null } = { code };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const product = await prisma.product.findFirst({
      where,
      include: {
        productType: true,
      },
    });

    if (!product) return null;

    return new Product(
      product.id,
      product.code,
      product.description,
      product.productTypeId,
      Number(product.costPrice),
      Number(product.publicPrice),
      product.stock,
      product.isActive,
      product.deletedAt,
      product.createdAt,
      product.updatedAt
    );
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        code: data.code,
        description: data.description,
        productTypeId: data.productTypeId,
        costPrice: data.costPrice,
        publicPrice: data.publicPrice,
        stock: data.stock ?? 0,
        isActive: data.isActive ?? true,
      },
      include: {
        productType: true,
      },
    });

    return new Product(
      product.id,
      product.code,
      product.description,
      product.productTypeId,
      Number(product.costPrice),
      Number(product.publicPrice),
      product.stock,
      product.isActive,
      product.deletedAt,
      product.createdAt,
      product.updatedAt
    );
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.productTypeId !== undefined && { productTypeId: data.productTypeId }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.publicPrice !== undefined && { publicPrice: data.publicPrice }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        productType: true,
      },
    });

    return new Product(
      product.id,
      product.code,
      product.description,
      product.productTypeId,
      Number(product.costPrice),
      Number(product.publicPrice),
      product.stock,
      product.isActive,
      product.deletedAt,
      product.createdAt,
      product.updatedAt
    );
  }

  async softDelete(id: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: number): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }
}

