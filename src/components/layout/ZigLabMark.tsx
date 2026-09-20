import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type ZigLabMarkProps = {
  className?: string;
};

export function ZigLabMark({ className }: ZigLabMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#1C1A16" />
      <rect x="13" y="5" width="6" height="5" rx="1" fill="#F7A41D" />
      <path
        d="M10.5 10h11l2.7 13.2A3.6 3.6 0 0 1 20.7 27H11.3a3.6 3.6 0 0 1-3.5-3.8L10.5 10Z"
        fill="#F7A41D"
      />
      <path
        d="M17.6 13.2 13.2 19h3.4L15.2 24.5 20.8 18h-3.3l1.6-4.8Z"
        fill="#1A1408"
      />
    </svg>
  );
}

export function ZigLabWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-lg tracking-tight", className)} aria-hidden>
      <span className="font-semibold">Zig</span>
      <span className="font-medium text-muted-foreground">Lab</span>
    </span>
  );
}

export function ZigLabBrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={siteConfig.name}
      className={cn(
        "inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <ZigLabMark />
      <ZigLabWordmark />
    </Link>
  );
}
