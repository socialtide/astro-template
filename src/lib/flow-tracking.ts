export type FlowType = "assessment" | "quiz" | "configurator";

export interface FlowResult {
  result_tier?: string;
  score_band?: string;
  value_band?: string;
}

export interface FlowTracker {
  started(): void;
  stepViewed(stepIndex: number, stepId: string): void;
  optionSelected(stepId: string, field: string, value: string | number | boolean): void;
  abandoned(): void;
  resultViewed(result: FlowResult): void;
}

type Emit = (event: string, props: Record<string, unknown>) => void;

const defaultEmit: Emit = (event, props) => {
  try {
    const w = window as unknown as {
      stTrack?: Emit;
      posthog?: { capture?: Emit };
    };
    if (w.stTrack) {
      w.stTrack(event, props);
    } else {
      // stTrack isn't set until initializeTracking runs; the PostHog snippet
      // stub exists from the head script and queues captures, so events fired
      // by early-hydrating islands aren't lost (they just skip UTM enrichment).
      w.posthog?.capture?.(event, props);
    }
  } catch {
    /* tracking unavailable */
  }
};

export function createFlowTracker(opts: {
  flowId: string;
  flowType: FlowType;
  totalSteps: number;
  emit?: Emit;
}): FlowTracker {
  const { flowId, flowType, totalSteps } = opts;
  const emit = opts.emit ?? defaultEmit;
  let lastStep = 0;
  let didStart = false;
  let didResult = false;
  let didAbandon = false;

  const tracker: FlowTracker = {
    started() {
      if (didStart) return;
      didStart = true;
      emit("flow_started", { flow_id: flowId, flow_type: flowType });
    },
    stepViewed(stepIndex, stepId) {
      lastStep = stepIndex;
      emit("flow_step_viewed", {
        flow_id: flowId,
        flow_type: flowType,
        step_index: stepIndex,
        step_id: stepId,
        total_steps: totalSteps,
      });
    },
    optionSelected(stepId, field, value) {
      emit("flow_option_selected", { flow_id: flowId, step_id: stepId, field, value });
    },
    abandoned() {
      if (!didStart || didResult || didAbandon) return;
      didAbandon = true;
      const progress_pct = totalSteps > 0 ? Math.round((lastStep / totalSteps) * 100) : 0;
      emit("flow_abandoned", { flow_id: flowId, last_step_index: lastStep, progress_pct });
    },
    resultViewed(result) {
      if (didResult) return;
      didResult = true;
      const props: Record<string, unknown> = { flow_id: flowId, flow_type: flowType };
      for (const k of ["result_tier", "score_band", "value_band"] as const) {
        if (result[k] !== undefined) props[k] = result[k];
      }
      emit("flow_result_viewed", props);
    },
  };

  // On static sites navigation is a full page unload — component-level cleanup
  // (e.g. a React unmount effect) never runs, so hook abandonment to pagehide.
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => tracker.abandoned());
  }

  return tracker;
}
