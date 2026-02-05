/* src/app/components/layout/MobileProgressBar.tsx */

"use client";

import { useJourney } from "@/app/context/JourneyContext";
// --- ADD THIS IMPORT ---
import { ALL_STEPS, STEP_COMPONENTS } from "@/app/context/stepDefinitions";

export default function MobileProgressBar() {
  const { journeySteps, currentStepIndex, currentBranchComponent } = useJourney();

  let title = journeySteps[currentStepIndex]?.title || "";
  let progressPercentage = ((currentStepIndex + 1) / journeySteps.length) * 100;

  if (currentBranchComponent) {
    const branchStepId = Object.keys(STEP_COMPONENTS).find(
      key => STEP_COMPONENTS[key] === currentBranchComponent
    );
    if (branchStepId && ALL_STEPS[branchStepId]) {
      title = ALL_STEPS[branchStepId].title;
    }
  }

  return (
    <div className="md:hidden w-full fixed top-0 left-0 bg-card/80 backdrop-blur-xl border-b border-border/50 h-20 z-40 px-6 py-4">
      <div className="flex flex-col justify-end h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {title}
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            {currentStepIndex + 1} / {journeySteps.length}
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-blue-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}