// PostHog initialization script
import { initializeTracking } from "../lib/posthog-tracking.js";

function waitForPosthog() {
  if (window.posthog && window.posthog.__loaded) {
    initializeTracking();
  } else {
    setTimeout(waitForPosthog, 100);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForPosthog);
} else {
  waitForPosthog();
}
