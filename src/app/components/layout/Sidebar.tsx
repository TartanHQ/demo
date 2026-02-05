/* src/app/components/layout/Sidebar.tsx */

"use client";

import { useJourney } from "@/app/context/JourneyContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export default function Sidebar() {
  const { journeySteps, currentStepIndex, goToStep } = useJourney();

  const handleStepClick = (stepId: string, index: number) => {
    // Allow backtracking to completed steps or current step
    if (index <= currentStepIndex) {
      goToStep(stepId);
    }
  };

  return (
    <aside className="w-[280px] bg-white flex-col hidden lg:flex flex-shrink-0 z-20 border-l border-slate-100 h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Progress</h2>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {journeySteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id, index)}
              disabled={isPending}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors",
                isCurrent && "bg-blue-50",
                isCompleted && "hover:bg-slate-50",
                isPending && "opacity-40 cursor-not-allowed"
              )}
            >
              {/* Status Indicator */}
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                isCompleted && "bg-green-500",
                isCurrent && "bg-blue-600",
                isPending && "bg-slate-200"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-400" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  isCompleted && "text-slate-600",
                  isCurrent && "text-blue-600 font-semibold",
                  isPending && "text-slate-400"
                )}>
                  {step.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}