import crypto from 'crypto';

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE62_LENGTH = BASE62_CHARS.length;

/**
 * Encodes a numeric ID into a Base62 string
 */
export function encodeBase62(num: bigint | number): string {
  let n = typeof num === 'number' ? BigInt(num) : num;
  if (n === 0n) return BASE62_CHARS[0];

  let result = '';
  while (n > 0n) {
    const remainder = Number(n % BigInt(BASE62_LENGTH));
    result = BASE62_CHARS[remainder] + result;
    n = n / BigInt(BASE62_LENGTH);
  }
  return result;
}

/**
 * Decodes a Base62 string back to a numeric ID
 */
export function decodeBase62(str: string): bigint {
  let result = 0n;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base62 character: ${char}`);
    }
    result = result * BigInt(BASE62_LENGTH) + BigInt(index);
  }
  return result;
}

/**
 * Generates a cryptographically random Base62 short code of specified length (default 6-7 chars)
 */
export function generateRandomShortCode(length: number = 6): string {
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    code += BASE62_CHARS[byte % BASE62_LENGTH];
  }
  return code;
}

/**
 * Reserved keywords that cannot be used as custom aliases
 */
export const RESERVED_ALIASES = new Set([
  'api',
  'app',
  'dashboard',
  'auth',
  'login',
  'register',
  'logout',
  'signup',
  'signin',
  'admin',
  'analytics',
  'settings',
  'terms',
  'privacy',
  'about',
  'help',
  'docs',
  'api-docs',
  'swagger',
  'health',
  'static',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

/**
 * Validates whether a custom alias is allowed
 */
export function isValidCustomAlias(alias: string): { valid: boolean; reason?: string } {
  if (!alias) {
    return { valid: false, reason: 'Alias cannot be empty' };
  }
  if (alias.length < 3 || alias.length > 30) {
    return { valid: false, reason: 'Alias must be between 3 and 30 characters long' };
  }
  const aliasPattern = /^[a-zA-Z0-9_-]+$/;
  if (!aliasPattern.test(alias)) {
    return { valid: false, reason: 'Alias can only contain alphanumeric characters, underscores, and hyphens' };
  }
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return { valid: false, reason: `Alias '${alias}' is a reserved system keyword` };
  }
  return { valid: true };
}
