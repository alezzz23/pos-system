import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        "[background-image:linear-gradient(90deg,transparent,hsla(var(--foreground),0.06),transparent)]",
        "bg-[length:200%_100%] [animation:shimmer_1.2s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
