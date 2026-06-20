/**
 * Integration test: verifies that initializeTracking() wires up initBookingTracking()
 * and initClickEvents() so that DOM click events reach posthog.capture.
 *
 * These listeners are delegated on `document` (capture phase) and persist after a
 * single init call, so we init once and reuse across tests in this suite.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { initializeTracking } from "./posthog-tracking";

// Stub posthog before init so the track() function can call capture.
beforeAll(() => {
  (window as any).posthog = { capture: vi.fn() };
  // Reset the init guard so initializeTracking() is not a no-op.
  delete (window as any).__stTrackingInit;
  initializeTracking();
});

describe("initializeTracking wiring", () => {
  it("booking_click: fires via initBookingTracking when a Calendly link is clicked", () => {
    (window as any).posthog.capture.mockClear();

    document.body.innerHTML = `
      <div data-track-section="hero">
        <a id="bk" href="https://calendly.com/acme/intro">Book</a>
      </div>
    `;

    const el = document.getElementById("bk")!;
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect((window as any).posthog.capture).toHaveBeenCalledWith(
      "booking_click",
      expect.objectContaining({ provider: "calendly", placement: "hero" }),
    );

    // Booking links must NOT also fire external_link_click (double-fire guard)
    expect(
      (window as any).posthog.capture.mock.calls.some(
        (c: any[]) => c[0] === "external_link_click",
      ),
    ).toBe(false);
  });

  it("click-declarative: fires via initClickEvents when data-track-click-event element is clicked", () => {
    (window as any).posthog.capture.mockClear();

    document.body.innerHTML = `
      <button id="cta" data-track-click-event="cta_demo" data-prop-tier="pro">x</button>
    `;

    const el = document.getElementById("cta")!;
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect((window as any).posthog.capture).toHaveBeenCalledWith(
      "cta_demo",
      expect.objectContaining({ tier: "pro" }),
    );
  });

  it("exposes window.stTrackLead, which fires a standardized lead_generated", () => {
    (window as any).posthog.capture.mockClear?.();
    expect(typeof (window as any).stTrackLead).toBe("function");
    (window as any).stTrackLead({ lead_type: "assessment", lead_source: "readiness_assessment" });
    const call = (window as any).posthog.capture.mock.calls.find(
      (c: any[]) => c[0] === "lead_generated",
    );
    expect(call).toBeTruthy();
    expect(call[1]).toMatchObject({ lead_type: "assessment", lead_source: "readiness_assessment" });
  });
});
