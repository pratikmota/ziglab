"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { en } from "@/lib/i18n/en";

const order = ["dark", "light", "system"] as const;
type ThemeValue = (typeof order)[number];

function nextTheme(current: string | undefined): ThemeValue {
  const index = order.indexOf((current as ThemeValue) ?? "dark");
  return order[(index + 1) % order.length] ?? "dark";
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  const current: ThemeValue =
    isClient && order.includes(theme as ThemeValue)
      ? (theme as ThemeValue)
      : "dark";

  const label = `${en.theme.toggle}: ${en.theme[current]}`;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={() => setTheme(nextTheme(current))}
          />
        }
      >
        {current === "light" ? (
          <Sun />
        ) : current === "system" ? (
          <Monitor />
        ) : (
          <Moon />
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
