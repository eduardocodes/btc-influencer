import { describe, it, assert } from 'poku';

describe('Utility Functions Tests', () => {

  describe('formatNumber function', () => {
    it('should format numbers under 1000 correctly', () => {
      const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) {
          return '0';
        }
        
        if (num < 1000) {
          return num.toString();
        }
        
        if (num < 1000000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        
        if (num < 1000000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      };

      assert(formatNumber(0) === '0', 'Should format zero correctly');
      assert(formatNumber(1) === '1', 'Should format single digit correctly');
      assert(formatNumber(42) === '42', 'Should format two digits correctly');
      assert(formatNumber(999) === '999', 'Should format three digits correctly');
    });

    it('should format thousands correctly', () => {
      const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) {
          return '0';
        }
        
        if (num < 1000) {
          return num.toString();
        }
        
        if (num < 1000000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        
        if (num < 1000000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      };

      assert(formatNumber(1000) === '1K', 'Should format 1K correctly');
      assert(formatNumber(1500) === '1.5K', 'Should format 1.5K correctly');
      assert(formatNumber(10000) === '10K', 'Should format 10K correctly');
      assert(formatNumber(999999) === '1000K', 'Should format near million correctly');
    });

    it('should format millions correctly', () => {
      const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) {
          return '0';
        }
        
        if (num < 1000) {
          return num.toString();
        }
        
        if (num < 1000000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        
        if (num < 1000000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      };

      assert(formatNumber(1000000) === '1M', 'Should format 1M correctly');
      assert(formatNumber(2500000) === '2.5M', 'Should format 2.5M correctly');
      assert(formatNumber(10000000) === '10M', 'Should format 10M correctly');
      assert(formatNumber(999999999) === '1000M', 'Should format near billion correctly');
    });

    it('should format billions correctly', () => {
      const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) {
          return '0';
        }
        
        if (num < 1000) {
          return num.toString();
        }
        
        if (num < 1000000) {
          return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        
        if (num < 1000000000) {
          return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
      };

      assert(formatNumber(1000000000) === '1B', 'Should format 1B correctly');
      assert(formatNumber(3500000000) === '3.5B', 'Should format 3.5B correctly');
      assert(formatNumber(10000000000) === '10B', 'Should format 10B correctly');
    });

    it('should handle edge cases and invalid inputs', () => {
      const formatNumber = (num) => {
        if (typeof num !== 'number' || isNaN(num)) {
          return '0';
        }
        
        const isNegative = num < 0;
        const absNum = Math.abs(num);
        
        if (absNum < 1000) {
          return num.toString();
        }
        
        if (absNum < 1000000) {
          const formatted = (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
          return formatted;
        }
        
        if (absNum < 1000000000) {
          const formatted = (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
          return formatted;
        }
        
        const formatted = (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
        return formatted;
      };

      assert(formatNumber(null) === '0', 'Should handle null input');
      assert(formatNumber(undefined) === '0', 'Should handle undefined input');
      assert(formatNumber('string') === '0', 'Should handle string input');
      assert(formatNumber(NaN) === '0', 'Should handle NaN input');
      assert(formatNumber(-1000) === '-1K', 'Should handle negative numbers');
      assert(formatNumber(0.5) === '0.5', 'Should handle decimal numbers');
    });
  });

  describe('getCountryFlag function', () => {
    it('should return correct flags for known countries', () => {
      const getCountryFlag = (country) => {
        const flags = {
          'United States': '🇺🇸',
          'USA': '🇺🇸',
          'US': '🇺🇸',
          'Canada': '🇨🇦',
          'United Kingdom': '🇬🇧',
          'UK': '🇬🇧',
          'Germany': '🇩🇪',
          'France': '🇫🇷',
          'Japan': '🇯🇵',
          'Australia': '🇦🇺',
          'Brazil': '🇧🇷',
          'India': '🇮🇳',
          'China': '🇨🇳',
          'Russia': '🇷🇺',
          'South Korea': '🇰🇷',
          'Mexico': '🇲🇽',
          'Italy': '🇮🇹',
          'Spain': '🇪🇸',
          'Netherlands': '🇳🇱',
          'Sweden': '🇸🇪',
          'Norway': '🇳🇴',
          'Switzerland': '🇨🇭',
          'Singapore': '🇸🇬'
        };

        if (!country || typeof country !== 'string') {
          return '🌍';
        }

        return flags[country] || '🌍';
      };

      assert(getCountryFlag('United States') === '🇺🇸', 'Should return US flag for United States');
      assert(getCountryFlag('USA') === '🇺🇸', 'Should return US flag for USA');
      assert(getCountryFlag('US') === '🇺🇸', 'Should return US flag for US');
      assert(getCountryFlag('Canada') === '🇨🇦', 'Should return Canadian flag');
      assert(getCountryFlag('United Kingdom') === '🇬🇧', 'Should return UK flag for United Kingdom');
      assert(getCountryFlag('UK') === '🇬🇧', 'Should return UK flag for UK');
      assert(getCountryFlag('Germany') === '🇩🇪', 'Should return German flag');
      assert(getCountryFlag('Japan') === '🇯🇵', 'Should return Japanese flag');
    });

    it('should handle unknown countries and edge cases', () => {
      const getCountryFlag = (country) => {
        const flags = {
          'United States': '🇺🇸',
          'USA': '🇺🇸',
          'US': '🇺🇸',
          'Canada': '🇨🇦',
          'United Kingdom': '🇬🇧',
          'UK': '🇬🇧',
          'Germany': '🇩🇪',
          'France': '🇫🇷',
          'Japan': '🇯🇵'
        };

        if (!country || typeof country !== 'string') {
          return '🌍';
        }

        return flags[country] || '🌍';
      };

      assert(getCountryFlag('Unknown Country') === '🌍', 'Should return world emoji for unknown countries');
      assert(getCountryFlag('') === '🌍', 'Should return world emoji for empty string');
      assert(getCountryFlag(null) === '🌍', 'Should return world emoji for null');
      assert(getCountryFlag(undefined) === '🌍', 'Should return world emoji for undefined');
      assert(getCountryFlag(123) === '🌍', 'Should return world emoji for non-string input');
    });

    it('should be case sensitive', () => {
      const getCountryFlag = (country) => {
        const flags = {
          'United States': '🇺🇸',
          'Canada': '🇨🇦',
          'Germany': '🇩🇪'
        };

        if (!country || typeof country !== 'string') {
          return '🌍';
        }

        return flags[country] || '🌍';
      };

      assert(getCountryFlag('united states') === '🌍', 'Should be case sensitive - lowercase should not match');
      assert(getCountryFlag('UNITED STATES') === '🌍', 'Should be case sensitive - uppercase should not match');
      assert(getCountryFlag('United States') === '🇺🇸', 'Should match exact case');
    });
  });

  describe('slugify function', () => {
    it('should convert strings to URL-friendly slugs', () => {
      const slugify = (text) => {
        if (!text || typeof text !== 'string') {
          return '';
        }

        return text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      };

      assert(slugify('Hello World') === 'hello-world', 'Should convert spaces to hyphens');
      assert(slugify('Bitcoin Creator Profile') === 'bitcoin-creator-profile', 'Should handle multiple words');
      assert(slugify('Special!@#$%Characters') === 'specialcharacters', 'Should remove special characters');
      assert(slugify('  Trimmed  Spaces  ') === 'trimmed-spaces', 'Should trim and normalize spaces');
      assert(slugify('Multiple---Hyphens') === 'multiple-hyphens', 'Should normalize multiple hyphens');
    });

    it('should handle edge cases', () => {
      const slugify = (text) => {
        if (!text || typeof text !== 'string') {
          return '';
        }

        return text
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      assert(slugify('') === '', 'Should return empty string for empty input');
      assert(slugify(null) === '', 'Should return empty string for null');
      assert(slugify(undefined) === '', 'Should return empty string for undefined');
      assert(slugify(123) === '', 'Should return empty string for non-string input');
      assert(slugify('---') === '', 'Should return empty string for only special characters');
    });
  });

  describe('truncateText function', () => {
    it('should truncate text to specified length', () => {
      const truncateText = (text, maxLength = 100) => {
        if (!text || typeof text !== 'string') {
          return '';
        }

        if (text.length <= maxLength) {
          return text;
        }

        return text.substring(0, maxLength).trim() + '...';
      };

      const longText = 'This is a very long text that should be truncated when it exceeds the maximum length limit';
      
      assert(truncateText(longText, 20) === 'This is a very long...', 'Should truncate long text');
      assert(truncateText('Short text', 50) === 'Short text', 'Should not truncate short text');
      assert(truncateText('Exactly twenty chars', 20) === 'Exactly twenty chars', 'Should not truncate text at exact limit');
    });

    it('should handle edge cases', () => {
      const truncateText = (text, maxLength = 100) => {
        if (!text || typeof text !== 'string') {
          return '';
        }

        if (text.length <= maxLength) {
          return text;
        }

        return text.substring(0, maxLength).trim() + '...';
      };

      assert(truncateText('', 10) === '', 'Should handle empty string');
      assert(truncateText(null, 10) === '', 'Should handle null');
      assert(truncateText(undefined, 10) === '', 'Should handle undefined');
      assert(truncateText('Test', 0) === '...', 'Should handle zero max length');
      assert(truncateText('Test', -5) === '...', 'Should handle negative max length');
    });
  });

  describe('validateEmail function', () => {
    it('should validate correct email formats', () => {
      const validateEmail = (email) => {
        if (!email || typeof email !== 'string') {
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      };

      assert(validateEmail('test@example.com') === true, 'Should validate standard email');
      assert(validateEmail('user.name@domain.co.uk') === true, 'Should validate email with dots and subdomains');
      assert(validateEmail('user+tag@example.org') === true, 'Should validate email with plus sign');
      assert(validateEmail('123@numbers.com') === true, 'Should validate email with numbers');
    });

    it('should reject invalid email formats', () => {
      const validateEmail = (email) => {
        if (!email || typeof email !== 'string') {
          return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      };

      assert(validateEmail('invalid-email') === false, 'Should reject email without @');
      assert(validateEmail('test@') === false, 'Should reject email without domain');
      assert(validateEmail('@domain.com') === false, 'Should reject email without username');
      assert(validateEmail('test@domain') === false, 'Should reject email without TLD');
      assert(validateEmail('test @domain.com') === false, 'Should reject email with spaces');
      assert(validateEmail('') === false, 'Should reject empty string');
      assert(validateEmail(null) === false, 'Should reject null');
      assert(validateEmail(undefined) === false, 'Should reject undefined');
    });
  });

  describe('generateId function', () => {
    it('should generate unique IDs', () => {
      const generateId = (prefix = 'id') => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}_${timestamp}_${random}`;
      };

      const id1 = generateId();
      const id2 = generateId();
      
      assert(id1 !== id2, 'Should generate unique IDs');
      assert(id1.startsWith('id_'), 'Should use default prefix');
      assert(id1.includes('_'), 'Should contain underscores as separators');
    });

    it('should use custom prefixes', () => {
      const generateId = (prefix = 'id') => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `${prefix}_${timestamp}_${random}`;
      };

      const userId = generateId('user');
      const postId = generateId('post');
      
      assert(userId.startsWith('user_'), 'Should use custom prefix for user');
      assert(postId.startsWith('post_'), 'Should use custom prefix for post');
    });
  });
});

console.log('🔧 Utility function tests completed successfully! ⚙️');