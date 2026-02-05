"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import AgentMessage from "@/app/components/chat/AgentMessage";
import UserResponse from "@/app/components/chat/UserResponse";
import HelpIcon from "@/app/components/shared/HelpIcon";

export default function StepJourneySelection() {
  const { nextStep, formData, updateFormData, currentStepIndex, journeySteps } = useJourney();

  // Prefilled data from our system
  const prefilledData = {
    name: formData.name || "Chirag Sharma",
    panNumber: formData.panNumber || "ABCDE1234F",
    hasAccount: formData.hasAccount || false,
    accountNumber: formData.accountNumber || "",
  };

  const [isConfirmed, setIsConfirmed] = useState(false);

  const myIndex = journeySteps.findIndex(s => s.id === "journeySelection");
  const isHistory = myIndex !== -1 && myIndex < currentStepIndex;
  const isActive = myIndex === currentStepIndex;

  useEffect(() => {
    if (isActive) {
      trackEvent('page_viewed', { page: 'journey_selection' });
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
          Thanks {prefilledData.name}! I've verified your details.
        </AgentMessage>
        <UserResponse isNew={false}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3" />
            <span>Details Verified</span>
          </div>
        </UserResponse>
      </div>
    );
  }

  if (!isActive) return null;

  return (
    <div className="space-y-3 w-full animate-in slide-in-from-bottom-4 duration-300">
      <AgentMessage>
        I've fetched your details from our system. Please verify if everything looks correct.
      </AgentMessage>

      <div className="pl-8 space-y-3">
        <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Details</span>
            <HelpIcon tooltip="This information was fetched from our system" />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Full Name:</span>
              <span className="font-semibold text-slate-900">{prefilledData.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">PAN Number:</span>
              <span className="font-semibold text-slate-900">{prefilledData.panNumber}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Existing HDFC Account:</span>
              <span className="font-semibold text-slate-900">{prefilledData.hasAccount ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={isConfirmed}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          {isConfirmed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmed
            </>
          ) : (
            "Confirm & Continue"
          )}
        </Button>
      </div>
    </div>
  );
}
