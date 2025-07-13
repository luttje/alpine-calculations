import { parseLocaleNumber } from '../src/index.js'
import { mockLocale } from './localization-mock.js';

mockLocale('en-US')

describe('parseLocaleNumber', () => {
  describe('Basic functionality', () => {
    test('should parse simple integer strings', () => {
      expect(parseLocaleNumber('123')).toBe(123);
      expect(parseLocaleNumber('0')).toBe(0);
      expect(parseLocaleNumber('999')).toBe(999);
    });

    test('should parse simple decimal strings', () => {
      expect(parseLocaleNumber('123.45')).toBe(123.45);
      expect(parseLocaleNumber('0.5')).toBe(0.5);
      expect(parseLocaleNumber('999.999')).toBe(999.999);
    });

    test('should handle negative numbers', () => {
      expect(parseLocaleNumber('-123')).toBe(-123);
      expect(parseLocaleNumber('-123.45')).toBe(-123.45);
      expect(parseLocaleNumber('-0.5')).toBe(-0.5);
    });

    test('should handle positive sign', () => {
      expect(parseLocaleNumber('+123')).toBe(123);
      expect(parseLocaleNumber('+123.45')).toBe(123.45);
      expect(parseLocaleNumber('+0.5')).toBe(0.5);
    });

    test('should handle whitespace', () => {
      expect(parseLocaleNumber('  123  ')).toBe(123);
      expect(parseLocaleNumber('  123.45  ')).toBe(123.45);
      expect(parseLocaleNumber('  -123.45  ')).toBe(-123.45);
    });
  });

  describe('US locale (en-US)', () => {
    test('should parse US formatted numbers with thousands separators', () => {
      expect(parseLocaleNumber('1,234', 'en-US')).toBe(1234);
      expect(parseLocaleNumber('1,234.56', 'en-US')).toBe(1234.56);
      expect(parseLocaleNumber('1,234,567', 'en-US')).toBe(1234567);
      expect(parseLocaleNumber('1,234,567.89', 'en-US')).toBe(1234567.89);
    });

    test('should handle negative US formatted numbers', () => {
      expect(parseLocaleNumber('-1,234.56', 'en-US')).toBe(-1234.56);
      expect(parseLocaleNumber('-1,234,567.89', 'en-US')).toBe(-1234567.89);
    });
  });

  describe('German locale (de-DE)', () => {
    test('should parse German formatted numbers', () => {
      expect(parseLocaleNumber('1.234', 'de-DE')).toBe(1234);
      expect(parseLocaleNumber('1.234,56', 'de-DE')).toBe(1234.56);
      expect(parseLocaleNumber('1.234.567', 'de-DE')).toBe(1234567);
      expect(parseLocaleNumber('1.234.567,89', 'de-DE')).toBe(1234567.89);
    });

    test('should handle negative German formatted numbers', () => {
      expect(parseLocaleNumber('-1.234,56', 'de-DE')).toBe(-1234.56);
      expect(parseLocaleNumber('-1.234.567,89', 'de-DE')).toBe(-1234567.89);
    });
  });

  describe('French locale (fr-FR)', () => {
    test('should parse French formatted numbers with space separators', () => {
      expect(parseLocaleNumber('1 234', 'fr-FR')).toBe(1234);
      expect(parseLocaleNumber('1 234,56', 'fr-FR')).toBe(1234.56);
      expect(parseLocaleNumber('1 234 567', 'fr-FR')).toBe(1234567);
      expect(parseLocaleNumber('1 234 567,89', 'fr-FR')).toBe(1234567.89);
    });

    test('should handle negative French formatted numbers', () => {
      expect(parseLocaleNumber('-1 234,56', 'fr-FR')).toBe(-1234.56);
      expect(parseLocaleNumber('-1 234 567,89', 'fr-FR')).toBe(-1234567.89);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should return NaN for invalid inputs', () => {
      expect(parseLocaleNumber('abc')).toBeNaN();
      expect(parseLocaleNumber('12abc')).toBeNaN();
      expect(parseLocaleNumber('abc123')).toBeNaN();
      expect(parseLocaleNumber('12.34.56')).toBeNaN();
    });

    test('should return NaN for empty or whitespace strings', () => {
      expect(parseLocaleNumber('')).toBeNaN();
      expect(parseLocaleNumber('   ')).toBeNaN();
      expect(parseLocaleNumber('\t\n')).toBeNaN();
    });

    test('should return NaN for non-string inputs', () => {
      expect(parseLocaleNumber(null)).toBeNaN();
      expect(parseLocaleNumber(undefined)).toBeNaN();
      expect(parseLocaleNumber(123)).toBeNaN();
      expect(parseLocaleNumber({})).toBeNaN();
      expect(parseLocaleNumber([])).toBeNaN();
    });

    test('should handle multiple decimal separators correctly', () => {
      // These should be invalid in most locales
      expect(parseLocaleNumber('12.34.56', 'en-US')).toBeNaN();
      expect(parseLocaleNumber('12,34,56', 'de-DE')).toBeNaN();
    });

    test('should handle decimal-only inputs', () => {
      expect(parseLocaleNumber('.5', 'en-US')).toBe(0.5);
      expect(parseLocaleNumber(',5', 'de-DE')).toBe(0.5);
      expect(parseLocaleNumber('-.5', 'en-US')).toBe(-0.5);
    });
  });

  describe('Default locale behavior', () => {
    beforeEach(() => {
      navigator.language = 'en-US';
    });

    test('should use navigator.language when no locale specified', () => {
      expect(parseLocaleNumber('1,234.56')).toBe(1234.56);
    });

    test('should override default locale when specified', () => {
      navigator.language = 'en-US';
      expect(parseLocaleNumber('1.234,56', 'de-DE')).toBe(1234.56);
    });
  });

  describe('Special numeric cases', () => {
    test('should handle very large numbers', () => {
      expect(parseLocaleNumber('999,999,999.99', 'en-US')).toBe(999999999.99);
      expect(parseLocaleNumber('999.999.999,99', 'de-DE')).toBe(999999999.99);
    });

    test('should handle very small decimals', () => {
      expect(parseLocaleNumber('0.0001', 'en-US')).toBe(0.0001);
      expect(parseLocaleNumber('0,0001', 'de-DE')).toBe(0.0001);
    });

    test('should handle scientific notation if supported', () => {
      // Note: This might not work with all locale implementations
      expect(parseLocaleNumber('1e5')).toBe(100000);
      expect(parseLocaleNumber('1.23e-4')).toBe(0.000123);
    });
  });
});

describe('Performance and edge cases', () => {
  test('should handle very long number strings', () => {
    const longNumber = '1' + ',234'.repeat(100) + '.56';
    const result = parseLocaleNumber(longNumber, 'en-US');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('should handle numbers with many decimal places', () => {
    const preciseNumber = '123.123456789012345';
    const result = parseLocaleNumber(preciseNumber, 'en-US');
    expect(result).toBeCloseTo(123.123456789012345);
  });

  test('should handle zero with different formats', () => {
    expect(parseLocaleNumber('0', 'en-US')).toBe(0);
    expect(parseLocaleNumber('0.0', 'en-US')).toBe(0);
    expect(parseLocaleNumber('0,0', 'de-DE')).toBe(0);
    expect(parseLocaleNumber('-0', 'en-US')).toBe(-0);
  });
});
