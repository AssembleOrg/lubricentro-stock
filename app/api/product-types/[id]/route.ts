import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { ProductTypeUseCases } from '@/application/use-cases/product-type.use-cases';
import { ProductTypeRepository } from '@/infrastructure/repositories/product-type.repository.impl';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { parseAndValidateRequest, handleApiError } from '@/presentation/utils/request-handler.util';
import { UpdateProductTypeDto, ProductTypeResponseDto } from '@/presentation/dto/product-type.dto';
import { plainToInstance } from 'class-transformer';
import { verifyAuth } from '@/presentation/middleware/auth.middleware';

const productTypeRepository = new ProductTypeRepository();
const productTypeUseCases = new ProductTypeUseCases(productTypeRepository);

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
    const productTypeId = parseInt(id, 10);

    if (isNaN(productTypeId)) {
      return createErrorResponse('Invalid product type ID', 400);
    }

    const productType = await productTypeUseCases.getById(productTypeId);

    if (!productType) {
      return createErrorResponse('Product type not found', 404);
    }

    const response = plainToInstance(ProductTypeResponseDto, productType, {
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
    const productTypeId = parseInt(id, 10);

    if (isNaN(productTypeId)) {
      return createErrorResponse('Invalid product type ID', 400);
    }

    const { data, errors } = await parseAndValidateRequest(request, UpdateProductTypeDto);

    if (errors.length > 0) {
      return createErrorResponse('Validation failed', 400, errors);
    }

    const productType = await productTypeUseCases.update(productTypeId, data);
    const response = plainToInstance(ProductTypeResponseDto, productType, {
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
    const productTypeId = parseInt(id, 10);

    if (isNaN(productTypeId)) {
      return createErrorResponse('Invalid product type ID', 400);
    }

    await productTypeUseCases.delete(productTypeId);

    return createSuccessResponse({ message: 'Product type deleted successfully' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

