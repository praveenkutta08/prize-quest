import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast surface, themed to the tokens. Used for optimistic-action feedback and
 * "coming in Session 2/3" stubs.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!bg-surface-2 !border !border-hairline !text-text-primary !rounded-lg !shadow-xl !font-sans",
          description: "!text-text-secondary",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md",
          cancelButton: "!bg-surface-3 !text-text-secondary !rounded-md",
          success: "!text-success",
          error: "!text-danger",
          info: "!text-info",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
