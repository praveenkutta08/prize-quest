import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button, EmptyState, PageHeader, type Crumb } from "@/shared/ui";

interface PlaceholderPageProps {
  crumbs: Crumb[];
  title: string;
  subtitle: string;
  icon: LucideIcon;
  session: string;
  description: string;
}

/**
 * Designed "coming soon" surface for routes built in later sessions — a proper
 * on-brand empty state inside the shell, never a blank page.
 */
export function PlaceholderPage({
  crumbs,
  title,
  subtitle,
  icon,
  session,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader breadcrumbs={crumbs} title={title} subtitle={subtitle} />
      <EmptyState
        icon={icon}
        title={`${title} arrives in ${session}`}
        description={description}
        action={
          <Button asChild variant="secondary">
            <Link to="/dashboard">
              <ArrowLeft /> Back to dashboard
            </Link>
          </Button>
        }
      />
    </div>
  );
}
