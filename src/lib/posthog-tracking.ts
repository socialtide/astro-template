// PostHog Tracking Library
// Production-only tracking with automatic data-attribute detection
// Features: forms, CTAs, content engagement, scroll depth, micro-conversions, exit intent, session quality

export interface TrackingProperties {
  [key: string]: string | number | boolean | undefined;
}

// Session data for quality tracking
const sessionData = {
  startTime: Date.now(),
  formsStarted: 0,
  ctasClicked: 0,
  maxScrollDepth: 0,
};

/**
 * Core tracking function with UTM attribution
 */
function track(event: string, properties?: TrackingProperties) {
  if (!window.posthog?.capture) return;

  try {
    const enrichedProps = {
      ...getAttributionData(),
      ...properties,
      page_path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    };

    window.posthog.capture(event, enrichedProps);
  } catch {
    // Silent fail
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

  // Core tracking
  trackForms();
  trackCTAs();
  trackContentEngagement();
  trackOnLoadEvents();

  // Enhanced conversion tracking
  initScrollDepthTracking();
  initMicroConversions();
  initExitIntent();
  initSessionQuality();

  if (!import.meta.env.PROD) {
    console.log("[PostHog] Tracking initialized (dev-log)");
    console.log("[PostHog] Features: forms, CTAs, content, scroll, micro-conversions, exit intent, session quality");
  }
}

// =============================================================================
// FORM TRACKING
// =============================================================================

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
      sessionData.formsStarted++;
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

// =============================================================================
// CTA TRACKING (with source slug for attribution)
// =============================================================================

function trackCTAs() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null;
      if (!target) return;
      const el = target.closest("[data-track-cta]") as HTMLElement | null;
      if (!el) return;
      const ctaText = el.getAttribute("data-track-cta");
      if (!ctaText) return;
      const section = el.getAttribute("data-track-section") || "unknown";

      // Generate source slug for attribution
      const slug = `${section}__${ctaText.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "")}`;

      // For internal links, append ?source= parameter for attribution
      if (el instanceof HTMLAnchorElement) {
        const href = el.href;
        try {
          const url = new URL(href, window.location.origin);
          const isInternal = url.hostname === window.location.hostname;
          if (isInternal && !url.searchParams.has("source")) {
            url.searchParams.set("source", slug);
            el.href = url.toString();
          }
        } catch {
          // Invalid URL, skip modification
        }
      }

      // Store last CTA source in sessionStorage for form attribution
      try {
        sessionStorage.setItem("posthog_last_cta_source", slug);
      } catch {
        // sessionStorage not available
      }

      track("cta_clicked", {
        cta_text: ctaText,
        section,
        source_slug: slug,
      });

      sessionData.ctasClicked++;
    },
    true,
  );
}

// =============================================================================
// CONTENT ENGAGEMENT TRACKING
// =============================================================================

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
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
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

// =============================================================================
// PAGE-LOAD EVENTS
// =============================================================================

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

// =============================================================================
// SCROLL DEPTH TRACKING
// =============================================================================

function getScrollDepth(): number {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) return 100;
  return Math.round((window.scrollY / scrollHeight) * 100);
}

function initScrollDepthTracking() {
  const depths = [25, 50, 75, 100];
  const trackedDepths = new Set<number>();
  const startTime = Date.now();

  function checkDepth() {
    const currentDepth = getScrollDepth();

    // Update max scroll depth for session tracking
    if (currentDepth > sessionData.maxScrollDepth) {
      sessionData.maxScrollDepth = currentDepth;
    }

    depths.forEach((depth) => {
      if (currentDepth >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        track("scroll_depth", {
          depth,
          time_to_depth_ms: Date.now() - startTime,
        });
      }
    });
  }

  window.addEventListener("scroll", throttle(checkDepth, 200), { passive: true });
}

// =============================================================================
// MICRO-CONVERSIONS (phone, email, external links)
// =============================================================================

function initMicroConversions() {
  document.addEventListener(
    "click",
    (e) => {
      const link = (e.target as Element).closest("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.href;
      if (!href) return;

      // Phone clicks
      if (href.startsWith("tel:")) {
        track("phone_click", {});
        return;
      }

      // Email clicks
      if (href.startsWith("mailto:")) {
        track("email_click", {});
        return;
      }

      // External link clicks
      try {
        const url = new URL(href, window.location.origin);
        if (url.hostname !== window.location.hostname) {
          track("external_link_click", {
            url: href,
            domain: url.hostname,
            link_text: link.textContent?.trim().slice(0, 100) || "",
          });
        }
      } catch {
        // Invalid URL, skip
      }
    },
    true,
  );
}

// =============================================================================
// EXIT INTENT DETECTION
// =============================================================================

function initExitIntent() {
  let exitIntentFired = false;

  document.addEventListener("mouseout", (e) => {
    // Only fire once per page
    if (exitIntentFired) return;

    // Check if mouse left viewport at the top
    if (e.clientY <= 0) {
      exitIntentFired = true;

      // Check if user is in a form
      const formInProgress = !!document.querySelector(
        "form[data-track-form]:focus-within"
      );

      track("exit_intent", {
        time_on_page_ms: Math.round(performance.now()),
        scroll_depth: getScrollDepth(),
        form_in_progress: formInProgress,
      });
    }
  });
}

// =============================================================================
// SESSION QUALITY TRACKING
// =============================================================================

function initSessionQuality() {
  // Track session end on page unload
  window.addEventListener("beforeunload", () => {
    const timeOnPage = Date.now() - sessionData.startTime;
    const isBounce = timeOnPage < 30000;

    track("session_ended", {
      total_time_ms: timeOnPage,
      forms_started: sessionData.formsStarted,
      ctas_clicked: sessionData.ctasClicked,
      max_scroll_depth: sessionData.maxScrollDepth,
      is_bounce: isBounce,
    });
  });
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Simple throttle function for scroll events
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
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

  // Get last CTA source for form attribution
  let lastCtaSource: string | undefined;
  try {
    lastCtaSource = sessionStorage.getItem("posthog_last_cta_source") || undefined;
  } catch {
    // sessionStorage not available
  }

  // Current UTM parameters (override persisted ones)
  const utm = {
    utm_source: urlParams.get("utm_source") || persistedUTM.utm_source,
    utm_medium: urlParams.get("utm_medium") || persistedUTM.utm_medium,
    utm_campaign: urlParams.get("utm_campaign") || persistedUTM.utm_campaign,
    utm_content: urlParams.get("utm_content") || persistedUTM.utm_content,
    utm_term: urlParams.get("utm_term") || persistedUTM.utm_term,
    source: urlParams.get("source") || lastCtaSource, // CTA source or ForX page source
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
