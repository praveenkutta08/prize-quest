import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ActionConfig,
  ConditionBuilder,
  EventSelector,
  type ConditionGroupValue,
  type FieldDef,
} from "@/shared/ui";

/**
 * The rule-builder shared components carry explicit control labels (or, for
 * ConditionBuilder, per-row aria-labels). These are the same components the real
 * promotions / rules forms use, so naming regressions would surface here.
 */
describe("EventSelector", () => {
  it("names its combobox", () => {
    render(
      <EventSelector
        events={[{ key: "tier-change", label: "Tier change", description: "d" }]}
        value="tier-change"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Trigger event" })).toBeInTheDocument();
  });
});

describe("ActionConfig", () => {
  it("names its selects via the Labeled context", () => {
    render(<ActionConfig value={{ type: "send-offer" }} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Action" })).toBeInTheDocument();
  });
});

describe("ConditionBuilder", () => {
  const catalog: FieldDef[] = [
    {
      key: "player.tier",
      label: "player.tier",
      token: "tier",
      editor: "keyword",
      operators: [{ key: "is", label: "is", symbol: "=" }],
      keywords: [{ value: "gold", label: "Gold" }],
    },
  ];
  const value: ConditionGroupValue = {
    conjunction: "AND",
    conditions: [{ field: "player.tier", operator: "is", value: "gold" }],
  };

  it("names each row's field, operator and value selects", () => {
    render(<ConditionBuilder catalog={catalog} value={value} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "Condition 1 field" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Condition 1 operator" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /value/i })).toBeInTheDocument();
  });
});
