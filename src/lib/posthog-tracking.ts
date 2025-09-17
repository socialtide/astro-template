// Simplified PostHog Tracking Library
// Production-only tracking with automatic data-attribute detection

export interface TrackingProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Core tracking function with UTM attribution
 * Only tracks in production environment
 */
function track(event: string, properties?: TrackingProperties) {
  try {
    const enrichedProps = {
      ...getAttributionData(),
      ...properties,
      page_path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    };

    if (import.meta.env.PROD && window.posthog) {
      window.posthog.capture(event, enrichedProps);
    } else {
      // Dev/logging mode: log what would be captured
      // eslint-disable-next-line no-console
      console.log("[PostHog][DEV] capture:", event, enrichedProps);
    }
  } catch (error) {
    if (!import.meta.env.PROD) {
      console.error(`[PostHog] Failed to track ${event}:`, error);
    }
  }
}

/**
 * Initialize automatic tracking for data-track-* attributes
 * Attribute names use dashes; values use underscores
 * Called after PostHog is loaded (prod) or immediately in dev for logging
 */
export function initializeTracking() {
  // Prevent double-init
  if ((window as any).__stTrackingInit) return;
  (window as any).__stTrackingInit = true;

  // Expose minimal global for rare custom events (e.g., lead_generated)
  (window as any).stTrack = track;

  // Track forms with data-track-form (delegated)
  trackForms();

  // Track CTAs with data-track-cta (delegated)
  trackCTAs();

  // Track content engagement with data-track-content
  trackContentEngagement();

  // Track page-load events via data attributes
  trackOnLoadEvents();

  if (!import.meta.env.PROD) {
    console.log(`[PostHog] Automatic tracking initialized (dev-log)`);
    console.log("[PostHog] Global stTrack function available");
  }
}

/**
 * Track form interactions
 */
function trackForms() {
  const startedForms = new WeakSet<EventTarget & Element>();
  const progressState = new WeakMap<
    HTMLElement,
    { p25: boolean; p50: boolean; p75: boolean; last: number }
  >();

  // Track form start on first focus within the form
  document.addEventListener(
    "focusin",
    (e) => {
      const target = e.target as Element | null;
      if (!target) return;
      const form = target.closest("form");
      if (!form) return;
      const hasAttr = form.hasAttribute("data-track-form");
      if (!hasAttr) return;
      if (startedForms.has(form)) return;
      startedForms.add(form);
      const formId = form.getAttribute("data-track-form") || "unknown";
      track("form_started", { form_id: formId });
    },
    true,
  );

  // Track form submission
  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      const hasAttr = form.hasAttribute("data-track-form");
      if (!hasAttr) return;
      const formId = form.getAttribute("data-track-form") || "unknown";
      track("form_submitted", { form_id: formId });
    },
    true,
  );

  // Advanced form tracking: progress milestones
  const handleProgressEvent = (el: Element | null) => {
    if (!el) return;
    const form = el.closest("form") as HTMLFormElement | null;
    if (!form) return;
    if (
      !form.hasAttribute("data-track-form") ||
      !form.hasAttribute("data-track-form-advanced")
    )
      return;
    const formId = form.getAttribute("data-track-form") || "unknown";
    const required = form.querySelectorAll("[required]");
    if (!required.length) return;
    const filled = Array.from(required).filter((field: any) => {
      if (field.type === "checkbox") {
        return (
          form.querySelectorAll(`input[name="${field.name}"]:checked`).length >
          0
        );
      }
      return (field.value || "").toString().trim() !== "";
    }).length;
    const progress = Math.round((filled / required.length) * 100);
    const state = progressState.get(form) || {
      p25: false,
      p50: false,
      p75: false,
      last: 0,
    };
    progressState.set(form, { ...state, last: progress });
    if (progress >= 25 && !state.p25) {
      track("form_progress", { form_id: formId, progress: 25 });
      state.p25 = true;
    }
    if (progress >= 50 && !state.p50) {
      track("form_progress", { form_id: formId, progress: 50 });
      state.p50 = true;
    }
    if (progress >= 75 && !state.p75) {
      track("form_progress", { form_id: formId, progress: 75 });
      state.p75 = true;
    }
    progressState.set(form, state);
  };

  document.addEventListener(
    "input",
    (e) => handleProgressEvent(e.target as Element),
    true,
  );
  document.addEventListener(
    "change",
    (e) => handleProgressEvent(e.target as Element),
    true,
  );

  // Abandon tracking on unload
  window.addEventListener("beforeunload", () => {
    document
      .querySelectorAll("form[data-track-form][data-track-form-advanced]")
      .forEach((form) => {
        const state = progressState.get(form as HTMLElement);
        const last = state?.last ?? 0;
        if (last > 0 && last < 100) {
          const formId =
            (form as HTMLElement).getAttribute("data-track-form") || "unknown";
          track("form_abandon", { form_id: formId, progress: last });
        }
      });
  });
}

/**
 * Track CTA clicks
 */
function trackCTAs() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest("[data-track-cta]") as Element | null;
      if (!el) return;
      const ctaText = el.getAttribute("data-track-cta");
      if (!ctaText) return;
      const section = el.getAttribute("data-track-section") || "unknown";
      track("cta_clicked", {
        cta_text: ctaText,
        section,
      });
    },
    true,
  );
}

/**
 * Track content engagement using intersection observer
 */
function trackContentEngagement() {
  const selector = "[data-track-content]";

  if (!window.IntersectionObserver) {
    return;
  }

  const observed = new WeakSet<Element>();
  const timers = new WeakMap<Element, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as Element;
        if (!entry.isIntersecting) return;

        // Avoid multiple timers for the same element
        if (timers.has(el)) return;

        const contentId = el.getAttribute("data-track-content");
        if (!contentId) return;
        const contentType = el.getAttribute("data-content-type") || "section";

        const timeoutId = window.setTimeout(() => {
          // Confirm still reasonably in view
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            track("content_engaged", {
              content_id: contentId,
              content_type: contentType,
            });
            observer.unobserve(el);
          }
          timers.delete(el);
        }, 2000);

        timers.set(el, timeoutId);
      });
    },
    {
      threshold: 0.25,
      rootMargin: "0px",
    },
  );

  // Observe any current elements
  document.querySelectorAll(selector).forEach((el) => {
    if (!observed.has(el)) {
      observer.observe(el);
      observed.add(el);
    }
  });

  // Watch for dynamically-added content sections
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(selector)) {
          if (!observed.has(node)) {
            observer.observe(node);
            observed.add(node);
          }
        }
        node.querySelectorAll?.(selector).forEach((child) => {
          if (!observed.has(child)) {
            observer.observe(child);
            observed.add(child);
          }
        });
      });
    }
  });
  mo.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });
}

/**
 * Track page-load events via data attributes
 * Usage: <div data-track-event="lead_generated" data-prop-type="audit_confirmation" data-prop-value="3000" />
 */
function trackOnLoadEvents() {
  const nodes = document.querySelectorAll("[data-track-event]");
  nodes.forEach((el) => {
    const event = el.getAttribute("data-track-event");
    if (!event) return;
    const props: Record<string, any> = {};
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("data-prop-")) {
        const key = attr.name.replace("data-prop-", "");
        const val = attr.value;
        if (val === "true" || val === "false") {
          props[key] = val === "true";
        } else if (!Number.isNaN(Number(val)) && val.trim() !== "") {
          props[key] = Number(val);
        } else {
          props[key] = val;
        }
      }
    }
    track(event, props);
  });
}

/**
 * Get UTM and attribution data for all events
 */
function getAttributionData(): TrackingProperties {
  if (typeof window === "undefined") {
    return {};
  }

  // Get current URL parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Get persisted UTM data from session storage
  const persistedUTM = getPersistedUTMParams();

  // Current UTM parameters (override persisted ones)
  const utm = {
    utm_source: urlParams.get("utm_source") || persistedUTM.utm_source,
    utm_medium: urlParams.get("utm_medium") || persistedUTM.utm_medium,
    utm_campaign: urlParams.get("utm_campaign") || persistedUTM.utm_campaign,
    utm_content: urlParams.get("utm_content") || persistedUTM.utm_content,
    utm_term: urlParams.get("utm_term") || persistedUTM.utm_term,
    source: urlParams.get("source"), // ForX page source tracking
    referrer: document.referrer || "direct",
  };

  // Persist new UTM data if present
  if (hasNewUTMData(utm, persistedUTM)) {
    persistUTMParams(utm);
  }

  return utm;
}

/**
 * Get persisted UTM parameters from session storage
 */
function getPersistedUTMParams(): Record<string, string | undefined> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = sessionStorage.getItem("utm_params");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Store UTM parameters in session storage
 */
function persistUTMParams(utmParams: Record<string, string | undefined>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Only store if we have UTM parameters
    const hasUTM = Object.values(utmParams).some(
      (value) => value !== undefined,
    );
    if (hasUTM) {
      sessionStorage.setItem("utm_params", JSON.stringify(utmParams));
    }
  } catch (error) {
    if (!import.meta.env.PROD) {
      console.warn("[PostHog] Failed to persist UTM params:", error);
    }
  }
}

/**
 * Check if there's new UTM data to persist
 */
function hasNewUTMData(
  current: Record<string, any>,
  persisted: Record<string, any>,
): boolean {
  return Object.entries(current).some(
    ([key, value]) => value && value !== persisted[key],
  );
}

// Export track function for manual use
export { track };

// Extend window interface for TypeScript
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: any) => void;
      init: (key: string, options?: any) => void;
      identify: (userId: string, properties?: any) => void;
      isFeatureEnabled: (flag: string) => boolean;
      __loaded?: boolean;
    };
    stTrack?: (event: string, properties?: TrackingProperties) => void;
  }
}
