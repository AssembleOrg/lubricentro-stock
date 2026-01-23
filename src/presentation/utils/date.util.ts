/**
 * Formats a date to DD/MM/YY format
 * @param date - The date to format (Date object or ISO string)
 * @returns Formatted date string (e.g., "23/01/26")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'N/A';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = String(dateObj.getFullYear()).slice(-2);
  
  return `${day}/${month}/${year}`;
}
