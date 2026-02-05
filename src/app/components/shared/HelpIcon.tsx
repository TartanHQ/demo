"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpIconProps {
    tooltip: string;
    className?: string;
}

export default function HelpIcon({ tooltip, className }: HelpIconProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative inline-block">
            <span
                role="button"
                tabIndex={0}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className={cn(
                    "inline-flex p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-help",
                    className
                )}
            >
                <HelpCircle className="w-4 h-4" />
            </span>

            {showTooltip && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal animate-in fade-in zoom-in-95 duration-200">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
            )}
        </div>
    );
}
