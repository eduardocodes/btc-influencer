'use client'

import { sendGAEvent } from '@next/third-parties/google'

// Utility functions for Google Analytics events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    sendGAEvent('event', eventName, parameters || {})
  }
}

// Common event tracking functions
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href
  })
}

export const trackUserAction = (action: string, category: string, label?: string, value?: number) => {
  trackEvent(action, {
    event_category: category,
    event_label: label,
    value: value
  })
}

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  })
}

export const trackInfluencerView = (influencerId: string, influencerName: string) => {
  trackEvent('influencer_view', {
    influencer_id: influencerId,
    influencer_name: influencerName
  })
}

export const trackSubscription = (planType: string, action: 'start' | 'cancel' | 'upgrade') => {
  trackEvent('subscription', {
    plan_type: planType,
    action: action
  })
}

export const trackOnboardingStep = (step: string, completed: boolean) => {
  trackEvent('onboarding_step', {
    step_name: step,
    completed: completed
  })
}