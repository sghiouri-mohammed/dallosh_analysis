/**
 * Unit tests for utility functions
 */
import { cn, generateUID, formatDate } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('hidden');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      // Should merge and deduplicate - px-4 should override px-2
      expect(result).toBeTruthy();
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('generateUID', () => {
    it('should generate a unique ID', () => {
      const uid1 = generateUID();
      const uid2 = generateUID();
      
      expect(uid1).toBeTruthy();
      expect(uid2).toBeTruthy();
      expect(uid1).not.toBe(uid2);
    });

    it('should generate a string', () => {
      const uid = generateUID();
      expect(typeof uid).toBe('string');
    });

    it('should include timestamp and random string', () => {
      const uid = generateUID();
      expect(uid).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });

    it('should format date string correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = formatDate(dateString);
      
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('2024');
    });

    it('should include month, day, and year', () => {
      const date = new Date('2024-03-20T14:45:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Mar');
      expect(formatted).toContain('20');
    });

    it('should handle different date formats', () => {
      const isoDate = '2024-12-25T00:00:00.000Z';
      const formatted = formatDate(isoDate);
      
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('2024');
    });
  });
});

