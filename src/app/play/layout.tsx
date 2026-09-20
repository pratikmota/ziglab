import type { ReactNode } from "react";

export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem-2.25rem-2px)] min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
