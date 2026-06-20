import { describe, expect, it } from "vitest";
import { valueBand, leadProps, sectionOf } from "./posthog-tracking";

describe("valueBand", () => {
  it("buckets typical amounts", () => {
    expect(valueBand(0)).toBe("0");
    expect(valueBand(49)).toBe("1-99");
    expect(valueBand(150)).toBe("100-249");
    expect(valueBand(750)).toBe("500-999");
    expect(valueBand(3200)).toBe("2500-4999");
    expect(valueBand(9001)).toBe("5000+");
  });
  it("handles invalid input", () => {
    expect(valueBand(NaN)).toBe("unknown");
    expect(valueBand(-5)).toBe("unknown");
  });
});

describe("leadProps", () => {
  it("applies required-field defaults", () => {
    const p = leadProps({});
    expect(p.lead_type).toBe("contact");
    expect(p.lead_source).toBe("unknown");
  });
  it("passes through provided fields and omits undefined optionals", () => {
    const p = leadProps({ lead_type: "assessment", lead_source: "readiness", entry_point: "hero", tier: "pro" });
    expect(p).toMatchObject({ lead_type: "assessment", lead_source: "readiness", entry_point: "hero", tier: "pro" });
    expect("value_band" in p).toBe(false);
  });
  it("falls back to last CTA source for entry_point", () => {
    sessionStorage.setItem("posthog_last_cta_source", "footer__book");
    expect(leadProps({ lead_type: "contact", lead_source: "contact_form" }).entry_point).toBe("footer__book");
    sessionStorage.clear();
  });
});

describe("sectionOf", () => {
  it("returns the nearest section attribute", () => {
    document.body.innerHTML = `<div data-track-section="hero"><a id="x" href="tel:1">call</a></div>`;
    expect(sectionOf(document.getElementById("x"))).toBe("hero");
  });
  it("returns unknown when none", () => {
    document.body.innerHTML = `<a id="y" href="tel:1">call</a>`;
    expect(sectionOf(document.getElementById("y"))).toBe("unknown");
  });
});
