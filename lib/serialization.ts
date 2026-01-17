/**
 * Serialization utilities for handling special types
 * that cannot be directly serialized to JSON
 */

/**
 * Convert BigInt values to strings for JSON serialization
 *
 * @param obj - Any object that may contain BigInt values
 * @returns The same object with BigInt values converted to strings
 *
 * @example
 * const document = await db.document.findUnique({ where: { id } });
 * return NextResponse.json(serializeBigInt(document));
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item)) as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const serialized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'bigint') {
        serialized[key] = value.toString();
      } else if (value !== null && typeof value === 'object') {
        serialized[key] = serializeBigInt(value);
      } else {
        serialized[key] = value;
      }
    }

    return serialized as T;
  }

  return obj;
}

/**
 * JSON.stringify replacer function for BigInt values
 *
 * @example
 * const data = { fileSize: 1234567890n };
 * const json = JSON.stringify(data, bigIntReplacer);
 */
export function bigIntReplacer(_key: string, value: any): any {
  return typeof value === 'bigint' ? value.toString() : value;
}

/**
 * Safe JSON parse that handles BigInt string values
 *
 * @param json - JSON string to parse
 * @param bigIntKeys - Array of keys that should be parsed as BigInt
 * @returns Parsed object with specified keys as BigInt
 *
 * @example
 * const data = parseWithBigInt('{"fileSize":"1234567890"}', ['fileSize']);
 * // data.fileSize will be a BigInt
 */
export function parseWithBigInt<T = any>(
  json: string,
  bigIntKeys: string[] = []
): T {
  const parsed = JSON.parse(json);

  if (bigIntKeys.length === 0) {
    return parsed;
  }

  const convert = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => convert(item));
    }

    if (typeof obj === 'object') {
      const converted: any = {};

      for (const [key, value] of Object.entries(obj)) {
        if (bigIntKeys.includes(key) && typeof value === 'string') {
          converted[key] = BigInt(value);
        } else if (value !== null && typeof value === 'object') {
          converted[key] = convert(value);
        } else {
          converted[key] = value;
        }
      }

      return converted;
    }

    return obj;
  };

  return convert(parsed);
}

/**
 * Type guard to check if a value is a BigInt
 */
export function isBigInt(value: any): value is bigint {
  return typeof value === 'bigint';
}

/**
 * Safely convert a value to BigInt
 * Returns null if conversion fails
 */
export function toBigInt(value: any): bigint | null {
  try {
    if (typeof value === 'bigint') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'string') {
      return BigInt(value);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format BigInt as human-readable file size
 *
 * @example
 * formatFileSize(1234567890n) // "1.23 GB"
 */
export function formatFileSize(bytes: bigint | number | null | undefined): string {
  if (bytes === null || bytes === undefined) {
    return 'Unknown';
  }

  const size = typeof bytes === 'bigint' ? Number(bytes) : bytes;

  if (size === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const formattedSize = (size / Math.pow(1024, i)).toFixed(2);

  return `${formattedSize} ${units[i]}`;
}
