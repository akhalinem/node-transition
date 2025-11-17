/**
 * Validates if a string is a valid email address.
 * @param str - The string to validate
 * @returns True if the string is a valid email, false otherwise
 * @example
 * ```ts
 * isEmail('test@example.com'); // true
 * isEmail('invalid.email'); // false
 * ```
 */
export function isEmail(str: string): boolean;

/**
 * Validates if a string is a valid URL.
 * @param str - The string to validate
 * @returns True if the string is a valid URL, false otherwise
 * @example
 * ```ts
 * isURL('https://example.com'); // true
 * isURL('example.com'); // true
 * isURL('not a url'); // false
 * ```
 */
export function isURL(str: string): boolean;

/**
 * Validates if a string is a valid UUID (v1-v5).
 * @param str - The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 * @example
 * ```ts
 * isUUID('550e8400-e29b-41d4-a716-446655440000'); // true
 * isUUID('not-a-uuid'); // false
 * ```
 */
export function isUUID(str: string): boolean;

/**
 * Checks if a string is empty (has zero length).
 * @param str - The string to check
 * @returns True if the string is empty, false otherwise
 * @example
 * ```ts
 * isEmpty(''); // true
 * isEmpty('hello'); // false
 * ```
 */
export function isEmpty(str: string): boolean;

/**
 * Checks if a string has at least a minimum length.
 * @param str - The string to check
 * @param min - The minimum required length
 * @returns True if the string length is >= min, false otherwise
 * @example
 * ```ts
 * hasMinLength('hello', 3); // true
 * hasMinLength('hi', 5); // false
 * ```
 */
export function hasMinLength(str: string, min: number): boolean;
