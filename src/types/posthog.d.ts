// PostHog TypeScript definitions for consistent type safety across all client sites

declare global {
  interface Window {
    posthog?: {
      // Core tracking functions
      capture: (event: string, properties?: Record<string, any>) => void;

      // User identification
      identify: (distinctId: string, properties?: Record<string, any>) => void;
      set: (properties: Record<string, any>) => void;
      reset: () => void;

      // Feature flags
      isFeatureEnabled: (flag: string) => boolean;
      getFeatureFlag: (flag: string) => string | boolean | undefined;
      onFeatureFlags: (callback: () => void) => void;

      // User properties
      register: (properties: Record<string, any>) => void;
      unregister: (property: string) => void;

      // Session and user info
      get_distinct_id: () => string;
      get_session_id: () => string;

      // Session recording
      startSessionRecording: () => void;
      stopSessionRecording: () => void;
      sessionRecordingStarted: () => boolean;

      // Surveys (if enabled)
      getSurveys: () => any[];
      getActiveMatchingSurveys: () => any[];
      renderSurvey: (surveyId: string, selector?: string) => void;

      // Configuration and debugging
      set_config: (config: Record<string, any>) => void;
      debug?: boolean;
      __loaded?: boolean;
    };

    // Global tracking function from posthog-tracking.ts
    stTrack?: (event: string, properties?: TrackingProperties) => void;

    // Legacy tracking functions (deprecated, use stTrack instead)
    trackCtaClicked?: (
      ctaText: string,
      section: string,
      properties?: Record<string, any>,
    ) => void;
    trackFormStarted?: (
      formId: string,
      properties?: Record<string, any>,
    ) => void;
    trackFormSubmitted?: (
      formId: string,
      properties?: Record<string, any>,
    ) => void;
  }
}

// =============================================================================
// TRACKING PROPERTIES
// =============================================================================

/**
 * Base tracking properties interface
 */
export interface TrackingProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Common properties included in all events (auto-enriched)
 */
export interface CommonEventProperties {
  page_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  source?: string; // CTA source slug or ForX page source
  referrer?: string;
}

// =============================================================================
// FORM EVENTS
// =============================================================================

export interface FormStartedProperties extends CommonEventProperties {
  form_id: string;
}

export interface FormSubmittedProperties extends CommonEventProperties {
  form_id: string;
}

export interface FormProgressProperties extends CommonEventProperties {
  form_id: string;
  progress: 25 | 50 | 75;
}

export interface FormAbandonProperties extends CommonEventProperties {
  form_id: string;
  progress: number;
}

// =============================================================================
// CTA EVENTS
// =============================================================================

export interface CtaClickedProperties extends CommonEventProperties {
  cta_text: string;
  section: string;
  source_slug: string; // Format: section__cta-text-slug
}

// =============================================================================
// CONTENT ENGAGEMENT EVENTS
// =============================================================================

export interface ContentEngagedProperties extends CommonEventProperties {
  content_id: string;
  content_type: string;
}

// =============================================================================
// SCROLL DEPTH EVENTS
// =============================================================================

export interface ScrollDepthProperties extends CommonEventProperties {
  depth: 25 | 50 | 75 | 100;
  time_to_depth_ms: number;
}

// =============================================================================
// MICRO-CONVERSION EVENTS
// =============================================================================

export interface PhoneClickProperties extends CommonEventProperties {
  phone: string;
}

export interface EmailClickProperties extends CommonEventProperties {
  email: string;
}

export interface ExternalLinkClickProperties extends CommonEventProperties {
  url: string;
  domain: string;
  link_text: string;
}

// =============================================================================
// EXIT INTENT EVENTS
// =============================================================================

export interface ExitIntentProperties extends CommonEventProperties {
  time_on_page_ms: number;
  scroll_depth: number;
  form_in_progress: boolean;
}

// =============================================================================
// SESSION QUALITY EVENTS
// =============================================================================

export interface SessionEndedProperties extends CommonEventProperties {
  pages_viewed: number;
  total_time_ms: number;
  forms_started: number;
  ctas_clicked: number;
  max_scroll_depth: number;
  is_bounce: boolean;
}

// =============================================================================
// CUSTOM BUSINESS EVENTS
// =============================================================================

export interface LeadGeneratedProperties extends CommonEventProperties {
  source: string;
  service?: string;
}

// =============================================================================
// EVENT MAP (for type-safe event tracking)
// =============================================================================

export interface EventMap {
  // Form events
  form_started: FormStartedProperties;
  form_submitted: FormSubmittedProperties;
  form_progress: FormProgressProperties;
  form_abandon: FormAbandonProperties;

  // CTA events
  cta_clicked: CtaClickedProperties;

  // Content events
  content_engaged: ContentEngagedProperties;

  // Scroll events
  scroll_depth: ScrollDepthProperties;

  // Micro-conversion events
  phone_click: PhoneClickProperties;
  email_click: EmailClickProperties;
  external_link_click: ExternalLinkClickProperties;

  // Exit intent
  exit_intent: ExitIntentProperties;

  // Session quality
  session_ended: SessionEndedProperties;

  // Business events
  lead_generated: LeadGeneratedProperties;
}

// =============================================================================
// POSTHOG CONFIGURATION
// =============================================================================

export interface PostHogConfig {
  api_host?: string;
  person_profiles?: "always" | "never" | "identified_only";
  capture_pageview?: boolean;
  capture_pageleave?: boolean;
  session_recording?: {
    maskAllInputs?: boolean;
    maskInputOptions?: {
      password?: boolean;
      email?: boolean;
      [key: string]: boolean | undefined;
    };
  };
  autocapture?: boolean;
  disable_session_recording?: boolean;
  opt_out_capturing_by_default?: boolean;
  loaded?: (posthog: any) => void;
}

export {};
