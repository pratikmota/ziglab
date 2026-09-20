"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PLAYGROUND_HELLO_SOURCE } from "@/lib/content/hello-zig";
import { en } from "@/lib/i18n/en";
import { writePlayDraft } from "@/lib/play-draft";

export function NewPlaygroundClient() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const confirmed = useRef(false);

  function leaveUnchanged() {
    router.replace("/play");
  }

  function confirmNew() {
    confirmed.current = true;
    writePlayDraft({
      code: PLAYGROUND_HELLO_SOURCE,
      channel: "stable",
    });
    router.replace("/play");
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && !confirmed.current) {
            leaveUnchanged();
          }
        }}
        title={en.play.newTitle}
        description={en.play.newBody}
        confirmLabel={en.play.newConfirm}
        onConfirm={confirmNew}
      />
    </div>
  );
}
