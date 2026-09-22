"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { en } from "@/lib/i18n/en";

export function EditorReset({
  source,
  template,
  onChange,
  title = en.play.resetTitle,
  body = en.play.resetBody,
}: {
  source: string;
  template: string;
  onChange: (code: string) => void;
  title?: string;
  body?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw />
        {en.play.reset}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={body}
        confirmLabel={en.play.resetConfirm}
        onConfirm={() => {
          const alreadyTemplate = source === template;
          onChange(template);
          if (!alreadyTemplate) {
            toast.success(en.play.resetDone);
          }
        }}
      />
    </>
  );
}
