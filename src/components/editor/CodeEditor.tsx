"use client";

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  HighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { zigLanguage } from "@/components/editor/zig-language";
import { cn } from "@/lib/utils";

const zigHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--accent)" },
  { tag: t.comment, color: "var(--text-muted)", fontStyle: "italic" },
  { tag: t.string, color: "var(--success)" },
  { tag: t.number, color: "var(--warning)" },
  { tag: t.typeName, color: "var(--accent)" },
  { tag: t.atom, color: "var(--warning)" },
  { tag: t.operator, color: "var(--text-muted)" },
  { tag: t.variableName, color: "var(--text)" },
]);

function editorTheme(dark: boolean) {
  return EditorView.theme(
    {
      "&": {
        height: "100%",
        fontSize: "13px",
        backgroundColor: "var(--bg-input)",
        color: "var(--text)",
      },
      "&.cm-focused": {
        outline: "none",
      },
      ".cm-scroller": {
        overflow: "auto",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
        fontFeatureSettings: '"calt" 1, "liga" 1',
        lineHeight: "1.65",
      },
      ".cm-content": {
        caretColor: "var(--accent)",
        padding: "12px 0",
      },
      ".cm-gutters": {
        backgroundColor: "var(--bg-input)",
        color: "var(--text-muted)",
        borderRight: "1px solid var(--line)",
      },
      ".cm-activeLine": {
        backgroundColor:
          "color-mix(in oklab, var(--accent) 8%, transparent)",
      },
      ".cm-activeLineGutter": {
        backgroundColor:
          "color-mix(in oklab, var(--accent) 8%, transparent)",
        color: "var(--text)",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--accent)",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor:
            "color-mix(in oklab, var(--accent) 28%, transparent) !important",
        },
    },
    { dark }
  );
}

export default function CodeEditor({
  value,
  onChange,
  onRun,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  onRun: () => void;
  className?: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartmentRef = useRef<Compartment | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";

  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
  }, [onChange, onRun]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) {
      return;
    }

    const themeCompartment = new Compartment();
    themeCompartmentRef.current = themeCompartment;

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          history(),
          indentUnit.of("    "),
          EditorState.tabSize.of(4),
          zigLanguage,
          syntaxHighlighting(zigHighlight),
          themeCompartment.of(editorTheme(dark)),
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                onRunRef.current();
                return true;
              },
            },
            {
              key: "Escape",
              run: (current) => {
                current.contentDOM.blur();
                return true;
              },
            },
            indentWithTab,
            ...defaultKeymap,
            ...historyKeymap,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      themeCompartmentRef.current = null;
    };
    // Mount once; value/theme sync in later effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    const themeCompartment = themeCompartmentRef.current;
    if (!view || !themeCompartment) {
      return;
    }
    view.dispatch({
      effects: themeCompartment.reconfigure(editorTheme(dark)),
    });
  }, [dark]);

  return (
    <div
      ref={parentRef}
      className={cn(
        "h-full min-h-0 overflow-hidden p-0.5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
        className
      )}
    />
  );
}
