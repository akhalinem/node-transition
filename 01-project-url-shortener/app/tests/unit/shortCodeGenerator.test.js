/**
 * Unit Tests: Short Code Generator
 */

const {
  generateRandomCode,
  isValidShortCode,
} = require('../../src/utils/shortCodeGenerator');

describe('Short Code Generator', () => {
  describe('generateRandomCode', () => {
    test('should generate code of default length (6)', () => {
      const code = generateRandomCode();
      expect(code).toHaveLength(6);
    });

    test('should generate code of specified length', () => {
      const code = generateRandomCode(8);
      expect(code).toHaveLength(8);
    });

    test('should only contain Base62 characters', () => {
      const code = generateRandomCode(20);
      expect(code).toMatch(/^[0-9a-zA-Z]+$/);
    });

    test('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRandomCode());
      }
      // Should have high uniqueness
      expect(codes.size).toBeGreaterThan(95);
    });
  });

  describe('isValidShortCode', () => {
    test('should accept valid Base62 code', () => {
      expect(isValidShortCode('abc123')).toBe(true);
      expect(isValidShortCode('XYZ789')).toBe(true);
    });

    test('should accept code at minimum length (3)', () => {
      expect(isValidShortCode('abc')).toBe(true);
    });

    test('should accept code at maximum length (10)', () => {
      expect(isValidShortCode('abcdefghij')).toBe(true);
    });

    test('should reject code that is too short', () => {
      expect(isValidShortCode('ab')).toBe(false);
    });

    test('should reject code that is too long', () => {
      expect(isValidShortCode('abcdefghijk')).toBe(false);
    });

    test('should reject code with special characters', () => {
      expect(isValidShortCode('abc-123')).toBe(false);
      expect(isValidShortCode('abc_123')).toBe(false);
      expect(isValidShortCode('abc@123')).toBe(false);
    });

    test('should reject undefined or null', () => {
      expect(isValidShortCode()).toBe(false);
      expect(isValidShortCode(null)).toBe(false);
    });

    test('should reject non-string input', () => {
      expect(isValidShortCode(123)).toBe(false);
      expect(isValidShortCode({})).toBe(false);
    });
  });
});
