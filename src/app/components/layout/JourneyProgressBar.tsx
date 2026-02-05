"use client";

import React, { useMemo } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";

export default function JourneyProgressBar() {
  const { journeySteps, currentStepIndex } = useJourney();
  const { config } = useBranding();

  const total = journeySteps.length;
  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(100, Math.max(0, ((currentStepIndex + 1) / total) * 100));
  }, [currentStepIndex, total]);

  if (!total) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
        <span>Progress</span>
        <span>
          {currentStepIndex + 1} / {total}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: config.primary }}
        />
      </div>
    </div>
  );
}
