import { Expose, Type } from 'class-transformer';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @Expose()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProductTypeDto {
  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProductTypeResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  @Type(() => Date)
  createdAt!: Date;

  @Expose()
  @Type(() => Date)
  updatedAt!: Date;
}

