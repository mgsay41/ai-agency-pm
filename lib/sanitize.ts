/**
 * Input sanitization utilities
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe content
 * Note: This is a basic implementation. For production with rich text,
 * consider using a dedicated library on the client side.
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return "";

  // For now, strip all HTML tags for security
  // In production, you might want to use DOMPurify on the client side
  return stripHtmlTags(dirty.trim());
}

/**
 * Sanitize plain text (removes all HTML tags)
 * Use for fields that should never contain HTML
 */
export function sanitizePlainText(dirty: string | undefined | null): string {
  if (!dirty) return "";
  return stripHtmlTags(dirty.trim());
}

/**
 * Sanitize textarea input (allows basic formatting)
 * Use for description fields, notes, etc.
 */
export function sanitizeTextarea(dirty: string | undefined | null): string {
  if (!dirty) return "";

  // Strip all HTML tags for security
  return stripHtmlTags(dirty.trim());
}

/**
 * Sanitize form data object
 * Sanitizes all string values in an object
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  fieldsToSanitize: {
    html?: (keyof T)[];
    textarea?: (keyof T)[];
    plainText?: (keyof T)[];
  }
): T {
  const sanitized = { ...data };

  // Sanitize HTML fields
  fieldsToSanitize.html?.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeHtml(sanitized[field] as string) as T[keyof T];
    }
  });

  // Sanitize textarea fields
  fieldsToSanitize.textarea?.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeTextarea(sanitized[field] as string) as T[keyof T];
    }
  });

  // Sanitize plain text fields
  fieldsToSanitize.plainText?.forEach((field) => {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizePlainText(sanitized[field] as string) as T[keyof T];
    }
  });

  return sanitized;
}

/**
 * Escape special characters in string for safe display
 * Use when you need to display user input as-is without HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate URL to prevent javascript: and data: schemes
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const safeProtocols = ["http:", "https:", "mailto:"];
    return safeProtocols.includes(parsed.protocol);
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";

  const trimmed = url.trim();

  if (isSafeUrl(trimmed)) {
    return trimmed;
  }

  return "";
}
