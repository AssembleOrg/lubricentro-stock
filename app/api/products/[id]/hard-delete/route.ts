import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { ProductUseCases } from '@/application/use-cases/product.use-cases';
import { ProductRepository } from '@/infrastructure/repositories/product.repository.impl';
import { createSuccessResponse, createErrorResponse } from '@/presentation/utils/api-response.util';
import { handleApiError } from '@/presentation/utils/request-handler.util';
import { verifyAuth } from '@/presentation/middleware/auth.middleware';

const productRepository = new ProductRepository();
const productUseCases = new ProductUseCases(productRepository);

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
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return createErrorResponse('Invalid product ID', 400);
    }

    await productUseCases.hardDelete(productId);

    return createSuccessResponse({ message: 'Product permanently deleted' }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

