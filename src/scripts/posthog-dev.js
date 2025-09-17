// PostHog dev mode script - simplified version without imports
function initDev() {
  console.log("[PostHog] Dev mode: logging events only (no network)");
  // In dev mode, we'll just log events to console
  window.posthogTracker = {
    track: (event, properties) => {
      console.log("[PostHog Dev]", event, properties);
    },
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDev);
} else {
  initDev();
}
