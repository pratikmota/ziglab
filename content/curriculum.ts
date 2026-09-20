export type ChapterLevel = "start" | "core" | "advanced";

export type ChapterMeta = {
  id: string;
  order: number;
  title: string;
  level: ChapterLevel;
  goal: string;
};

export const chapters: ChapterMeta[] = [
  {
    id: "welcome",
    order: 1,
    title: "Welcome",
    level: "start",
    goal: "Know what Zig is and how ZigLab works.",
  },
  {
    id: "hello-world",
    order: 2,
    title: "First program",
    level: "start",
    goal: "See a full tiny program and the print call.",
  },
  {
    id: "values",
    order: 3,
    title: "Values and types",
    level: "start",
    goal: "Assign values, see integers, floats, bools, const vs var.",
  },
  {
    id: "arrays",
    order: 4,
    title: "Arrays, strings, slices",
    level: "core",
    goal: "Work with arrays, byte strings, and slices.",
  },
  {
    id: "control-flow",
    order: 5,
    title: "If, while, for",
    level: "core",
    goal: "Choose paths and loop over data.",
  },
  {
    id: "functions",
    order: 6,
    title: "Functions",
    level: "core",
    goal: "Define functions, pass arguments, and return values.",
  },
  {
    id: "errors",
    order: 7,
    title: "Errors, try, catch, defer",
    level: "core",
    goal: "Treat errors as values and clean up with defer.",
  },
  {
    id: "types-user",
    order: 8,
    title: "Structs, enums, unions",
    level: "core",
    goal: "Model data with structs, enums, and unions.",
  },
  {
    id: "memory",
    order: 9,
    title: "Pointers and optionals",
    level: "advanced",
    goal: "Use pointers and optionals without guessing.",
  },
  {
    id: "comptime",
    order: 10,
    title: "Comptime basics",
    level: "advanced",
    goal: "See comptime as ordinary Zig that runs while compiling.",
  },
  {
    id: "interop",
    order: 11,
    title: "Build and C interop",
    level: "advanced",
    goal: "Know what zig build and talking to C are for.",
  },
  {
    id: "capstone",
    order: 12,
    title: "Capstone",
    level: "advanced",
    goal: "Put a few ideas together, then know what to learn next.",
  },
];
