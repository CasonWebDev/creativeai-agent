/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize email input
 * - Trim whitespace
 * - Convert to lowercase
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitize text input
 * - Trim whitespace
 * - Remove any HTML tags and dangerous characters
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Trim
  let sanitized = text.trim();
  
  // Remove HTML tags using a simple approach
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities to prevent double-encoding
  sanitized = decodeHTMLEntities(sanitized);
  
  return sanitized;
}

/**
 * Decode HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Sanitize password (minimal - just trim)
 * Do NOT modify password beyond trimming
 */
export function sanitizePassword(password: string): string {
  return password.trim();
}

/**
 * Sanitize URL
 * - Trim whitespace
 * - Validate it's a valid URL
 */
export function sanitizeURL(url: string): string | null {
  try {
    const trimmed = url.trim();
    const urlObj = new URL(trimmed);
    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize filename
 * - Trim whitespace
 * - Remove directory traversal attempts
 * - Remove special characters
 */
export function sanitizeFilename(filename: string): string {
  let sanitized = filename.trim();
  
  // Remove directory traversal
  sanitized = sanitized.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');
  
  // Remove special characters but keep dots for extensions
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return sanitized;
}
