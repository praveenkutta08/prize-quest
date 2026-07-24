import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Plus, ShieldCheck, UserCheck, Users } from "lucide-react";
import { usePermission, useCurrentOperatorId } from "./usePermission";
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatCardSkeleton,
  StatusTabs,
  Toolbar,
  ToolbarSpacer,
  toast,
} from "@/shared/ui";
import { useTableUrlState } from "@/shared/lib";
import { count } from "@/shared/lib/format";
import { useListUsersQuery, useResendInviteMutation, useSetUserStatusMutation } from "../api";
import type { ManagedUser, Role } from "../model";
import { makeUserColumns } from "./columns";
import { EditUserDialog, InviteUserDialog } from "./dialogs";
import { ROLE_LABEL } from "./labels";

const STATUS_TAB_ORDER = ["all", "active", "pending", "inactive"] as const;
const TAB_LABEL: Record<string, string> = {
  all: "All",
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};
const ROLES: Role[] = ["marketing-manager", "approver", "operations", "auditor", "admin"];

export function UsersListPage() {
  const canManage = usePermission("users.manage");
  const currentOperatorId = useCurrentOperatorId();

  const url = useTableUrlState("all");
  const [searchInput, setSearchInput] = useState(url.q);
  const debounce = useRef<number | undefined>(undefined);

  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get("role") ?? "all";
  const setRole = (v: string) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (!v || v === "all") p.delete("role");
        else p.set("role", v);
        p.delete("page");
        return p;
      },
      { replace: true },
    );
  };

  const onSearch = (value: string) => {
    setSearchInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => url.setQ(value), 300);
  };

  const list = useListUsersQuery({ role, status: url.status, q: url.q, page: url.page });
  const [setStatus] = useSetUserStatusMutation();
  const [resendInvite] = useResendInviteMutation();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);

  const onToggleStatus = async (u: ManagedUser) => {
    const next = u.status === "active" ? "inactive" : "active";
    try {
      await setStatus({ id: u.id, status: next }).unwrap();
      toast.success(next === "active" ? "User activated" : "User deactivated", {
        description: u.name,
      });
    } catch (err) {
      const message = (err as { data?: { error?: string } })?.data?.error ?? "Please try again.";
      toast.error("Couldn't change status", { description: message });
    }
  };

  const onResend = async (u: ManagedUser) => {
    try {
      await resendInvite(u.id).unwrap();
      toast.success("Invitation resent", { description: u.email });
    } catch {
      toast.error("Couldn't resend invite");
    }
  };

  const columns = useMemo(
    () =>
      makeUserColumns({
        onEdit: (u) => setEditUser(u),
        onChangeRole: (u) => setEditUser(u),
        onToggleStatus,
        onResend,
        canManage,
        currentOperatorId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage, currentOperatorId],
  );

  const counts = list.data?.counts;
  const tabs = STATUS_TAB_ORDER.map((key) => ({
    key,
    label: TAB_LABEL[key],
    count: counts ? (key === "all" ? counts.all : counts[key as "active" | "pending"]) : undefined,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[{ label: "Admin" }, { label: "Users & roles" }]}
        title="Users & roles"
        subtitle="Operator accounts and their console access. Tenant-wide — not property-scoped."
        actions={
          canManage ? (
            <Button onClick={() => setInviteOpen(true)}>
              <Plus /> Invite user
            </Button>
          ) : null
        }
      />

      <section aria-label="User metrics">
        {list.isError ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {!counts ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total users"
                  value={count(counts.all)}
                  icon={<Users className="size-4" />}
                />
                <StatCard
                  label="Active"
                  value={count(counts.active)}
                  icon={<UserCheck className="size-4" />}
                />
                <StatCard
                  label="Pending invites"
                  value={<span className="text-info">{count(counts.pending)}</span>}
                  icon={<Clock className="size-4 text-info" />}
                />
                <StatCard
                  label="Admins"
                  value={count(counts.admins)}
                  icon={<ShieldCheck className="size-4" />}
                />
              </>
            )}
          </div>
        )}
      </section>

      <Card className="overflow-hidden p-4">
        {list.isError ? (
          <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
        ) : (
          <DataTable
            columns={columns}
            data={list.data?.rows ?? []}
            loading={list.isLoading}
            toolbar={
              <Toolbar className="mb-3">
                <StatusTabs tabs={tabs} value={url.status} onChange={url.setStatus} />
                <ToolbarSpacer />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-9 w-[170px] text-xs" aria-label="Filter by role">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All roles
                    </SelectItem>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        {ROLE_LABEL[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SearchInput
                  value={searchInput}
                  onChange={onSearch}
                  placeholder="Search users…"
                  className="w-48"
                />
              </Toolbar>
            }
            empty={
              <EmptyState
                compact
                icon={Users}
                title={
                  url.q
                    ? "No users match your search"
                    : `No ${TAB_LABEL[url.status]?.toLowerCase()} users`
                }
              />
            }
            pagination={{
              pageIndex: url.page,
              pageSize: 8,
              total: list.data?.total ?? 0,
              onPageChange: url.setPage,
            }}
          />
        )}
      </Card>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
      {editUser ? (
        <EditUserDialog
          user={editUser}
          isSelf={editUser.id === currentOperatorId}
          onClose={() => setEditUser(null)}
        />
      ) : null}
    </div>
  );
}
