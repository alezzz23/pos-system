import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 text-center",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(circle_at_center,black,transparent_65%)]">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-foreground/5 blur-2xl" />
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        {Icon ? (
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background/50 text-foreground shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}

        <div className="text-base font-semibold leading-tight">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        ) : null}

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
