import { ProductType } from '@/domain/entities/product-type.entity';
import {
  IProductTypeRepository,
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from '@/domain/repositories/product-type.repository';

export class ProductTypeUseCases {
  constructor(private readonly repository: IProductTypeRepository) {}

  async getAll(): Promise<ProductType[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<ProductType | null> {
    return this.repository.findById(id);
  }

  async create(data: CreateProductTypeDto): Promise<ProductType> {
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new Error('Product type with this name already exists');
    }
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateProductTypeDto): Promise<ProductType> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product type not found');
    }

    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repository.findByName(data.name);
      if (nameExists) {
        throw new Error('Product type with this name already exists');
      }
    }

    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Product type not found');
    }
    await this.repository.delete(id);
  }
}

