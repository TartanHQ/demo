"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { cn } from "@/lib/utils";

export default function StepChipsProgress() {
  const { journeySteps, currentStepIndex, goToStep } = useJourney();
  const { config } = useBranding();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const steps = useMemo(() => journeySteps ?? [], [journeySteps]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const active = container.querySelector<HTMLElement>("[data-active-step='true']");
    if (!active) return;

    // Keep active chip visible on mobile without jarring jumps.
    active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [currentStepIndex]);

  if (!steps.length) return null;

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 md:gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar py-1 md:justify-center"
      >
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isClickable = isCompleted;

          const completedBg = "rgba(5, 150, 105, 0.08)"; // success tint
          const completedBorder = "rgba(5, 150, 105, 0.35)";

          return (
            <button
              key={step.id}
              data-active-step={isCurrent ? "true" : "false"}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-[999px] border px-2.5 py-1 text-[11px] font-semibold md:px-3 md:py-1.5 md:text-xs",
                "transition-colors duration-150",
                isClickable ? "cursor-pointer hover:bg-white" : "cursor-default",
                isCurrent
                  ? "text-white"
                  : isCompleted
                    ? "bg-white"
                    : "bg-white/70 text-slate-700"
              )}
              type="button"
              onClick={() => {
                if (isClickable) goToStep(step.id);
              }}
              disabled={!isClickable}
              style={{
                backgroundColor: isCurrent ? config.primary : isCompleted ? completedBg : undefined,
                borderColor: isCurrent
                  ? config.primary
                  : isCompleted
                    ? completedBorder
                    : "rgba(148, 163, 184, 0.35)",
                color: isCompleted && !isCurrent ? "rgb(5, 150, 105)" : undefined,
              }}
            >
              <span className="tabular-nums">{idx + 1}</span>
              <span className="mx-1 opacity-70">|</span>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

