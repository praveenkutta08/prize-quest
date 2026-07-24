import type { StatusTone } from "@/shared/ui";
import type { TriggerCategory } from "../model";

export const CATEGORY_LABEL: Record<TriggerCategory, string> = {
  gameplay: "Gameplay",
  lifecycle: "Lifecycle",
  financial: "Financial",
  schedule: "Schedule",
};

export function categoryTone(category: TriggerCategory): StatusTone {
  switch (category) {
    case "gameplay":
      return "event";
    case "lifecycle":
      return "scheduled";
    case "financial":
      return "paused";
    case "schedule":
      return "active";
    default:
      return "draft";
  }
}
