/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitizes a search string to prevent injection attacks
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  let sanitized = input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();

  // Limit length to prevent DoS
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Validates and sanitizes a number from query params
 */
export function sanitizeNumber(
  value: string | null,
  min?: number,
  max?: number,
  defaultValue?: number
): number | null {
  if (!value) {
    return defaultValue ?? null;
  }

  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return defaultValue ?? null;
  }

  if (min !== undefined && num < min) {
    return min;
  }

  if (max !== undefined && num > max) {
    return max;
  }

  return num;
}

/**
 * Validates pagination parameters
 */
export function validatePagination(
  page: number | null,
  pageSize: number | null
): { page: number; pageSize: number } {
  const validPage = page && page > 0 ? page : 1;
  const validPageSize = pageSize && pageSize > 0 && pageSize <= 100 ? pageSize : 10;

  return {
    page: validPage,
    pageSize: validPageSize,
  };
}

/**
 * Validates boolean from query params
 */
export function sanitizeBoolean(value: string | null, defaultValue = false): boolean {
  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

