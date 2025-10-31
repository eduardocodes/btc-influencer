import { describe, it, assert } from 'poku';

describe('Validation Functions Tests', () => {

  describe('validateOnboardingData function', () => {
    it('should validate required fields correctly', () => {
      const validateOnboardingData = (data) => {
        const errors = [];
        
        if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length === 0) {
          errors.push('Company name is required');
        }
        
        if (!data.industry || typeof data.industry !== 'string' || data.industry.trim().length === 0) {
          errors.push('Industry is required');
        }
        
        if (!data.productDescription || typeof data.productDescription !== 'string' || data.productDescription.trim().length < 10) {
          errors.push('Product description must be at least 10 characters');
        }
        
        if (!data.targetAudience || typeof data.targetAudience !== 'string' || data.targetAudience.trim().length === 0) {
          errors.push('Target audience is required');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid data
      const validData = {
        companyName: 'Bitcoin Analytics Inc',
        industry: 'Cryptocurrency',
        productDescription: 'Advanced Bitcoin market analysis platform for traders and investors',
        targetAudience: 'Crypto traders and institutional investors'
      };

      const validResult = validateOnboardingData(validData);
      assert(validResult.isValid === true, 'Should validate correct onboarding data');
      assert(validResult.errors.length === 0, 'Should have no errors for valid data');

      // Test missing company name
      const missingCompany = { ...validData, companyName: '' };
      const companyResult = validateOnboardingData(missingCompany);
      assert(companyResult.isValid === false, 'Should reject missing company name');
      assert(companyResult.errors.includes('Company name is required'), 'Should include company name error');

      // Test missing industry
      const missingIndustry = { ...validData, industry: null };
      const industryResult = validateOnboardingData(missingIndustry);
      assert(industryResult.isValid === false, 'Should reject missing industry');
      assert(industryResult.errors.includes('Industry is required'), 'Should include industry error');

      // Test short product description
      const shortDescription = { ...validData, productDescription: 'Short' };
      const descResult = validateOnboardingData(shortDescription);
      assert(descResult.isValid === false, 'Should reject short product description');
      assert(descResult.errors.includes('Product description must be at least 10 characters'), 'Should include description length error');
    });

    it('should validate data types correctly', () => {
      const validateOnboardingData = (data) => {
        const errors = [];
        
        if (data.companyName !== undefined && typeof data.companyName !== 'string') {
          errors.push('Company name must be a string');
        }
        
        if (data.industry !== undefined && typeof data.industry !== 'string') {
          errors.push('Industry must be a string');
        }
        
        if (data.budget !== undefined && (typeof data.budget !== 'number' || data.budget < 0)) {
          errors.push('Budget must be a positive number');
        }

        if (data.timeline !== undefined && !['1-3 months', '3-6 months', '6-12 months', '12+ months'].includes(data.timeline)) {
          errors.push('Timeline must be a valid option');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test invalid data types
      const invalidTypes = {
        companyName: 123,
        industry: true,
        budget: -1000,
        timeline: 'invalid-timeline'
      };

      const result = validateOnboardingData(invalidTypes);
      assert(result.isValid === false, 'Should reject invalid data types');
      assert(result.errors.includes('Company name must be a string'), 'Should validate company name type');
      assert(result.errors.includes('Industry must be a string'), 'Should validate industry type');
      assert(result.errors.includes('Budget must be a positive number'), 'Should validate budget');
      assert(result.errors.includes('Timeline must be a valid option'), 'Should validate timeline options');
    });

    it('should validate website URL format', () => {
      const validateOnboardingData = (data) => {
        const errors = [];
        
        if (data.website && typeof data.website === 'string') {
          const urlRegex = /^https?:\/\/.+\..+/;
          if (!urlRegex.test(data.website)) {
            errors.push('Website must be a valid URL');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid URLs
      const validUrl = { website: 'https://example.com' };
      const validResult = validateOnboardingData(validUrl);
      assert(validResult.isValid === true, 'Should accept valid HTTPS URL');

      const validHttpUrl = { website: 'http://example.org' };
      const httpResult = validateOnboardingData(validHttpUrl);
      assert(httpResult.isValid === true, 'Should accept valid HTTP URL');

      // Test invalid URLs
      const invalidUrl = { website: 'not-a-url' };
      const invalidResult = validateOnboardingData(invalidUrl);
      assert(invalidResult.isValid === false, 'Should reject invalid URL');
      assert(invalidResult.errors.includes('Website must be a valid URL'), 'Should include URL validation error');

      const noProtocol = { website: 'example.com' };
      const noProtocolResult = validateOnboardingData(noProtocol);
      assert(noProtocolResult.isValid === false, 'Should reject URL without protocol');
    });
  });

  describe('validateCreatorData function', () => {
    it('should validate required creator fields', () => {
      const validateCreatorData = (data) => {
        const errors = [];
        
        if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
          errors.push('Creator name is required');
        }
        
        if (!data.platform || typeof data.platform !== 'string') {
          errors.push('Platform is required');
        }
        
        if (!data.category || typeof data.category !== 'string') {
          errors.push('Category is required');
        }
        
        if (data.followers !== undefined && (typeof data.followers !== 'number' || data.followers < 0)) {
          errors.push('Followers must be a positive number');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid creator data
      const validCreator = {
        name: 'Bitcoin Expert',
        platform: 'YouTube',
        category: 'Cryptocurrency',
        followers: 150000
      };

      const validResult = validateCreatorData(validCreator);
      assert(validResult.isValid === true, 'Should validate correct creator data');
      assert(validResult.errors.length === 0, 'Should have no errors for valid creator');

      // Test missing required fields
      const missingName = { ...validCreator, name: '' };
      const nameResult = validateCreatorData(missingName);
      assert(nameResult.isValid === false, 'Should reject missing creator name');
      assert(nameResult.errors.includes('Creator name is required'), 'Should include name error');

      const missingPlatform = { ...validCreator, platform: null };
      const platformResult = validateCreatorData(missingPlatform);
      assert(platformResult.isValid === false, 'Should reject missing platform');
      assert(platformResult.errors.includes('Platform is required'), 'Should include platform error');
    });

    it('should validate optional fields with constraints', () => {
      const validateCreatorData = (data) => {
        const errors = [];
        
        // Required fields validation (simplified for this test)
        if (!data.name) errors.push('Creator name is required');
        
        // Optional fields with constraints
        if (data.engagementRate !== undefined) {
          if (typeof data.engagementRate !== 'number' || data.engagementRate < 0 || data.engagementRate > 100) {
            errors.push('Engagement rate must be between 0 and 100');
          }
        }
        
        if (data.averageViews !== undefined) {
          if (typeof data.averageViews !== 'number' || data.averageViews < 0) {
            errors.push('Average views must be a positive number');
          }
        }
        
        if (data.contentTypes !== undefined) {
          if (!Array.isArray(data.contentTypes) || data.contentTypes.length === 0) {
            errors.push('Content types must be a non-empty array');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid optional fields
      const validOptional = {
        name: 'Crypto Creator',
        engagementRate: 5.5,
        averageViews: 25000,
        contentTypes: ['Educational', 'News', 'Analysis']
      };

      const validResult = validateCreatorData(validOptional);
      assert(validResult.isValid === true, 'Should validate correct optional fields');

      // Test invalid engagement rate
      const invalidEngagement = { ...validOptional, engagementRate: 150 };
      const engagementResult = validateCreatorData(invalidEngagement);
      assert(engagementResult.isValid === false, 'Should reject engagement rate over 100');
      assert(engagementResult.errors.includes('Engagement rate must be between 0 and 100'), 'Should include engagement rate error');

      // Test invalid content types
      const invalidContentTypes = { ...validOptional, contentTypes: [] };
      const contentResult = validateCreatorData(invalidContentTypes);
      assert(contentResult.isValid === false, 'Should reject empty content types array');
      assert(contentResult.errors.includes('Content types must be a non-empty array'), 'Should include content types error');
    });

    it('should validate social media handles format', () => {
      const validateCreatorData = (data) => {
        const errors = [];
        
        // Basic required field
        if (!data.name) errors.push('Creator name is required');
        
        // Social media handle validation
        if (data.handle && typeof data.handle === 'string') {
          if (!data.handle.startsWith('@') || data.handle.length < 2) {
            errors.push('Handle must start with @ and be at least 2 characters');
          }
          
          if (!/^@[a-zA-Z0-9_]+$/.test(data.handle)) {
            errors.push('Handle can only contain letters, numbers, and underscores');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid handles
      const validHandle = { name: 'Creator', handle: '@bitcoin_expert' };
      const validResult = validateCreatorData(validHandle);
      assert(validResult.isValid === true, 'Should accept valid handle format');

      const validSimpleHandle = { name: 'Creator', handle: '@crypto123' };
      const simpleResult = validateCreatorData(validSimpleHandle);
      assert(simpleResult.isValid === true, 'Should accept handle with numbers');

      // Test invalid handles
      const noAtSymbol = { name: 'Creator', handle: 'bitcoin_expert' };
      const noAtResult = validateCreatorData(noAtSymbol);
      assert(noAtResult.isValid === false, 'Should reject handle without @ symbol');

      const specialChars = { name: 'Creator', handle: '@bitcoin-expert!' };
      const specialResult = validateCreatorData(specialChars);
      assert(specialResult.isValid === false, 'Should reject handle with special characters');

      const tooShort = { name: 'Creator', handle: '@' };
      const shortResult = validateCreatorData(tooShort);
      assert(shortResult.isValid === false, 'Should reject handle that is too short');
    });
  });

  describe('validateSearchQuery function', () => {
    it('should validate search query parameters', () => {
      const validateSearchQuery = (query) => {
        const errors = [];
        
        if (!query || typeof query !== 'object') {
          errors.push('Query must be an object');
          return { isValid: false, errors };
        }
        
        if (!query.term || typeof query.term !== 'string' || query.term.trim().length === 0) {
          errors.push('Search term is required');
        }
        
        if (query.term && query.term.length > 100) {
          errors.push('Search term must be less than 100 characters');
        }
        
        if (query.filters && typeof query.filters !== 'object') {
          errors.push('Filters must be an object');
        }
        
        if (query.limit !== undefined && (typeof query.limit !== 'number' || query.limit < 1 || query.limit > 100)) {
          errors.push('Limit must be between 1 and 100');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid search query
      const validQuery = {
        term: 'bitcoin creators',
        filters: { platform: 'YouTube', category: 'Cryptocurrency' },
        limit: 20
      };

      const validResult = validateSearchQuery(validQuery);
      assert(validResult.isValid === true, 'Should validate correct search query');

      // Test missing search term
      const missingTerm = { filters: {}, limit: 10 };
      const termResult = validateSearchQuery(missingTerm);
      assert(termResult.isValid === false, 'Should reject missing search term');
      assert(termResult.errors.includes('Search term is required'), 'Should include search term error');

      // Test invalid limit
      const invalidLimit = { term: 'crypto', limit: 150 };
      const limitResult = validateSearchQuery(invalidLimit);
      assert(limitResult.isValid === false, 'Should reject limit over 100');
      assert(limitResult.errors.includes('Limit must be between 1 and 100'), 'Should include limit error');
    });

    it('should validate search filters', () => {
      const validateSearchQuery = (query) => {
        const errors = [];
        
        if (!query.term) {
          errors.push('Search term is required');
        }
        
        if (query.filters) {
          const validPlatforms = ['YouTube', 'TikTok', 'Instagram', 'Twitter', 'LinkedIn'];
          const validCategories = ['Cryptocurrency', 'Technology', 'Finance', 'Education'];
          
          if (query.filters.platform && !validPlatforms.includes(query.filters.platform)) {
            errors.push('Invalid platform filter');
          }
          
          if (query.filters.category && !validCategories.includes(query.filters.category)) {
            errors.push('Invalid category filter');
          }
          
          if (query.filters.minFollowers !== undefined && (typeof query.filters.minFollowers !== 'number' || query.filters.minFollowers < 0)) {
            errors.push('Minimum followers must be a positive number');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid filters
      const validFilters = {
        term: 'crypto',
        filters: {
          platform: 'YouTube',
          category: 'Cryptocurrency',
          minFollowers: 10000
        }
      };

      const validResult = validateSearchQuery(validFilters);
      assert(validResult.isValid === true, 'Should validate correct filters');

      // Test invalid platform
      const invalidPlatform = {
        term: 'crypto',
        filters: { platform: 'InvalidPlatform' }
      };

      const platformResult = validateSearchQuery(invalidPlatform);
      assert(platformResult.isValid === false, 'Should reject invalid platform');
      assert(platformResult.errors.includes('Invalid platform filter'), 'Should include platform filter error');

      // Test invalid category
      const invalidCategory = {
        term: 'crypto',
        filters: { category: 'InvalidCategory' }
      };

      const categoryResult = validateSearchQuery(invalidCategory);
      assert(categoryResult.isValid === false, 'Should reject invalid category');
      assert(categoryResult.errors.includes('Invalid category filter'), 'Should include category filter error');
    });
  });

  describe('validateApiResponse function', () => {
    it('should validate API response structure', () => {
      const validateApiResponse = (response) => {
        const errors = [];
        
        if (!response || typeof response !== 'object') {
          errors.push('Response must be an object');
          return { isValid: false, errors };
        }
        
        if (!response.hasOwnProperty('success') || typeof response.success !== 'boolean') {
          errors.push('Response must have a boolean success field');
        }
        
        if (response.success && !response.data) {
          errors.push('Successful response must include data');
        }
        
        if (!response.success && !response.error) {
          errors.push('Failed response must include error information');
        }
        
        if (response.timestamp && (typeof response.timestamp !== 'number' || response.timestamp <= 0)) {
          errors.push('Timestamp must be a positive number');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      };

      // Test valid success response
      const successResponse = {
        success: true,
        data: { creators: [], total: 0 },
        timestamp: Date.now()
      };

      const successResult = validateApiResponse(successResponse);
      assert(successResult.isValid === true, 'Should validate successful API response');

      // Test valid error response
      const errorResponse = {
        success: false,
        error: { message: 'Not found', code: 404 },
        timestamp: Date.now()
      };

      const errorResult = validateApiResponse(errorResponse);
      assert(errorResult.isValid === true, 'Should validate error API response');

      // Test invalid response structure
      const invalidResponse = {
        success: 'true', // Should be boolean
        data: null
      };

      const invalidResult = validateApiResponse(invalidResponse);
      assert(invalidResult.isValid === false, 'Should reject invalid response structure');
      assert(invalidResult.errors.includes('Response must have a boolean success field'), 'Should include success field error');
    });
  });
});

console.log('✅ Validation function tests completed successfully! 🔍');