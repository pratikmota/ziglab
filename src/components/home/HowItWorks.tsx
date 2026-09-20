import { BookOpen, CircleCheck, Play } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { en } from "@/lib/i18n/en";

const steps = [
  {
    icon: BookOpen,
    title: en.how.readTitle,
    body: en.how.readBody,
  },
  {
    icon: Play,
    title: en.how.runTitle,
    body: en.how.runBody,
  },
  {
    icon: CircleCheck,
    title: en.how.checkTitle,
    body: en.how.checkBody,
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {en.how.title}
      </h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title} className="shadow-none">
            <CardHeader>
              <step.icon className="size-5 text-primary" aria-hidden />
              <CardTitle className="mt-3">{step.title}</CardTitle>
              <CardDescription className="text-pretty">
                {step.body}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
