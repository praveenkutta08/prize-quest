import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  DetailCard,
  Field,
  FormSection,
  FormWizardLayout,
  Input,
  PageHeader,
  PresetChips,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@/shared/ui";
import { usePermission } from "./usePermission";
import { TemplateForm, TOKEN_CHIPS, type NotifChannel } from "../model";
import {
  useCreateTemplateMutation,
  useListTemplatesQuery,
  useUpdateTemplateMutation,
} from "../api";
import { CHANNEL_LABEL } from "./labels";

const CHANNELS: NotifChannel[] = ["email", "sms", "push", "in-app"];

export function TemplateFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("from") ?? undefined;
  const isEdit = Boolean(id);
  const sourceId = id ?? fromId;
  const navigate = useNavigate();
  const canManage = usePermission("notifications.manage");

  const templates = useListTemplatesQuery();
  const source = templates.data?.find((t) => t.id === sourceId);
  const [createTemplate] = useCreateTemplateMutation();
  const [updateTemplate] = useUpdateTemplateMutation();

  const form = useForm<TemplateForm>({
    resolver: zodResolver(TemplateForm),
    defaultValues: { name: "", channel: "email", subject: "", body: "", status: "draft" },
    mode: "onBlur",
  });
  const { register, handleSubmit, reset, watch, setValue, getValues, formState } = form;
  const channel = watch("channel");
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const seededRef = useRef(false);
  useEffect(() => {
    if (!sourceId || seededRef.current || !source) return;
    seededRef.current = true;
    reset({
      name: isEdit ? source.name : `Copy of ${source.name}`,
      channel: source.channel,
      subject: source.subject ?? "",
      body: source.body,
      status: isEdit ? source.status : "draft",
    });
  }, [sourceId, source, isEdit, reset]);

  const insertToken = (token: string) => {
    const el = bodyRef.current;
    const current = getValues("body");
    if (el && el.selectionStart != null) {
      const start = el.selectionStart;
      const end = el.selectionEnd ?? start;
      const next = current.slice(0, start) + token + current.slice(end);
      setValue("body", next, { shouldDirty: true, shouldValidate: true });
    } else {
      setValue("body", `${current}${token}`, { shouldDirty: true, shouldValidate: true });
    }
  };

  const save = (status: "active" | "draft") =>
    handleSubmit(async (v) => {
      const body = { ...v, status, subject: v.channel === "email" ? v.subject : undefined };
      try {
        if (isEdit && id) {
          await updateTemplate({ id, body }).unwrap();
          toast.success("Template saved", { description: v.name });
        } else {
          await createTemplate(body).unwrap();
          toast.success(status === "active" ? "Template published" : "Template saved as draft", {
            description: v.name,
          });
        }
        navigate("/notifications/templates");
      } catch {
        toast.error("Couldn't save template", { description: "Please try again." });
      }
    })();

  const values = watch();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumbs={[
          { label: "Operations" },
          { label: "Notifications", href: "/notifications" },
          { label: "Templates", href: "/notifications/templates" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        title={isEdit ? "Edit template" : "New template"}
        subtitle="Compose an operator message template with token placeholders."
      />

      <FormWizardLayout
        summary={
          <DetailCard title="Preview">
            <div className="space-y-2 text-sm">
              <p className="text-2xs uppercase tracking-wide text-text-tertiary">
                {CHANNEL_LABEL[values.channel]}
              </p>
              {values.channel === "email" && values.subject ? (
                <p className="font-medium text-text-primary">{values.subject}</p>
              ) : null}
              <p className="whitespace-pre-wrap text-text-secondary">
                {values.body || "Your message will preview here."}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-4">
              <Button
                onClick={() => save("active")}
                disabled={!canManage}
                title={!canManage ? "Requires notifications.manage" : undefined}
              >
                {isEdit ? "Save & activate" : "Publish template"}
              </Button>
              <Button variant="secondary" onClick={() => save("draft")} disabled={!canManage}>
                Save as draft
              </Button>
            </div>
          </DetailCard>
        }
        sections={
          <FormSection
            step={1}
            title="Template"
            subtitle="Channel, subject, and body"
            complete={Boolean(values.name && values.body)}
          >
            <Field label="Name" htmlFor="t-name" error={formState.errors.name?.message}>
              <Input
                id="t-name"
                placeholder="Welcome new member"
                disabled={!canManage}
                {...register("name")}
              />
            </Field>
            <Field label="Channel">
              <Select
                value={channel}
                onValueChange={(v) => setValue("channel", v as NotifChannel, { shouldDirty: true })}
                disabled={!canManage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CHANNEL_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {channel === "email" ? (
              <Field label="Subject" htmlFor="t-subject">
                <Input
                  id="t-subject"
                  placeholder="Welcome to {{property.name}}!"
                  disabled={!canManage}
                  {...register("subject")}
                />
              </Field>
            ) : null}
            <Field label="Body" htmlFor="t-body" error={formState.errors.body?.message}>
              <Textarea
                id="t-body"
                rows={5}
                placeholder="Hi {{player.name}}, …"
                disabled={!canManage}
                {...register("body")}
                ref={(el) => {
                  register("body").ref(el);
                  bodyRef.current = el;
                }}
              />
            </Field>
            <div>
              <p className="mb-1.5 text-2xs uppercase tracking-wide text-text-tertiary">
                Insert token
              </p>
              <PresetChips
                ariaLabel="Insert token"
                chips={TOKEN_CHIPS.map((t) => ({ value: t, label: t }))}
                onSelect={(v) => canManage && insertToken(v)}
              />
            </div>
          </FormSection>
        }
      />
    </div>
  );
}
