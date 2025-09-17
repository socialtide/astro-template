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

    // Global tracking functions made available by our tracking utilities
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
    trackFreeAuditEngaged?: (
      action: "started" | "completed",
      properties?: Record<string, any>,
    ) => void;
    trackCalendarEngaged?: (
      action: "clicked" | "booked",
      properties?: Record<string, any>,
    ) => void;
    trackLeadMagnetDownloaded?: (
      resourceName: string,
      properties?: Record<string, any>,
    ) => void;
  }
}

// PostHog configuration options interface
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
      [key: string]: boolean;
    };
  };
  autocapture?: boolean;
  disable_session_recording?: boolean;
  opt_out_capturing_by_default?: boolean;
  loaded?: (posthog: any) => void;
}

// Event properties interface for type safety
export interface EventProperties {
  // Common properties that should be included in most events
  page_path?: string;
  page_title?: string;
  section?: string;

  // Form-related properties
  form_id?: string;
  field_name?: string;

  // CTA-related properties
  cta_text?: string;

  // Content-related properties
  content_type?: string;
  content_id?: string;

  // Business-specific properties
  segment?: string;
  action?: string;
  resource_name?: string;

  // UTM and attribution
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;

  // Any additional custom properties
  [key: string]: string | number | boolean | undefined;
}

export {};
