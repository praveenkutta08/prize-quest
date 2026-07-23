import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Settings, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearSession } from "@/platform/auth";
import { PropertySwitcher } from "@/platform/scope";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";

export function Topbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.session?.user);

  const signOut = () => {
    dispatch(clearSession());
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-[--z-sticky] flex h-16 items-center gap-3 border-b border-hairline bg-background/85 px-6 backdrop-blur">
      {/* Search → command palette */}
      <button
        type="button"
        onClick={onOpenCommand}
        className="group flex h-9 w-full max-w-md items-center gap-2.5 rounded-md border border-hairline bg-surface-sunken px-3 text-sm text-text-tertiary transition-colors hover:border-hairline-strong"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search campaigns, players, prizes…</span>
        <kbd className="rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-2xs text-text-tertiary">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2.5">
        <PropertySwitcher />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-hairline bg-surface-1 py-1 pl-1 pr-2.5 transition-colors hover:border-hairline-strong"
              aria-label="Profile menu"
            >
              <Avatar className="size-7">
                <AvatarFallback>{user?.initials ?? "PQ"}</AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-text-secondary sm:block">
                {user?.name.split(" ")[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">{user?.name}</span>
                <span className="text-2xs font-normal text-text-tertiary">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings /> Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut} className="text-danger">
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
