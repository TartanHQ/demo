"use client";

import React from "react";
import { AlertCircle, RefreshCcw, Home, PhoneCall } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useBranding } from "@/app/context/BrandingContext";
import { useJourney } from "@/app/context/JourneyContext";

interface StepErrorProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    onBackToHome?: () => void;
}

export default function StepError({
    title = "Something went wrong",
    message = "We encountered a temporary technical issue. Please try again in a few moments.",
    onRetry,
    onBackToHome
}: StepErrorProps) {
    const { config } = useBranding();
    const { setShowDashboard, resetJourney } = useJourney();

    const handleBackHome = () => {
        if (onBackToHome) {
            onBackToHome();
        } else {
            resetJourney();
            setShowDashboard(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-red-100/50 rounded-full flex items-center justify-center mb-6 border border-red-200 shadow-sm">
                <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 w-full max-w-md text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
                </div>

                <div className="space-y-3 pt-4">
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            className="w-full h-12 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{ backgroundColor: config.primary }}
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={handleBackHome}
                        className="w-full h-12 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Button>

                    <button className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center justify-center gap-2 w-full pt-2">
                        <PhoneCall className="w-3 h-3" />
                        Contact Support: 1800-425-4332
                    </button>
                </div>
            </div>
        </div>
    );
}
