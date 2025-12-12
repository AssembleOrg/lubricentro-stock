import { Product } from '../entities/product.entity';

export interface CreateProductDto {
  code: number;
  description: string;
  productTypeId: number;
  costPrice: number;
  publicPrice: number;
  stock?: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  code?: number;
  description?: string;
  productTypeId?: number;
  costPrice?: number;
  publicPrice?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductFilters {
  code?: number;
  description?: string;
  productTypeId?: number;
  isActive?: boolean;
  includeDeleted?: boolean;
  search?: string; // For partial text search in description or code
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findPaginated(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>>;
  findById(id: number, includeDeleted?: boolean): Promise<Product | null>;
  findByCode(code: number, includeDeleted?: boolean): Promise<Product | null>;
  create(data: CreateProductDto): Promise<Product>;
  update(id: number, data: UpdateProductDto): Promise<Product>;
  softDelete(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
}

