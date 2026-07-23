import { useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

/** Read the report args — range/segment from the URL, property from the active scope. */
export function useReportFilters() {
  const [params] = useSearchParams();
  const activePid = useAppSelector((s) => s.scope.activePropertyId) ?? "all";
  return {
    range: params.get("range") ?? "30d",
    segment: params.get("segment") ?? "all",
    property: activePid,
  };
}
