import { siteConfig } from "@/config/site";

const reportBody = (lessonId: string, fullUrl: string, channel?: string) =>
  [
    `**Lesson:** ${lessonId}`,
    `**URL:** ${fullUrl}`,
    `**Channel:** ${channel ?? ""}`,
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
  channel?: string
) {
  const url = new URL(siteConfig.githubIssues);
  url.searchParams.set("title", `Lesson issue: ${lessonId}`);
  url.searchParams.set("body", reportBody(lessonId, fullUrl, channel));
  return url.toString();
}
