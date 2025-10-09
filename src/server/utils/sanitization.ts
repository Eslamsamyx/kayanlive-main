/**
 * Sanitization utilities for questionnaire submissions
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitize plain text input (removes HTML/special characters)
 */
export function sanitizeText(input: string | null | undefined): string | null {
  if (!input) return null;

  // Remove HTML tags and trim whitespace
  const sanitized = input
    .toString()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .replace(/\r\n/g, '\n'); // Normalize line breaks

  return sanitized || null;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = sanitizeText(input);
  if (!sanitized) return null;

  // Convert to lowercase and validate basic email pattern
  const email = sanitized.toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  return emailRegex.test(email) ? email : null;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = sanitizeText(input);
  if (!sanitized) return null;

  // Keep only valid phone characters
  return sanitized.replace(/[^0-9+\-() ]/g, '') || null;
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;

  const sanitized = sanitizeText(input);
  if (!sanitized) return null;

  try {
    const url = new URL(sanitized);
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === '') return null;

  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
}

/**
 * Sanitize JSON value (for complex form data)
 */
export function sanitizeJson(input: any): any {
  if (!input) return null;

  if (typeof input === 'string') {
    return sanitizeText(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeJson(item));
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeText(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJson(value);
      }
    }
    return sanitized;
  }

  // For numbers, booleans, etc., return as is
  return input;
}

/**
 * Sanitize file metadata (not the file content itself)
 */
export function sanitizeFileMetadata(metadata: {
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  filePath?: string;
}): {
  fileName: string | null;
  originalName: string | null;
  mimeType: string | null;
  filePath: string | null;
} {
  return {
    fileName: metadata.fileName ? sanitizeText(metadata.fileName) : null,
    originalName: metadata.originalName ? sanitizeText(metadata.originalName) : null,
    mimeType: metadata.mimeType ? sanitizeText(metadata.mimeType) : null,
    filePath: metadata.filePath ? sanitizeText(metadata.filePath) : null,
  };
}

/**
 * Validate and sanitize company name
 */
export function sanitizeCompanyName(input: string | null | undefined): string | null {
  const sanitized = sanitizeText(input);
  if (!sanitized) return null;

  // Company names should be 2-100 characters
  if (sanitized.length < 2 || sanitized.length > 100) {
    return null;
  }

  return sanitized;
}

export const sanitizationUtils = {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeJson,
  sanitizeFileMetadata,
  sanitizeCompanyName,
};
