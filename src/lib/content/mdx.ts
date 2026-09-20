import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import { useMDXComponents } from "@/mdx-components";

export async function compileMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    useMDXComponents,
  });

  return Content;
}
