import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

import { externalLinkProps } from "@/config/site";
import { cn } from "@/lib/utils";

function isExternalHref(href: string | undefined) {
  return Boolean(href && /^https?:\/\//.test(href));
}

function MdxAnchor({
  href,
  className,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const external = isExternalHref(href);

  return (
    <a
      href={href}
      className={cn(
        "font-medium text-primary underline-offset-4 hover:underline focus-visible:underline",
        className
      )}
      {...props}
      {...(external ? externalLinkProps : {})}
    />
  );
}

function MdxCode({
  className,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const fenced = Boolean(className?.includes("language-"));

  return (
    <code
      className={cn(
        !fenced &&
          "rounded-md bg-bg-input px-1.5 py-0.5 font-mono text-[0.9em]",
        className
      )}
      {...props}
    />
  );
}

const components: MDXComponents = {
  a: MdxAnchor,
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mt-8 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-8 text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-6 text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mt-4 leading-7 text-pretty", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("mt-4 list-disc space-y-2 pl-5 leading-7", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mt-4 list-decimal space-y-2 pl-5 leading-7", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("leading-7", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  code: MdxCode,
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "mt-4 overflow-x-auto rounded-xl border border-line bg-bg-input p-4 font-mono text-[13px] leading-relaxed",
        className
      )}
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
