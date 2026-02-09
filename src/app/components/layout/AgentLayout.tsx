"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { HelpCircle, Settings2, Globe, Shield, CreditCard, Calendar, ArrowLeft } from "lucide-react";
import { useBranding } from "@/app/context/BrandingContext";
import { useJourney } from "@/app/context/JourneyContext";
import JourneyProgressBar from "./JourneyProgressBar";
import WhitelabelModal from "../shared/WhitelabelModal";
import { cn } from "@/lib/utils";
import hdfcLogoPng from "../../../../assets/hdfclogo.png";
import { Button } from "@/app/components/ui/button";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
    const { config } = useBranding();
  const { bottomBarContent, showDashboard, currentStepIndex, journeyType, prevStep, journeySteps } = useJourney();
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isStepperGlassy, setIsStepperGlassy] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const showBackButton = useMemo(() => {
        if (showDashboard || currentStepIndex <= 0) return false;
        const currentStepId = journeySteps[currentStepIndex]?.id;
        return !String(currentStepId || "").endsWith(":complete");
    }, [showDashboard, currentStepIndex, journeySteps]);
    const showBottomBar = useMemo(() => !!bottomBarContent || showBackButton, [bottomBarContent, showBackButton]);
    const showStepper = useMemo(() => !showDashboard, [showDashboard]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const next = el.scrollTop > 6;
        setIsStepperGlassy((prev) => (prev === next ? prev : next));
    }, []);

    // Always reset scroll between steps/journeys (don't preserve previous step scroll).
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // Ensure we reset after content/layout updates.
        const raf = window.requestAnimationFrame(() => {
            el.scrollTo({ top: 0, left: 0, behavior: "auto" });
            setIsStepperGlassy(false);
        });

        return () => window.cancelAnimationFrame(raf);
    }, [currentStepIndex, showDashboard, journeyType]);

    return (
        <div
            className={cn(
                "flex h-screen w-full text-slate-900 font-sans overflow-hidden relative transition-all duration-300",
                config.preset === 'neobrutalist' ? "bg-white" : "bg-[#fcfdfe]"
            )}
            style={{
                '--primary-bank': config.primary,
                '--radius-bank': `${config.borderRadius}px`,
                '--glass-opacity': config.glassOpacity,
                fontFamily: config.fontFamily
            } as any}
        >
            <WhitelabelModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
            />

            {/* Premium Background System */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#f8f9fa]">
                {/* Mesh Gradient Layers */}
                <div
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[140px] rounded-full opacity-20 transition-colors duration-300"
                    style={{ backgroundColor: config.primary }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-15 transition-colors duration-300"
                    style={{ backgroundColor: config.secondary }}
                />
                <div
                    className="absolute top-[20%] right-[10%] w-[30%] h-[30%] blur-[100px] rounded-full bg-indigo-400/10"
                />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Main Center Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden h-full z-10 bg-transparent">

                {/* Glass Top Header - Modular Sizing */}
                <header className={cn(
                    "flex items-center justify-between px-4 md:px-6 lg:px-10 flex-shrink-0 z-30 fixed top-0 left-0 right-0 transition-all duration-200 gap-4 h-[var(--journey-header-h)]",
                    config.preset === 'neobrutalist' ? "bg-white border-b-4 border-black" : "bg-white border-b border-slate-200",
                    "shadow-sm"
                )}
                style={{
                    height: "calc(var(--journey-header-h) + env(safe-area-inset-top))",
                    paddingTop: "env(safe-area-inset-top)",
                }}>
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                onClick={() => setIsConfigOpen(true)}
                                className={cn(
                                    "flex items-center justify-center font-semibold transition-all duration-150 active:scale-95 cursor-pointer shrink-0",
                                    config.preset === 'neobrutalist' ? "shadow-[4px_4px_0_0_#000] border-2 border-black" : "",
                                    "h-[calc(var(--journey-header-h)-16px)] max-h-10 w-auto"
                                )}
                                style={{ borderRadius: config.preset === 'neobrutalist' ? '0px' : `${config.borderRadius}px` }}
                            >
                                {config.logo === "hdfc" ? (
                                    <Image
                                        src={hdfcLogoPng}
                                        alt="HDFC Bank"
                                        className="h-full w-auto object-contain"
                                        priority
                                    />
                                ) : (
                                    <span style={{ color: config.primary }}>{config.logo}</span>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="flex-1" />
                </header>

                {/* Fixed Stepper (stays visible while scrolling) */}
                {showStepper && (
                    <div
                        className={cn(
                            "fixed left-0 right-0 z-[60]",
                            "transition-colors duration-150"
                        )}
                        style={{
                            top: "calc(var(--journey-header-h) + env(safe-area-inset-top))",
                            height: "var(--journey-stepper-h)",
                            background: isStepperGlassy ? "rgba(255,255,255,0.78)" : "transparent",
                            backdropFilter: isStepperGlassy ? "blur(14px)" : "none",
                            WebkitBackdropFilter: isStepperGlassy ? "blur(14px)" : "none",
                            borderBottom: isStepperGlassy ? "1px solid rgba(226,232,240,0.7)" : "1px solid transparent",
                        }}
                    >
                        <div className="h-full px-4 md:px-6 lg:px-10 flex items-center">
                            <div className="w-full md:max-w-4xl md:mx-auto">
                                <JourneyProgressBar />
                            </div>
                        </div>
                    </div>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={cn(
                        "flex-1 overflow-y-auto relative flex flex-col items-center p-2 md:p-4 lg:p-5 overflow-x-hidden",
                        showBottomBar
                            ? "pb-[calc(var(--journey-bottom-bar-h)+env(safe-area-inset-bottom)+0.75rem)]"
                            : "pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
                    )}
                    style={{
                        paddingTop: showStepper
                            ? "calc(var(--journey-header-h) + env(safe-area-inset-top) + var(--journey-stepper-h) + 0.75rem)"
                            : "calc(var(--journey-header-h) + env(safe-area-inset-top) + 0.75rem)",
                    }}
                >
                    {/* Standard Dashboard Stage - RELIABLE ORIENTATION */}
                    <div
                        className={cn(
                            "w-full flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
                            showDashboard
                                ? (config.modules.headerSize === 'large'
                                    ? "max-w-full xl:max-w-[1700px] 2xl:max-w-[1800px]"
                                    : "max-w-full lg:max-w-[1500px]")
                                : "mx-auto max-w-6xl"
                        )}
                    >
                        {children}
                    </div>
                </div>

                {/* Fixed Bottom Action Bar */}
                {showBottomBar && (
                    <div
                        className={cn(
                            "fixed left-0 right-0 bottom-0 z-40",
                            config.preset === "neobrutalist"
                                ? "bg-white border-t-4 border-black"
                                : "bg-white border-t border-slate-200"
                        )}
                        style={{ height: "var(--journey-bottom-bar-h)" }}
                    >
                        <div
                            className="h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-10 flex items-center justify-between gap-3"
                            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                        >
                            {showBackButton ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="h-10 px-3 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                            ) : (
                                <div />
                            )}
                            {bottomBarContent}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
