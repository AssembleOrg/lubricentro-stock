import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { ProductTypeUseCases } from '@/application/use-cases/product-type.use-cases';
import { ProductTypeRepository } from '@/infrastructure/repositories/product-type.repository.impl';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { parseAndValidateRequest, handleApiError } from '@/presentation/utils/request-handler.util';
import { CreateProductTypeDto, ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { plainToInstance } from 'class-transformer';
import { verifyAuth } from '@/presentation/middleware/auth.middleware';

const productTypeRepository = new ProductTypeRepository();
const productTypeUseCases = new ProductTypeUseCases(productTypeRepository);

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    const productTypes = await productTypeUseCases.getAll();
    const response = productTypes.map((pt) =>
      plainToInstance(ProductTypeResponseDto, pt, { excludeExtraneousValues: true })
    );
    return createSuccessResponse(response, 200);
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

    const { data, errors } = await parseAndValidateRequest(request, CreateProductTypeDto);

    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, errors);
    }

    const productType = await productTypeUseCases.create(data);
    const response = plainToInstance(ProductTypeResponseDto, productType, {
      excludeExtraneousValues: true,
    });

    return createSuccessResponse(response, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

