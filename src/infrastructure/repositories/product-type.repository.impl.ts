import { ProductType } from '@/domain/entities/product-type.entity';
import {
  IProductTypeRepository,
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from '@/domain/repositories/product-type.repository';
import { prisma } from '../database/prisma.service';

export class ProductTypeRepository implements IProductTypeRepository {
  async findAll(): Promise<ProductType[]> {
    const productTypes = await prisma.productType.findMany({
      orderBy: { name: 'asc' },
    });

    return productTypes.map(
      (pt) =>
        new ProductType(
          pt.id,
          pt.name,
          pt.description,
          pt.createdAt,
          pt.updatedAt
        )
    );
  }

  async findById(id: number): Promise<ProductType | null> {
    const productType = await prisma.productType.findUnique({
      where: { id },
    });

    if (!productType) return null;

    return new ProductType(
      productType.id,
      productType.name,
      productType.description,
      productType.createdAt,
      productType.updatedAt
    );
  }

  async findByName(name: string): Promise<ProductType | null> {
    const productType = await prisma.productType.findUnique({
      where: { name },
    });

    if (!productType) return null;

    return new ProductType(
      productType.id,
      productType.name,
      productType.description,
      productType.createdAt,
      productType.updatedAt
    );
  }

  async create(data: CreateProductTypeDto): Promise<ProductType> {
    const productType = await prisma.productType.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });

    return new ProductType(
      productType.id,
      productType.name,
      productType.description,
      productType.createdAt,
      productType.updatedAt
    );
  }

  async update(id: number, data: UpdateProductTypeDto): Promise<ProductType> {
    const productType = await prisma.productType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return new ProductType(
      productType.id,
      productType.name,
      productType.description,
      productType.createdAt,
      productType.updatedAt
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.productType.delete({
      where: { id },
    });
  }
}

