// PostHog initialization script
function waitForPosthog() {
  if (window.posthog && window.posthog.__loaded) {
    console.log("PostHog loaded successfully");
  } else {
    setTimeout(waitForPosthog, 100);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForPosthog);
} else {
  waitForPosthog();
}
