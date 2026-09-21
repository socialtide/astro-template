import { describe, expect, it, vi } from "vitest";
import { createFlowTracker } from "./flow-tracking";

function makeTracker(extra = {}) {
  const emit = vi.fn();
  const t = createFlowTracker({ flowId: "pkg", flowType: "configurator", totalSteps: 4, emit, ...extra });
  return { t, emit };
}

describe("createFlowTracker", () => {
  it("emits flow_started once", () => {
    const { t, emit } = makeTracker();
    t.started();
    t.started();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith("flow_started", { flow_id: "pkg", flow_type: "configurator" });
  });

  it("emits step_viewed with index + total", () => {
    const { t, emit } = makeTracker();
    t.stepViewed(2, "needs");
    expect(emit).toHaveBeenCalledWith("flow_step_viewed", {
      flow_id: "pkg", flow_type: "configurator", step_index: 2, step_id: "needs", total_steps: 4,
    });
  });

  it("emits option_selected", () => {
    const { t, emit } = makeTracker();
    t.optionSelected("stage", "business_stage", "growing");
    expect(emit).toHaveBeenCalledWith("flow_option_selected", {
      flow_id: "pkg", step_id: "stage", field: "business_stage", value: "growing",
    });
  });

  it("abandoned reports last step + progress", () => {
    const { t, emit } = makeTracker();
    t.started();
    t.stepViewed(2, "needs");
    emit.mockClear();
    t.abandoned();
    expect(emit).toHaveBeenCalledWith("flow_abandoned", {
      flow_id: "pkg", last_step_index: 2, progress_pct: 50,
    });
  });

  it("abandoned is a no-op after result viewed", () => {
    const { t, emit } = makeTracker();
    t.resultViewed({ result_tier: "pro", value_band: "500-999" });
    emit.mockClear();
    t.abandoned();
    expect(emit).not.toHaveBeenCalled();
  });

  it("result_viewed emits once with provided fields", () => {
    const { t, emit } = makeTracker();
    t.resultViewed({ result_tier: "pro", value_band: "500-999" });
    t.resultViewed({ result_tier: "pro" });
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith("flow_result_viewed", {
      flow_id: "pkg", flow_type: "configurator", result_tier: "pro", value_band: "500-999",
    });
  });
});
