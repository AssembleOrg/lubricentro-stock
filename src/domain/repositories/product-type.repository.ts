import { ProductType } from '../entities/product-type.entity';

export interface CreateProductTypeDto {
  name: string;
  description?: string;
}

export interface UpdateProductTypeDto {
  name?: string;
  description?: string;
}

export interface IProductTypeRepository {
  findAll(): Promise<ProductType[]>;
  findById(id: number): Promise<ProductType | null>;
  findByName(name: string): Promise<ProductType | null>;
  create(data: CreateProductTypeDto): Promise<ProductType>;
  update(id: number, data: UpdateProductTypeDto): Promise<ProductType>;
  delete(id: number): Promise<void>;
}

