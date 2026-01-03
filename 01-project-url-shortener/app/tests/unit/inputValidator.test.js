/**
 * Unit Tests: Input Validation
 */

const {
  validateUrl,
  validateCustomAlias,
  validateShortCode,
  sanitizeString,
  validateRequestSize,
} = require('../../src/utils/inputValidator');

describe('Input Validator - URL Validation', () => {
  test('should accept valid HTTP URL', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('http://example.com');
  });

  test('should accept valid HTTPS URL', () => {
    const result = validateUrl('https://example.com/path?query=value');
    expect(result.valid).toBe(true);
  });

  test('should reject URL without protocol', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('http://');
  });

  test('should reject missing URL', () => {
    const result = validateUrl();
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('should reject localhost URLs', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('localhost');
  });

  test('should reject 127.0.0.1', () => {
    const result = validateUrl('http://127.0.0.1/admin');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('localhost');
  });

  test('should reject private IP addresses (10.x.x.x)', () => {
    const result = validateUrl('http://10.0.0.1/test');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private');
  });

  test('should reject private IP addresses (192.168.x.x)', () => {
    const result = validateUrl('http://192.168.1.1/test');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('private');
  });

  test('should reject URL that is too long', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2050);
    const result = validateUrl(longUrl);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('maximum length');
  });

  test('should reject URL that is too short', () => {
    const result = validateUrl('http://a');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too short');
  });

  test('should trim whitespace from URL', () => {
    const result = validateUrl('  https://example.com  ');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
  });
});

describe('Input Validator - Custom Alias Validation', () => {
  test('should accept valid alias', () => {
    const result = validateCustomAlias('github');
    expect(result.valid).toBe(true);
    expect(result.alias).toBe('github');
  });

  test('should accept alias with numbers', () => {
    const result = validateCustomAlias('link2024');
    expect(result.valid).toBe(true);
  });

  test('should accept undefined (optional field)', () => {
    const result = validateCustomAlias();
    expect(result.valid).toBe(true);
  });

  test('should reject alias that is too short', () => {
    const result = validateCustomAlias('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 3');
  });

  test('should reject alias that is too long', () => {
    const result = validateCustomAlias('thisistoolong');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceed 10');
  });

  test('should reject alias with special characters', () => {
    const result = validateCustomAlias('my-link');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('letters and numbers');
  });

  test('should reject reserved words', () => {
    const reserved = ['api', 'admin', 'health', 'stats'];
    reserved.forEach(word => {
      const result = validateCustomAlias(word);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved');
    });
  });

  test('should trim whitespace from alias', () => {
    const result = validateCustomAlias('  mylink  ');
    expect(result.valid).toBe(true);
    expect(result.alias).toBe('mylink');
  });
});

describe('Input Validator - Short Code Validation', () => {
  test('should accept valid short code', () => {
    const result = validateShortCode('abc123');
    expect(result.valid).toBe(true);
    expect(result.shortCode).toBe('abc123');
  });

  test('should reject missing short code', () => {
    const result = validateShortCode();
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  test('should reject short code that is too short', () => {
    const result = validateShortCode('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid');
  });

  test('should reject short code that is too long', () => {
    const result = validateShortCode('abcdefghijk');
    expect(result.valid).toBe(false);
  });

  test('should reject short code with special characters', () => {
    const result = validateShortCode('abc@123');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });
});

describe('Input Validator - Request Size Validation', () => {
  test('should accept normal request size', () => {
    const body = { url: 'https://example.com', customAlias: 'test' };
    const result = validateRequestSize(body);
    expect(result.valid).toBe(true);
  });

  test('should reject oversized request', () => {
    const body = { data: 'x'.repeat(15000) };
    const result = validateRequestSize(body);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });
});

describe('Input Validator - String Sanitization', () => {
  test('should remove XSS characters', () => {
    const dirty = '<script>alert("xss")</script>';
    const clean = sanitizeString(dirty);
    expect(clean).not.toContain('<');
    expect(clean).not.toContain('>');
  });

  test('should trim whitespace', () => {
    const result = sanitizeString('  hello  ');
    expect(result).toBe('hello');
  });

  test('should handle non-string input', () => {
    const result = sanitizeString(123);
    expect(result).toBe('');
  });

  test('should limit length', () => {
    const longString = 'a'.repeat(2000);
    const result = sanitizeString(longString);
    expect(result.length).toBeLessThanOrEqual(1000);
  });
});
