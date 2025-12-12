import { plainToInstance } from 'class-transformer';
import { NextResponse } from 'next/server';

export function createSuccessResponse<T>(
  data: T,
  status = 200,
  DtoClass?: new () => T
): NextResponse {
  const transformedData = DtoClass
    ? plainToInstance(DtoClass, data, { excludeExtraneousValues: true })
    : data;

  return NextResponse.json(
    {
      success: true,
      data: transformedData,
    },
    { status }
  );
}

export function createErrorResponse(
  message: string,
  status = 400,
  details?: unknown
): NextResponse {
  const responseBody: { success: false; error: string; details?: unknown } = {
    success: false,
    error: message,
  };

  if (details) {
    responseBody.details = details;
  }

  return NextResponse.json(responseBody, { status });
}

