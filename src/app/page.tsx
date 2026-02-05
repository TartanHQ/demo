"use client";

import { useJourney } from "@/app/context/JourneyContext";
import { STEP_COMPONENTS } from "@/app/context/stepDefinitions";
import JourneyStepWrapper from "@/app/components/JourneyStepWrapper";
import Dashboard from "@/app/components/Dashboard";
import AgentLayout from "@/app/components/layout/AgentLayout";
import { AnimatePresence } from "framer-motion";
import React from "react";

export default function Home() {
  const {
    journeySteps,
    currentStepIndex,
    currentBranchComponent,
    showDashboard,
  } = useJourney();

  const BranchComponent = currentBranchComponent;

  if (showDashboard) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AgentLayout>
        <div className="max-w-7xl mx-auto py-4 lg:py-8">
          <AnimatePresence mode="wait">
            <JourneyStepWrapper key={BranchComponent ? 'branch' : journeySteps[currentStepIndex]?.id || 'current'}>
              {BranchComponent ? (
                <BranchComponent />
              ) : (
                journeySteps[currentStepIndex] ? React.createElement(STEP_COMPONENTS[journeySteps[currentStepIndex].id]) : null
              )}
            </JourneyStepWrapper>
          </AnimatePresence>
        </div>
      </AgentLayout>
    </div>
  );
}