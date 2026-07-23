import { useNavigate } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  toast,
} from "@/shared/ui";
import { COMMAND_TARGETS } from "./nav";

/** Wired ⌘K command palette — jump to a screen or fire a quick action. */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const stub = (what: string) => {
    onOpenChange(false);
    toast(`${what} — coming in a later session`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search screens and actions…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Go to">
          {COMMAND_TARGETS.map((t) => (
            <CommandItem key={t.path} value={t.label} onSelect={() => go(t.path)}>
              <t.icon />
              {t.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="New campaign" onSelect={() => stub("New campaign")}>
            <Plus />
            New campaign
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem value="Export dashboard" onSelect={() => stub("Export")}>
            <Download />
            Export dashboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
