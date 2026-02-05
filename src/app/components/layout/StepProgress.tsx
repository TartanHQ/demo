"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export default function StepProgress() {
    const { journeySteps, currentStepIndex } = useJourney();
    const { config } = useBranding();

    if (journeySteps.length === 0) return null;

    return (
        <div className="w-full py-2 bg-transparent">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between relative gap-2">
                    {/* Progress Background Line */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0 rounded-full" />

                    {/* Active Progress Line */}
                    <div
                        className="absolute top-1/2 left-0 h-[2px] transition-all duration-300 ease-out z-0 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]"
                        style={{
                            width: `${(currentStepIndex / (journeySteps.length - 1)) * 100}%`,
                            backgroundColor: config.primary
                        }}
                    />

                    {journeySteps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 min-w-0 group">
                                <div
                                    className={cn(
                                        "w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center text-[10px] md:text-xs font-semibold transition-all duration-200",
                                        isCompleted ? "text-white" :
                                            isCurrent ? "bg-white border text-slate-900 scale-110 shadow-md" :
                                                "bg-white border border-slate-100 text-slate-300"
                                    )}
                                    style={{
                                        backgroundColor: isCompleted ? config.primary : 'white',
                                        borderColor: isCurrent ? config.primary : 'transparent',
                                    }}
                                >
                                    {isCompleted ? <Check className="w-3 h-3 md:w-4 md:h-4 stroke-[3px]" /> : index + 1}
                                </div>

                                {/* Intelligent Labeling: Only show active title on desktop to prevent clutter */}
                                <div className={cn(
                                    "absolute top-[110%] flex flex-col items-center transition-all duration-300",
                                    isCurrent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                                )}>
                                    <span className={cn(
                                        "text-[8px] md:text-[10px] uppercase font-semibold tracking-[0.2em] whitespace-nowrap px-2 py-1 rounded-md bg-white shadow-lg border border-slate-50",
                                        isCurrent ? "text-slate-900" : "text-slate-400"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
