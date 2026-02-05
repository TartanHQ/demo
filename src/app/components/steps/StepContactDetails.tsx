"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2, Edit2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import AgentMessage from "@/app/components/chat/AgentMessage";
import UserResponse from "@/app/components/chat/UserResponse";
import HelpIcon from "@/app/components/shared/HelpIcon";

export default function StepContactDetails() {
    const { nextStep, formData, updateFormData, currentStepIndex, journeySteps } = useJourney();

    // Prefilled data from our records
    const prefilledData = {
        email: formData.email || "chirag.sharma@techcorp.in",
        phone: formData.phone || formData.mobileNumber || "9876543210",
        address: formData.address || "123, MG Road, Sector 14",
        city: formData.city || "Gurgaon",
        pincode: formData.pincode || "122001",
    };

    const [isConfirmed, setIsConfirmed] = useState(false);

    const myIndex = journeySteps.findIndex(s => s.id === "contactDetails");
    const isHistory = myIndex !== -1 && myIndex < currentStepIndex;
    const isActive = myIndex === currentStepIndex;

    useEffect(() => {
        if (isActive) {
            trackEvent('page_viewed', { page: 'contact_details' });
        }
    }, [isActive]);

    const handleConfirm = () => {
        setIsConfirmed(true);
        updateFormData(prefilledData);

        setTimeout(() => {
            nextStep();
        }, 500);
    };

    if (isHistory) {
        return (
            <div className="space-y-3">
                <AgentMessage isNew={false}>
                    Thanks! I've confirmed your contact details.
                </AgentMessage>
                <UserResponse isNew={false}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Details Confirmed</span>
                    </div>
                </UserResponse>
            </div>
        );
    }

    if (!isActive) return null;

    return (
        <div className="space-y-3 w-full animate-in slide-in-from-bottom-4 duration-300">
            <AgentMessage>
                I've fetched your contact details from our records. Please verify if everything is correct.
            </AgentMessage>

            <div className="pl-8 space-y-3">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Information</span>
                        <HelpIcon tooltip="This information was fetched from our records" />
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Email:</span>
                            <span className="font-semibold text-slate-900">{prefilledData.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Mobile:</span>
                            <span className="font-semibold text-slate-900">{prefilledData.phone}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">Address:</span>
                            <span className="font-semibold text-slate-900 text-right">{prefilledData.address}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200">
                            <span className="text-slate-600">City:</span>
                            <span className="font-semibold text-slate-900">{prefilledData.city}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-600">Pincode:</span>
                            <span className="font-semibold text-slate-900">{prefilledData.pincode}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleConfirm}
                        disabled={isConfirmed}
                        className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                        {isConfirmed ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirmed
                            </>
                        ) : (
                            "Confirm Details"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
