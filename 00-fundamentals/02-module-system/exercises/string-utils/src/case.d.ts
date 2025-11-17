/**
 * Converts a string to uppercase.
 * @param str - The string to convert
 * @returns The uppercase string
 * @example
 * ```ts
 * toUpperCase('hello'); // 'HELLO'
 * ```
 */
export function toUpperCase(str: string): string;

/**
 * Converts a string to lowercase.
 * @param str - The string to convert
 * @returns The lowercase string
 * @example
 * ```ts
 * toLowerCase('HELLO'); // 'hello'
 * ```
 */
export function toLowerCase(str: string): string;

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize
 * @returns The capitalized string
 * @example
 * ```ts
 * capitalize('hello world'); // 'Hello world'
 * ```
 */
export function capitalize(str: string): string;

/**
 * Converts a string to camelCase.
 * @param str - The string to convert
 * @returns The camelCase string
 * @example
 * ```ts
 * camelCase('hello-world'); // 'helloWorld'
 * camelCase('hello_world'); // 'helloWorld'
 * camelCase('hello world'); // 'helloWorld'
 * ```
 */
export function camelCase(str: string): string;

/**
 * Converts a string to kebab-case.
 * @param str - The string to convert
 * @returns The kebab-case string
 * @example
 * ```ts
 * kebabCase('helloWorld'); // 'hello-world'
 * kebabCase('hello_world'); // 'hello-world'
 * kebabCase('hello world'); // 'hello-world'
 * ```
 */
export function kebabCase(str: string): string;

/**
 * Converts a string to snake_case.
 * @param str - The string to convert
 * @returns The snake_case string
 * @example
 * ```ts
 * snakeCase('helloWorld'); // 'hello_world'
 * snakeCase('hello-world'); // 'hello_world'
 * snakeCase('hello world'); // 'hello_world'
 * ```
 */
export function snakeCase(str: string): string;
