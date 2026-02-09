"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function Navbar() {
    const { currentStepIndex, journeySteps, goToStep } = useJourney();

    if (currentStepIndex === 0) return null;

    const navSteps = journeySteps.filter(step => !String(step.id || "").endsWith(":welcome"));

    return (
        <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-20 md:h-24 flex flex-col items-center justify-center">

                {/* Stepper Breadcrumb */}
                <div className="flex items-center overflow-x-auto scrollbar-hide w-full max-w-5xl justify-start md:justify-center gap-3 md:gap-4 px-8 md:px-12 py-2">
                    <div className="flex-shrink-0 w-4 md:hidden" /> {/* Spacer for mobile clipping */}
                    {navSteps.map((step, index) => {
                        // Offset index because we removed the first step
                        const realStepIndex = journeySteps.findIndex(s => s.id === step.id);
                        const isActive = realStepIndex === currentStepIndex;
                        const isCompleted = realStepIndex < currentStepIndex;

                        return (
                            <React.Fragment key={step.id}>
                                <button
                                    onClick={() => {
                                        if (isCompleted || isActive) {
                                            goToStep(step.id);
                                        }
                                    }}
                                    disabled={!isCompleted && !isActive}
                                    className={cn(
                                        "flex items-center gap-2 md:gap-3 px-5 md:px-8 h-10 md:h-12 rounded-full transition-all whitespace-nowrap text-[11px] md:text-[14px] font-black border uppercase tracking-wider",
                                        isActive
                                            ? "bg-[#0047CC] text-white border-transparent shadow-lg shadow-blue-900/20 z-10"
                                            : isCompleted
                                                ? "bg-green-50 text-green-700 border-green-200 cursor-pointer"
                                                : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
                                    )}
                                >
                                    {isCompleted && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />}
                                    <span>{step.title}</span>
                                </button>
                                {index < navSteps.length - 1 && (
                                    <ChevronRight className={cn(
                                        "w-3 h-3 md:w-4 md:h-4 shrink-0",
                                        isCompleted ? "text-green-300" : "text-slate-300"
                                    )} />
                                )}
                            </React.Fragment>
                        );
                    })}
                    <div className="flex-shrink-0 w-6 md:hidden" /> {/* Spacer for end of scroll */}
                </div>
            </div>
        </nav>
    );
}
