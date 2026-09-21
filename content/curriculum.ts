export type ChapterLevel = "start" | "core" | "advanced";

export type ChapterMeta = {
  id: string;
  order: number;
  title: string;
  level: ChapterLevel;
  goal: string;
  stub?: boolean;
};

export const chapters: ChapterMeta[] = [
  {
    id: "welcome",
    order: 1,
    title: "Welcome",
    level: "start",
    goal: "Know what Zig is, how this lab works, and where Zig fits.",
  },
  {
    id: "hello-world",
    order: 2,
    title: "First program",
    level: "start",
    goal: "Run a tiny program, change a string, and read a compiler error.",
  },
  {
    id: "values",
    order: 3,
    title: "Values and types",
    level: "start",
    goal: "Bind names with const and var, print numbers, and see overflow.",
  },
  {
    id: "control-flow",
    order: 4,
    title: "If, while, switch",
    level: "core",
    goal: "Choose a path with if, repeat with while, and branch with switch.",
  },
  {
    id: "functions",
    order: 5,
    title: "Functions",
    level: "core",
    goal: "Define functions, pass arguments, and return values.",
  },
  {
    id: "arrays",
    order: 6,
    title: "Arrays, strings, slices",
    level: "core",
    goal: "Work with arrays, byte strings, slices, and for.",
  },
  {
    id: "types-user",
    order: 7,
    title: "Structs and enums",
    level: "core",
    goal: "Model data with structs, methods, enums, and a short union peek.",
  },
  {
    id: "memory",
    order: 8,
    title: "Pointers and optionals",
    level: "advanced",
    goal: "Use pointers, optionals, and orelse without guessing.",
  },
  {
    id: "errors",
    order: 9,
    title: "Errors, try, catch, defer",
    level: "advanced",
    goal: "Treat errors as values and clean up with defer.",
  },
  {
    id: "comptime",
    order: 10,
    title: "Comptime basics",
    level: "advanced",
    goal: "See comptime as ordinary Zig that runs while compiling.",
  },
  {
    id: "capstone",
    order: 11,
    title: "Capstone",
    level: "advanced",
    goal: "Put a few ideas together in memory, then know what to learn next.",
  },
  {
    id: "interop",
    order: 12,
    title: "Build and C interop",
    level: "advanced",
    goal: "Know what zig build and talking to C are for, on your own machine.",
  },
];
