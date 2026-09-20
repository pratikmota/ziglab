export const en = {
  meta: {
    homeTitle: "ZigLab — Learn Zig in the browser",
  },
  nav: {
    learn: "Learn",
    play: "Playground",
    blog: "Blog",
    sponsors: "Sponsors",
    about: "About",
    privacy: "Privacy",
    terms: "Terms",
    github: "GitHub",
    ziggit: "Ziggit",
    discord: "Discord",
    x: "X",
    menu: "Open menu",
    closeMenu: "Close menu",
  },
  theme: {
    toggle: "Color theme",
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  skip: {
    content: "Skip to content",
  },
  hero: {
    headline: "Learn Zig. Run it in the browser.",
    sub: "Short lessons, a real editor, and a path from hello world to comptime. No install required.",
    start: "Start learning",
    play: "Open playground",
  },
  how: {
    title: "How it works",
    readTitle: "Read a short lesson",
    readBody: "One idea at a time, in plain language. Watch a walkthrough only if you want to.",
    runTitle: "Run the example",
    runBody: "Change the sample in the editor and see what happens. No local toolchain.",
    checkTitle: "Check yourself",
    checkBody: "A short quiz at the end of each chapter. Writing code still does the real teaching.",
  },
  curriculum: {
    title: "Twelve chapters, one path",
    intro: "Start at the beginning, or jump to a topic. Progress stays in this browser.",
    start: "Start",
    core: "Core",
    advanced: "Advanced",
  },
  playground: {
    title: "A playground, not only a course",
    body: "Open a full editor when you want to try an idea without a lesson around it.",
    try: "Try the playground",
    channel: "Stable",
    channelHint: "Each channel will use its own compiler.",
    run: "Run",
    output: "Output",
  },
  community: {
    title: "Built in the open",
    body: "ZigLab is open source. Report issues, send lesson PRs, or just follow along.",
    github: "View the repo",
    report: "Report an issue",
    contribute: "Contribute a lesson",
  },
  sponsors: {
    strip: "ZigLab stays free because people support it.",
    empty: "No logos yet. When people and companies back the lab, they will show up here.",
    cta: "Become a sponsor",
    keepOnline: "Keep ZigLab online.",
  },
  footer: {
    tagline: "A friendly lab for learning Zig.",
    openSource: "ZigLab is open source.",
    navHeading: "ZigLab",
    legalHeading: "Legal",
    supportHeading: "Support",
    disclaimerLead:
      "ZigLab is an independent community project. Zig is developed at",
    trademark:
      "Zig is a trademark of the Zig Software Foundation. ZigLab is not affiliated with the Zig Software Foundation.",
    copyright: "ZigLab",
  },
} as const;

export type Messages = typeof en;
