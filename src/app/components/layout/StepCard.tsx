import React from "react";
import { cn } from "@/lib/utils";

interface StepCardProps {
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    step?: string;
}

export default function StepCard({ children, maxWidth = "2xl", step }: StepCardProps) {
    return (
        <div className={cn("w-full mx-auto")}>
            <div className="enterprise-card w-full">
                {step && (
                    <div className="step-progress mb-6">
                        <span>{step}</span>
                    </div>
                )}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
