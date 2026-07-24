import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Jurisdiction, Property } from "@/shared/contracts";
import {
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorState,
  Field,
  FormRow,
  Input,
  RowActionMenu,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusPill,
  toast,
} from "@/shared/ui";
import { usePermission } from "./usePermission";
import { PanelShell } from "./PanelShell";
import { PropertyForm } from "../model";
import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  useListPropertiesQuery,
  useUpdatePropertyMutation,
} from "../api";

const JURISDICTIONS: Jurisdiction[] = ["NV", "NJ", "MI", "PA", "tribal"];
const TIMEZONES = ["America/Los_Angeles", "America/New_York", "America/Chicago", "America/Denver"];

export function PropertiesPanel() {
  const canManage = usePermission("settings.manage");
  const list = useListPropertiesQuery();
  const [editing, setEditing] = useState<Property | null | "new">(null);
  const [removing, setRemoving] = useState<Property | null>(null);
  const [deleteProperty] = useDeletePropertyMutation();

  const columns = useMemo<ColumnDef<Property, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        id: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-secondary">{row.original.code}</span>
        ),
      },
      {
        id: "timezone",
        header: "Timezone",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.timezone}</span>,
      },
      {
        id: "jurisdiction",
        header: "Jurisdiction",
        cell: ({ row }) => <StatusPill tone="scheduled">{row.original.jurisdiction}</StatusPill>,
      },
      {
        id: "actions",
        header: "",
        meta: { className: "w-10 text-right" },
        cell: ({ row }) =>
          canManage ? (
            <RowActionMenu
              actions={[
                { label: "Edit", icon: Pencil, onSelect: () => setEditing(row.original) },
                {
                  label: "Remove",
                  icon: Trash2,
                  onSelect: () => setRemoving(row.original),
                  danger: true,
                  separatorBefore: true,
                },
              ]}
            />
          ) : null,
      },
    ],
    [canManage],
  );

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await deleteProperty(removing.id).unwrap();
      toast.success("Property removed", { description: removing.name });
    } catch {
      toast.error("Couldn't remove property", { description: "Please try again." });
    }
    setRemoving(null);
  };

  return (
    <PanelShell
      title="Properties"
      description="The property registry the PropertySwitcher and every property-scoped surface draw from."
    >
      <div className="flex items-center justify-between">
        <p className="text-2xs uppercase tracking-wide text-text-tertiary">
          {list.data?.length ?? 0} properties
        </p>
        {canManage ? (
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus /> Add property
          </Button>
        ) : null}
      </div>

      {list.isError ? (
        <ErrorState onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : (
        <DataTable columns={columns} data={list.data ?? []} loading={list.isLoading} />
      )}

      {editing ? (
        <PropertyDialog
          property={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}

      <Dialog open={Boolean(removing)} onOpenChange={(v) => !v && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove property?</DialogTitle>
            <DialogDescription>
              {removing?.name} will be removed from the registry and the PropertySwitcher. This is a
              mock action for the session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelShell>
  );
}

function PropertyDialog({ property, onClose }: { property: Property | null; onClose: () => void }) {
  const isEdit = Boolean(property);
  const [createProperty] = useCreatePropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  const form = useForm<PropertyForm>({
    resolver: zodResolver(PropertyForm),
    defaultValues: {
      id: property?.id,
      name: property?.name ?? "",
      code: property?.code ?? "",
      timezone: property?.timezone ?? "America/Los_Angeles",
      jurisdiction: property?.jurisdiction ?? "NV",
    },
    mode: "onBlur",
  });
  const { register, handleSubmit, formState, setValue, watch } = form;

  const submit = handleSubmit(async (v) => {
    try {
      if (isEdit && property) {
        await updateProperty({
          ...property,
          ...v,
          code: v.code.toUpperCase(),
          id: property.id,
        }).unwrap();
        toast.success("Property updated", { description: v.name });
      } else {
        await createProperty({
          name: v.name,
          code: v.code.toUpperCase(),
          timezone: v.timezone,
          jurisdiction: v.jurisdiction,
        }).unwrap();
        toast.success("Property added", {
          description: `${v.name} · appears in the PropertySwitcher`,
        });
      }
      onClose();
    } catch {
      toast.error("Couldn't save property", { description: "Please try again." });
    }
  });

  const jurisdiction = watch("jurisdiction");
  const timezone = watch("timezone");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit property" : "Add property"}</DialogTitle>
          <DialogDescription>Administers the tenant property registry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Property name" htmlFor="p-name" error={formState.errors.name?.message}>
            <Input id="p-name" placeholder="Casino Royale Reno" {...register("name")} />
          </Field>
          <FormRow>
            <Field
              label="Code"
              htmlFor="p-code"
              help="2–4 letters"
              error={formState.errors.code?.message}
            >
              <Input id="p-code" maxLength={4} placeholder="RNO" {...register("code")} />
            </Field>
            <Field label="Jurisdiction">
              <Select
                value={jurisdiction}
                onValueChange={(v) =>
                  setValue("jurisdiction", v as Jurisdiction, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JURISDICTIONS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormRow>
          <Field label="Timezone">
            <Select
              value={timezone}
              onValueChange={(v) => setValue("timezone", v, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{isEdit ? "Save property" : "Add property"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
