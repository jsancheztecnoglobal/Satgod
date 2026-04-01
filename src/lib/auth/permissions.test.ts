import { describe, expect, it } from "vitest";

import { canTransitionWorkOrder, getAllowedTransitions } from "@/lib/auth/permissions";

describe("work order role permissions", () => {
  it("allows office planner to move a planned work order into progress", () => {
    expect(canTransitionWorkOrder("office_planner", "planned", "in_progress")).toBe(true);
  });

  it("prevents sales from transitioning work orders", () => {
    expect(getAllowedTransitions("sales", "planned")).toEqual([]);
  });

  it("limits technician transitions to field-safe states", () => {
    expect(getAllowedTransitions("technician", "in_progress")).toEqual([
      "paused",
      "pending_material",
      "pending_signature",
      "pending_office_review",
    ]);
  });
});
