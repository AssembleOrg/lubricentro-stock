import { Product } from '@/domain/entities/product.entity';
import {
  IProductRepository,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  PaginationParams,
  PaginatedResult,
} from '@/domain/repositories/product.repository';

export class ProductUseCases {
  constructor(private readonly repository: IProductRepository) {}

  async getAll(filters?: ProductFilters): Promise<Product[]> {
    return this.repository.findAll(filters);
  }

  async getPaginated(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>> {
    return this.repository.findPaginated(filters, pagination);
  }

  async getById(id: number, includeDeleted = false): Promise<Product | null> {
    return this.repository.findById(id, includeDeleted);
  }

  async getByCode(code: number, includeDeleted = false): Promise<Product | null> {
    return this.repository.findByCode(code, includeDeleted);
  }

  async create(data: CreateProductDto): Promise<Product> {
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new Error('Product with this code already exists');
    }
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await this.repository.findByCode(data.code);
      if (codeExists) {
        throw new Error('Product with this code already exists');
      }
    }

    return this.repository.update(id, data);
  }

  async softDelete(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    if (existing.deletedAt) {
      throw new Error('Product is already deleted');
    }
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<void> {
    const existing = await this.repository.findById(id, true);
    if (!existing) {
      throw new Error('Product not found');
    }
    if (!existing.deletedAt) {
      throw new Error('Product is not deleted');
    }
    await this.repository.restore(id);
  }

  async hardDelete(id: number): Promise<void> {
    const existing = await this.repository.findById(id, true);
    if (!existing) {
      throw new Error('Product not found');
    }
    await this.repository.hardDelete(id);
  }
}

