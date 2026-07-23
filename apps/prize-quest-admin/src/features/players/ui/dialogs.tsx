import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Input,
  Textarea,
  toast,
} from "@/shared/ui";
import { count } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { type Player } from "../model";

/** Form schema coerces the numeric text input; `reason` is required. */
const PointsAdjustForm = z.object({
  delta: z.coerce.number().refine((n) => n !== 0, "Enter a non-zero amount"),
  reason: z.string().min(1, "Add a reason"),
});
type PointsAdjustForm = z.infer<typeof PointsAdjustForm>;
import { playersApi, useAdjustPointsMutation, useListActiveCampaignOptionsQuery } from "../api";

/** Adjust points — RHF + Zod, optimistic balance bump, appends a points-adjust activity row. */
export function AdjustPointsDialog({
  player,
  open,
  onOpenChange,
}: {
  player: Player;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [adjust, { isLoading }] = useAdjustPointsMutation();
  const [sign, setSign] = useState<1 | -1>(1);

  const form = useForm<PointsAdjustForm>({
    resolver: zodResolver(PointsAdjustForm),
    defaultValues: { delta: 0, reason: "" },
    mode: "onBlur",
  });
  const { register, handleSubmit, reset, formState } = form;

  const submit = handleSubmit(async (values) => {
    const delta = Math.abs(Number(values.delta)) * sign;
    try {
      await adjust({ id: player.id, body: { delta, reason: values.reason } }).unwrap();
      // Optimistically prepend a points-adjust activity row for this session.
      dispatch(
        playersApi.util.updateQueryData("getPlayerActivity", { id: player.id }, (draft) => {
          draft.rows.unshift({
            id: `${player.id}-adj-${draft.rows.length}-${delta}`,
            playerId: player.id,
            type: "points-adjust",
            label: "Points adjusted",
            meta: `${delta > 0 ? "+" : ""}${count(delta)} · ${values.reason}`,
            time: new Date().toISOString(),
          });
        }),
      );
      toast.success("Points adjusted", {
        description: `${delta > 0 ? "+" : ""}${count(delta)} · ${player.name}`,
      });
      reset({ delta: 0, reason: "" });
      setSign(1);
      onOpenChange(false);
    } catch {
      toast.error("Couldn't adjust points", { description: "Please try again." });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust points · {player.name}</DialogTitle>
          <DialogDescription>
            Current balance {count(player.pointsBalance)} points. Adjustments are logged to the
            player's activity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="inline-flex overflow-hidden rounded-md border border-hairline">
              <button
                type="button"
                aria-pressed={sign === 1}
                onClick={() => setSign(1)}
                className={cn(
                  "flex size-9 items-center justify-center transition-colors",
                  sign === 1
                    ? "bg-success-soft text-success"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                <Plus className="size-4" />
              </button>
              <button
                type="button"
                aria-pressed={sign === -1}
                onClick={() => setSign(-1)}
                className={cn(
                  "flex size-9 items-center justify-center border-l border-hairline transition-colors",
                  sign === -1
                    ? "bg-danger-soft text-danger"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                <Minus className="size-4" />
              </button>
            </div>
            <div className="flex-1">
              <Field label="Points" htmlFor="f-delta" error={formState.errors.delta?.message}>
                <Input
                  id="f-delta"
                  type="number"
                  inputMode="numeric"
                  placeholder="2500"
                  {...register("delta")}
                />
              </Field>
            </div>
          </div>
          <Field label="Reason" htmlFor="f-reason" error={formState.errors.reason?.message}>
            <Textarea
              id="f-reason"
              placeholder="Host courtesy · birthday bonus…"
              {...register("reason")}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isLoading}>
            {isLoading ? "Adjusting…" : "Apply adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Add to campaign — lists active campaigns, single-select, optimistic append. */
export function AddToCampaignDialog({
  player,
  open,
  onOpenChange,
}: {
  player: Player;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const options = useListActiveCampaignOptionsQuery("all");
  const [selected, setSelected] = useState<string>("");

  const confirm = () => {
    const campaign = options.data?.find((c) => c.id === selected);
    if (!campaign) return;
    // Optimistic, session-scoped append to the player's campaigns (no persisted endpoint).
    dispatch(
      playersApi.util.updateQueryData("getPlayerCampaigns", player.id, (draft) => {
        if (!draft.some((c) => c.campaignId === campaign.id)) {
          draft.unshift({
            campaignId: campaign.id,
            name: campaign.name,
            enrolledAt: new Date().toISOString(),
            status: "active",
          });
        }
      }),
    );
    toast.success("Added to campaign", { description: `${player.name} → ${campaign.name}` });
    setSelected("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to campaign · {player.name}</DialogTitle>
          <DialogDescription>Enroll this player in an active campaign.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {options.isLoading ? (
            <p className="py-6 text-center text-sm text-text-tertiary">Loading campaigns…</p>
          ) : (options.data ?? []).length === 0 ? (
            <EmptyState
              compact
              title="No active campaigns"
              description="Activate a campaign to enroll players."
            />
          ) : (
            (options.data ?? []).map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                  selected === c.id
                    ? "border-brand/40 bg-brand-subtle text-text-primary"
                    : "border-hairline bg-surface-sunken text-text-secondary hover:border-hairline-strong",
                )}
              >
                <input
                  type="radio"
                  name="campaign"
                  className="accent-brand"
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                />
                <span className="flex-1">{c.name}</span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!selected}>
            Add to campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
