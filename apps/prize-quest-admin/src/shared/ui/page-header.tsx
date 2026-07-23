import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Page header: breadcrumbs, title, subtitle, and a right-aligned action slot. */
export function PageHeader({ breadcrumbs, title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="min-w-0 space-y-1.5">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-text-tertiary">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link to={crumb.href} className="transition-colors hover:text-text-secondary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-secondary">{crumb.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 ? (
                    <ChevronRight className="size-3 text-text-disabled" />
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-text-secondary">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
