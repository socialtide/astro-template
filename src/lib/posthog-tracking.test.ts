import { describe, expect, it } from "vitest";
import { valueBand } from "./posthog-tracking";

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
