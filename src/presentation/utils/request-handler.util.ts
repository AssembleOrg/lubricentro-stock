import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextRequest } from 'next/server';
import { createErrorResponse } from './api-response.util';

export async function parseAndValidateRequest<T>(
  request: NextRequest,
  DtoClass: new () => T
): Promise<{ data: T; errors: string[] }> {
  try {
    const body = await request.json();
    const dto = plainToInstance(DtoClass, body, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true, // Enable automatic type conversion
    });

    const errors = await validate(dto as object);
    const errorMessages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );

    return { data: dto, errors: errorMessages };
  } catch (error) {
    return {
      data: plainToInstance(DtoClass, {}, { excludeExtraneousValues: true }),
      errors: ['Invalid request body'],
    };
  }
}

export async function handleApiError(error: unknown): Promise<Response> {
  if (error instanceof Error) {
    return createErrorResponse(error.message, 400);
  }
  return createErrorResponse('An unexpected error occurred', 500);
}

