"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepBannerProps {
    title?: string;
    name?: string;
    subTitle?: string;
    className?: string;
}

export default function StepBanner({ title, name, subTitle, className }: StepBannerProps) {
    return (
        <div className={cn("w-full max-w-4xl mx-auto bg-gradient-to-r from-[#004A99] via-[#005cb3] to-[#004A99] rounded-3xl overflow-hidden shadow-premium relative mb-8", className)}>
            <div className="absolute top-0 right-0 w-64 h-full opacity-20 bg-[url('https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/297c88c7-24a3-41c1-9257-268e3981881a?')] bg-no-repeat bg-right-center bg-contain" />
            <div className="p-8 md:p-10 flex flex-col items-start justify-center relative z-10 text-white min-h-[180px]">
                {title && <h2 className="text-xl md:text-2xl font-bold mb-4 opacity-90">{title}</h2>}
                {name && (
                    <div className="mb-4">
                        <p className="text-sm opacity-70 font-semibold uppercase tracking-wider">Name :</p>
                        <p className="text-2xl md:text-3xl font-extrabold">{name}</p>
                    </div>
                )}
                {subTitle && (
                    <div className="mt-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                        <p className="text-lg font-extrabold">{subTitle}</p>
                    </div>
                )}
            </div>
            {/* Decorative pulse element */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>
    );
}
