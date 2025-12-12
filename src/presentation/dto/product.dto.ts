import { Expose, Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { formatPrice } from '@/presentation/utils/price.util';

export class CreateProductDto {
  @Expose()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  code!: number;

  @Expose()
  @IsString()
  @MinLength(1)
  description!: string;

  @Expose()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productTypeId!: number;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  publicPrice!: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @Expose()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  code?: number;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productTypeId?: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  publicPrice?: number;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @Expose()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class ProductResponseDto {
  @Expose()
  id!: number;

  @Expose()
  code!: number;

  @Expose()
  description!: string;

  @Expose()
  productTypeId!: number;

  @Expose()
  @Type(() => Object)
  productType?: {
    id: number;
    name: string;
    description: string | null;
  };

  @Expose()
  @Transform(({ value }: { value: number }) => formatPrice(value))
  costPrice!: string;

  @Expose()
  @Transform(({ value }: { value: number }) => formatPrice(value))
  publicPrice!: string;

  @Expose()
  stock!: number;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Type(() => Date)
  deletedAt!: Date | null;

  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @Expose()
  @Type(() => Date)
  updatedAt!: Date;
}

