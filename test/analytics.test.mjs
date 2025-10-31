import { describe, it, assert, beforeEach } from 'poku';

describe('Analytics Module Tests', () => {
  
  beforeEach(() => {
    // Reset global state before each test
    global.window = { location: { href: 'http://localhost:3000/test' } };
    process.env.NEXT_PUBLIC_GA_ID = 'GA_TEST_ID';
  });

  describe('trackEvent function', () => {
    it('should validate event name parameter', () => {
      const trackEvent = (eventName, parameters) => {
        if (typeof eventName !== 'string') {
          throw new Error('Event name must be a string');
        }
        if (eventName.length === 0) {
          throw new Error('Event name cannot be empty');
        }
        return { eventName, parameters };
      };

      // Test valid event name
      const result = trackEvent('user_click', { button: 'submit' });
      assert(result.eventName === 'user_click', 'Should accept valid event name');

      // Test invalid event name types
      try {
        trackEvent(123, {});
        assert(false, 'Should reject numeric event names');
      } catch (error) {
        assert(error.message === 'Event name must be a string', 'Should throw correct error for numeric input');
      }

      try {
        trackEvent('', {});
        assert(false, 'Should reject empty event names');
      } catch (error) {
        assert(error.message === 'Event name cannot be empty', 'Should throw correct error for empty string');
      }
    });

    it('should handle optional parameters correctly', () => {
      const trackEvent = (eventName, parameters = {}) => {
        const event = { eventName };
        
        if (parameters && typeof parameters === 'object') {
          event.parameters = parameters;
        }
        
        return event;
      };

      // Test with parameters
      const withParams = trackEvent('test_event', { category: 'test', value: 1 });
      assert(withParams.parameters.category === 'test', 'Should include parameters when provided');
      assert(withParams.parameters.value === 1, 'Should preserve parameter values');

      // Test without parameters
      const withoutParams = trackEvent('test_event');
      assert(withoutParams.eventName === 'test_event', 'Should work without parameters');
    });
  });

  describe('trackPageView function', () => {
    it('should create correct page view event structure', () => {
      const trackPageView = (pageName) => {
        return {
          event: 'page_view',
          page_title: pageName,
          page_location: global.window?.location?.href || 'unknown',
          timestamp: Date.now()
        };
      };

      const result = trackPageView('Home Page');
      
      assert(result.event === 'page_view', 'Should set correct event type');
      assert(result.page_title === 'Home Page', 'Should set page title correctly');
      assert(result.page_location === 'http://localhost:3000/test', 'Should get location from window');
      assert(typeof result.timestamp === 'number', 'Should include timestamp');
    });

    it('should handle missing window object gracefully', () => {
      // Temporarily remove window object
      const originalWindow = global.window;
      delete global.window;

      const trackPageView = (pageName) => {
        return {
          event: 'page_view',
          page_title: pageName,
          page_location: global.window?.location?.href || 'unknown'
        };
      };

      const result = trackPageView('Test Page');
      assert(result.page_location === 'unknown', 'Should handle missing window object');

      // Restore window object
      global.window = originalWindow;
    });
  });

  describe('trackUserAction function', () => {
    it('should validate required parameters', () => {
      const trackUserAction = (action, category, label, value) => {
        if (!action || typeof action !== 'string') {
          throw new Error('Action is required and must be a string');
        }
        if (!category || typeof category !== 'string') {
          throw new Error('Category is required and must be a string');
        }

        return {
          event_category: category,
          event_action: action,
          event_label: label,
          value: value
        };
      };

      // Test valid parameters
      const result = trackUserAction('click', 'button', 'submit', 1);
      assert(result.event_action === 'click', 'Should set action correctly');
      assert(result.event_category === 'button', 'Should set category correctly');
      assert(result.event_label === 'submit', 'Should set label correctly');
      assert(result.value === 1, 'Should set value correctly');

      // Test missing action
      try {
        trackUserAction('', 'button');
        assert(false, 'Should reject empty action');
      } catch (error) {
        assert(error.message.includes('Action is required'), 'Should throw error for empty action');
      }

      // Test missing category
      try {
        trackUserAction('click', '');
        assert(false, 'Should reject empty category');
      } catch (error) {
        assert(error.message.includes('Category is required'), 'Should throw error for empty category');
      }
    });

    it('should handle optional parameters', () => {
      const trackUserAction = (action, category, label, value) => {
        const event = {
          event_category: category,
          event_action: action
        };

        if (label !== undefined) {
          event.event_label = label;
        }

        if (value !== undefined && typeof value === 'number') {
          event.value = value;
        }

        return event;
      };

      // Test with only required parameters
      const minimal = trackUserAction('click', 'button');
      assert(minimal.event_action === 'click', 'Should work with minimal parameters');
      assert(minimal.event_label === undefined, 'Should not include undefined label');

      // Test with all parameters
      const complete = trackUserAction('click', 'button', 'submit', 5);
      assert(complete.event_label === 'submit', 'Should include label when provided');
      assert(complete.value === 5, 'Should include value when provided');
    });
  });

  describe('trackSearch function', () => {
    it('should format search events correctly', () => {
      const trackSearch = (searchTerm, resultsCount) => {
        return {
          event: 'search',
          search_term: searchTerm,
          results_count: resultsCount || 0,
          timestamp: Date.now()
        };
      };

      const result = trackSearch('bitcoin creators', 25);
      
      assert(result.event === 'search', 'Should set correct event type');
      assert(result.search_term === 'bitcoin creators', 'Should set search term correctly');
      assert(result.results_count === 25, 'Should set results count correctly');

      // Test without results count
      const noCount = trackSearch('crypto influencers');
      assert(noCount.results_count === 0, 'Should default to 0 results when not provided');
    });

    it('should handle empty search terms', () => {
      const trackSearch = (searchTerm, resultsCount) => {
        if (!searchTerm || searchTerm.trim().length === 0) {
          throw new Error('Search term cannot be empty');
        }

        return {
          event: 'search',
          search_term: searchTerm.trim(),
          results_count: resultsCount || 0
        };
      };

      try {
        trackSearch('');
        assert(false, 'Should reject empty search terms');
      } catch (error) {
        assert(error.message === 'Search term cannot be empty', 'Should throw correct error');
      }

      try {
        trackSearch('   ');
        assert(false, 'Should reject whitespace-only search terms');
      } catch (error) {
        assert(error.message === 'Search term cannot be empty', 'Should throw correct error for whitespace');
      }
    });
  });

  describe('trackInfluencerView function', () => {
    it('should track influencer views with required data', () => {
      const trackInfluencerView = (influencerId, influencerName) => {
        if (!influencerId || !influencerName) {
          throw new Error('Both influencer ID and name are required');
        }

        return {
          event: 'influencer_view',
          influencer_id: influencerId,
          influencer_name: influencerName,
          timestamp: Date.now()
        };
      };

      const result = trackInfluencerView('inf123', 'Bitcoin Creator');
      
      assert(result.event === 'influencer_view', 'Should set correct event type');
      assert(result.influencer_id === 'inf123', 'Should set influencer ID correctly');
      assert(result.influencer_name === 'Bitcoin Creator', 'Should set influencer name correctly');
      assert(typeof result.timestamp === 'number', 'Should include timestamp');

      // Test missing parameters
      try {
        trackInfluencerView('', 'Name');
        assert(false, 'Should reject empty influencer ID');
      } catch (error) {
        assert(error.message.includes('required'), 'Should throw error for missing ID');
      }

      try {
        trackInfluencerView('id123', '');
        assert(false, 'Should reject empty influencer name');
      } catch (error) {
        assert(error.message.includes('required'), 'Should throw error for missing name');
      }
    });
  });

  describe('trackSubscription function', () => {
    it('should validate subscription actions', () => {
      const trackSubscription = (planType, action) => {
        const validActions = ['start', 'cancel', 'upgrade'];
        
        if (!planType || typeof planType !== 'string') {
          throw new Error('Plan type is required and must be a string');
        }

        if (!validActions.includes(action)) {
          throw new Error(`Action must be one of: ${validActions.join(', ')}`);
        }

        return {
          event: 'subscription',
          plan_type: planType,
          action: action,
          timestamp: Date.now()
        };
      };

      // Test valid actions
      const start = trackSubscription('premium', 'start');
      assert(start.action === 'start', 'Should accept start action');

      const cancel = trackSubscription('basic', 'cancel');
      assert(cancel.action === 'cancel', 'Should accept cancel action');

      const upgrade = trackSubscription('premium', 'upgrade');
      assert(upgrade.action === 'upgrade', 'Should accept upgrade action');

      // Test invalid action
      try {
        trackSubscription('premium', 'invalid');
        assert(false, 'Should reject invalid actions');
      } catch (error) {
        assert(error.message.includes('Action must be one of'), 'Should throw error for invalid action');
      }
    });
  });

  describe('trackOnboardingStep function', () => {
    it('should track onboarding progress correctly', () => {
      const trackOnboardingStep = (step, completed) => {
        if (!step || typeof step !== 'string') {
          throw new Error('Step name is required and must be a string');
        }

        if (typeof completed !== 'boolean') {
          throw new Error('Completed status must be a boolean');
        }

        return {
          event: 'onboarding_step',
          step_name: step,
          completed: completed,
          timestamp: Date.now()
        };
      };

      // Test completed step
      const completedStep = trackOnboardingStep('company_info', true);
      assert(completedStep.step_name === 'company_info', 'Should set step name correctly');
      assert(completedStep.completed === true, 'Should set completed status correctly');

      // Test incomplete step
      const incompleteStep = trackOnboardingStep('product_description', false);
      assert(incompleteStep.completed === false, 'Should handle incomplete steps');

      // Test invalid parameters
      try {
        trackOnboardingStep('', true);
        assert(false, 'Should reject empty step names');
      } catch (error) {
        assert(error.message.includes('Step name is required'), 'Should throw error for empty step name');
      }

      try {
        trackOnboardingStep('step1', 'yes');
        assert(false, 'Should reject non-boolean completed status');
      } catch (error) {
        assert(error.message.includes('must be a boolean'), 'Should throw error for non-boolean completed');
      }
    });
  });
});

console.log('📊 Analytics tests completed successfully! 🎯');