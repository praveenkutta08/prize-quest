import { NavLink, Outlet } from "react-router-dom";
import { PageHeader } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";

const TABS = [
  { label: "Center", to: "/notifications", end: true },
  { label: "Templates", to: "/notifications/templates", end: false },
  { label: "Delivery log", to: "/notifications/deliveries", end: true },
];

export function NotificationsLayout() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Operations" }, { label: "Notifications" }]}
        title="Notifications"
        subtitle="Operator notification center, message templates, and the delivery log. Tenant-level."
      />

      <nav
        aria-label="Notifications sections"
        className="flex items-center gap-1 border-b border-hairline"
      >
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                "relative px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-text-primary after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand"
                  : "text-text-tertiary hover:text-text-secondary",
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
