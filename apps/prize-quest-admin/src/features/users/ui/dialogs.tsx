import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from "@/shared/ui";
import { UserInvite, UserUpdate, type ManagedUser, type Role } from "../model";
import { useInviteUserMutation, useSetUserStatusMutation, useUpdateUserMutation } from "../api";
import { ROLE_LABEL } from "./labels";

const ROLES: Role[] = ["marketing-manager", "approver", "operations", "auditor", "admin"];

/** Invite user — email + role. */
export function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [inviteUser, { isLoading }] = useInviteUserMutation();
  const form = useForm<UserInvite>({
    resolver: zodResolver(UserInvite),
    defaultValues: { email: "", role: "marketing-manager" },
    mode: "onBlur",
  });
  const { register, handleSubmit, reset, watch, setValue, formState } = form;
  const role = watch("role");

  const submit = handleSubmit(async (v) => {
    try {
      await inviteUser(v).unwrap();
      toast.success("Invitation sent", { description: v.email });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Couldn't send invite", { description: "Please try again." });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            Send an operator invitation. They'll appear as pending until they join.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Email" htmlFor="i-email" error={formState.errors.email?.message}>
            <Input
              id="i-email"
              type="email"
              placeholder="new.operator@casinoroyale.com"
              {...register("email")}
            />
          </Field>
          <Field label="Role">
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as Role, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isLoading}>
            {isLoading ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Edit user — name, title, role, and an active toggle. Self-lockout locks role/status. */
export function EditUserDialog({
  user,
  isSelf,
  onClose,
}: {
  user: ManagedUser;
  isSelf: boolean;
  onClose: () => void;
}) {
  const [updateUser] = useUpdateUserMutation();
  const [setStatus] = useSetUserStatusMutation();

  const form = useForm<UserUpdate>({
    resolver: zodResolver(UserUpdate),
    defaultValues: { name: user.name, title: user.title, role: user.role },
    mode: "onBlur",
  });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const role = watch("role");

  const submit = handleSubmit(async (v) => {
    try {
      await updateUser({ id: user.id, body: v }).unwrap();
      toast.success("User updated", { description: v.name });
      onClose();
    } catch (err) {
      const message = errText(err) ?? "Please try again.";
      toast.error("Couldn't update user", { description: message });
    }
  });

  const toggleActive = async (next: boolean) => {
    try {
      await setStatus({ id: user.id, status: next ? "active" : "inactive" }).unwrap();
      toast.success(next ? "User activated" : "User deactivated", { description: user.name });
    } catch (err) {
      toast.error("Couldn't change status", { description: errText(err) ?? "Please try again." });
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Name" htmlFor="e-name" error={formState.errors.name?.message}>
            <Input id="e-name" {...register("name")} />
          </Field>
          <Field label="Title" htmlFor="e-title" error={formState.errors.title?.message}>
            <Input id="e-title" {...register("title")} />
          </Field>
          <Field label="Role">
            <RoleSelect
              value={role}
              disabled={isSelf}
              lockHint="Locked to admin — you can't change your own role."
              onChange={(v) => setValue("role", v, { shouldDirty: true })}
            />
          </Field>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-sunken px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Account active</p>
              <p className="text-2xs text-text-tertiary">Deactivating revokes console access.</p>
            </div>
            {isSelf ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Toggle checked disabled label="Account active" onCheckedChange={() => {}} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>You can't deactivate your own account.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Toggle
                checked={user.status === "active"}
                onCheckedChange={toggleActive}
                label="Account active"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelect({
  value,
  disabled,
  lockHint,
  onChange,
}: {
  value: Role;
  disabled?: boolean;
  lockHint?: string;
  onChange: (v: Role) => void;
}) {
  const select = (
    <Select value={value} onValueChange={(v) => onChange(v as Role)} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABEL[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  return disabled && lockHint ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block">{select}</span>
        </TooltipTrigger>
        <TooltipContent>{lockHint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    select
  );
}

function errText(err: unknown): string | undefined {
  const data = (err as { data?: { error?: string } })?.data;
  return data?.error;
}
