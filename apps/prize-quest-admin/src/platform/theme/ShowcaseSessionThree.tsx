import { useState } from "react";
import {
  ActionConfig,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CronField,
  EventSelector,
  LogStream,
  Toggle,
  type ActionConfigValue,
  type LogStreamRow,
} from "@/shared/ui";

const DEMO_EVENTS = [
  {
    key: "card-tap",
    label: "Card tap",
    description: "A player taps their loyalty card at a device.",
  },
  {
    key: "tier-change",
    label: "Tier change",
    description: "A player's tier is upgraded or downgraded.",
  },
  {
    key: "budget-cap",
    label: "Budget cap reached",
    description: "A campaign's liability crosses a budget threshold.",
  },
];

const SEVERITIES = ["ok", "warn", "err"] as const;
const DEMO_LOGS: LogStreamRow[] = Array.from({ length: 24 }, (_, i) => {
  const severity = SEVERITIES[i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0];
  return {
    id: `demo-log-${i}`,
    severity,
    time: `10:${String(59 - (i % 59)).padStart(2, "0")}:0${i % 9}`,
    message: (
      <>
        <strong className="font-semibold text-text-primary">Birthday Bonus</strong> · {8 + i}{" "}
        players matched · {8 + i} offers sent · runtime 0.3{i % 9}s
      </>
    ),
    meta: i % 2 === 0 ? "scheduler · prod-us-east" : "event · prod-us-east",
  };
});

/** Session 3 showcase for the new automation components. */
export function ShowcaseSessionThree() {
  const [on, setOn] = useState(true);
  const [cron, setCron] = useState("0 6 * * *");
  const [event, setEvent] = useState("tier-change");
  const [action, setAction] = useState<ActionConfigValue>({
    type: "send-offer",
    offerType: "Birthday Bonus offer",
    channel: "Patron HTML5 + Email",
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Toggle · CronField · EventSelector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Rule status</p>
                <p className="text-2xs text-text-tertiary">Optimistic activate / pause</p>
              </div>
              <Toggle checked={on} onCheckedChange={setOn} label="Toggle rule" />
            </div>
            <div>
              <p className="mb-1.5 text-xs uppercase tracking-wide text-text-secondary">
                Cron schedule
              </p>
              <CronField value={cron} onChange={setCron} />
            </div>
            <div>
              <p className="mb-1.5 text-xs uppercase tracking-wide text-text-secondary">Event</p>
              <EventSelector events={DEMO_EVENTS} value={event} onChange={setEvent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ActionConfig — conditional fields per action</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionConfig
              value={action}
              onChange={setAction}
              campaignOptions={[
                { value: "cmp-summer-bash", label: "Summer Bash 2026" },
                { value: "cmp-march-madness", label: "March Madness" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>LogStream — virtualized · severity dots · mono time</CardTitle>
        </CardHeader>
        <CardContent>
          <LogStream rows={DEMO_LOGS} height={320} />
        </CardContent>
      </Card>
    </div>
  );
}
