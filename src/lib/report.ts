import { siteConfig } from "@/config/site";
import type { ZigChannel } from "@/lib/execution/types";
import { zigVersionLabel } from "@/lib/zig-version";

const reportBody = (lessonId: string, fullUrl: string, channel?: ZigChannel) =>
  [
    `**Lesson:** ${lessonId}`,
    `**URL:** ${fullUrl}`,
    `**Zig version:** ${channel ? zigVersionLabel(channel) : ""}`,
    "**What is wrong?**",
    "",
    "",
    "**What did you expect?**",
    "",
    "",
  ].join("\n");

export function lessonReportUrl(
  lessonId: string,
  fullUrl: string,
  channel?: ZigChannel
) {
  const url = new URL(siteConfig.githubIssues);
  url.searchParams.set("title", `Lesson issue: ${lessonId}`);
  url.searchParams.set("body", reportBody(lessonId, fullUrl, channel));
  return url.toString();
}

const playgroundReportBody = (fullUrl: string, channel?: ZigChannel) =>
  [
    `**URL:** ${fullUrl}`,
    `**Zig version:** ${channel ? zigVersionLabel(channel) : ""}`,
    "**What is wrong?**",
    "",
    "",
    "**What did you expect?**",
    "",
    "",
  ].join("\n");

export function playgroundReportUrl(fullUrl: string, channel?: ZigChannel) {
  const url = new URL(siteConfig.githubIssues);
  url.searchParams.set("title", "Playground issue");
  url.searchParams.set("body", playgroundReportBody(fullUrl, channel));
  return url.toString();
}
