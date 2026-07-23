import { useMemo, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { moneyPrecise } from "@/shared/lib/format";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { SearchInput } from "./toolbar";
import { prizeIcon, type PrizeLike } from "./prize-grid";
import { Skeleton } from "./skeleton";

/**
 * Prize catalog picker (plan §8 `PrizePicker`, prototype "Add prize from
 * catalog"). Presentational: the caller passes the catalog (from `listPrizes`)
 * and the current selection; the dialog manages a draft selection with search +
 * category filter and commits on confirm. Multi-select.
 */
export function PrizePicker({
  prizes,
  selectedIds,
  onChange,
  loading,
  trigger,
}: {
  prizes: PrizeLike[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(prizes.map((p) => p.category)))],
    [prizes],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return prizes.filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term)) &&
        (category === "all" || p.category === category),
    );
  }, [prizes, q, category]);

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(selectedIds); // reset the draft to committed selection on open
    setOpen(next);
  };

  const commit = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add prizes from catalog</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search prizes…"
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-2xs font-medium transition-colors",
                  category === cat
                    ? "border-brand/40 bg-brand-subtle text-brand-bright"
                    : "border-hairline bg-surface-1 text-text-tertiary hover:text-text-secondary",
                )}
              >
                {cat === "all" ? "All categories" : cat}
              </button>
            ))}
          </div>

          <div className="max-h-[46vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-text-tertiary">
                No prizes match your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filtered.map((prize) => {
                  const on = draft.includes(prize.id);
                  const Icon = prizeIcon(prize.category);
                  return (
                    <button
                      key={prize.id}
                      type="button"
                      onClick={() => toggle(prize.id)}
                      aria-pressed={on}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                        on
                          ? "border-brand/45 bg-brand-subtle"
                          : "border-hairline bg-surface-sunken hover:border-hairline-strong",
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-1 text-brand">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {prize.name}
                        </p>
                        <p className="text-2xs text-text-tertiary">
                          {prize.category} · {moneyPrecise(prize.value)}
                        </p>
                      </div>
                      {prize.inStock === false ? <Badge variant="warning">Low stock</Badge> : null}
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          on
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-hairline-strong",
                        )}
                      >
                        {on ? <Check className="size-3" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <span className="mr-auto self-center text-xs text-text-tertiary">
            {draft.length} selected
          </span>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={commit}>Add {draft.length ? `(${draft.length})` : ""}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
