/**
 * Formats a number as a price with thousands separators
 * @param value - The numeric value to format
 * @returns Formatted price string (e.g., "1.234,56")
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parses a formatted price string back to a number
 * @param value - The formatted price string (e.g., "1.234,56" or "7.000,00")
 * @returns The numeric value
 */
export function parsePrice(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  // Remove $, spaces, and any other non-numeric characters except . and ,
  const cleaned = value
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .trim();
  
  // Replace dots (thousands separator) with nothing, then replace comma (decimal) with dot
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? 0 : parsed;
}

