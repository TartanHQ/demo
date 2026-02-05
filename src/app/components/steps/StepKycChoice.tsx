"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { MapPin, FileText, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";
import { Button } from "@/app/components/ui/button";

export default function StepKycChoice() {
  const {
    nextStep,
    formData,
    updateFormData,
    switchToPhysicalKycFlow,
    switchToDigitalKycFlow,
    journeySteps,
    setBottomBarContent,
    journeyType,
  } = useJourney();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(formData.kycMethod || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    trackEvent('page_viewed', { page: 'kyc_choice' });
  }, []);

  const handleChoice = (method: "ekyc" | "physicalKyc") => {
    setSelectedMethod(method);

    updateFormData({ kycMethod: method });

    trackEvent('kyc_method_selected', { method });
  };

  const handleContinue = useCallback(() => {
    if (!selectedMethod) return;
    setIsLoading(true);
    if (selectedMethod === "physicalKyc") {
      switchToPhysicalKycFlow();
      setIsLoading(false);
      return;
    }
    if (!journeySteps.some(s => s.id === "ekycHandler")) {
      switchToDigitalKycFlow();
    } else {
      nextStep();
    }
    setTimeout(() => setIsLoading(false), 300);
  }, [journeySteps, nextStep, selectedMethod, switchToDigitalKycFlow, switchToPhysicalKycFlow]);

  const isValid = useMemo(() => !!selectedMethod, [selectedMethod]);

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
        </Button>
      </div>
    );
  }, [handleContinue, isLoading, isValid, setBottomBarContent]);

  return (
    <StepCard maxWidth="2xl">
      <div className="page-header">
        <h1 className="page-title">KYC Verification</h1>
        <p className="page-subtitle">Choose your preferred method to verify your identity.</p>
      </div>

      <div className="space-y-4">
        {(() => {
          const isSelected = selectedMethod === "ekyc";
          const isEtbWithKyc = journeyType === "etb-nk";
          return (
            <div
              onClick={() => handleChoice("ekyc")}
              className={[
                "w-full flex items-center gap-4 p-4 md:p-5 rounded-[var(--radius-lg)] border transition-colors cursor-pointer group relative overflow-hidden",
                isSelected ? "border-[#004C8F] bg-blue-50/40" : "border-blue-100 bg-blue-50/20 hover:border-[#004C8F] hover:bg-blue-50/50",
              ].join(" ")}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <FileText className="w-6 h-6 text-[#004C8F]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-bold text-slate-900">
                    {isEtbWithKyc ? "Debit Card/ Internet Banking Verification" : "Digital KYC via Aadhaar"}
                  </p>
                  {!isEtbWithKyc && (
                    <>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        Recommended
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                        Fast
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {isEtbWithKyc
                    ? "Verify using debit card or internet banking credentials."
                    : "Typically under 2 minutes. Requires Aadhaar registered mobile."}
                </p>
              </div>
              <div className={["w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "border-[#004C8F]" : "border-slate-200 group-hover:border-[#004C8F]"].join(" ")}>
                <div className={["w-3 h-3 rounded-full bg-[#004C8F] transition-opacity", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"].join(" ")} />
              </div>
            </div>
          );
        })()}

        {(() => {
          const isSelected = selectedMethod === "physicalKyc";
          return (
            <div
              onClick={() => handleChoice("physicalKyc")}
              className={[
                "w-full flex items-center gap-4 p-4 md:p-5 rounded-[var(--radius-lg)] border transition-colors cursor-pointer group relative overflow-hidden",
                isSelected ? "border-orange-500 bg-orange-50/40" : "border-slate-100 hover:border-blue-500 hover:bg-blue-50/50",
              ].join(" ")}
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-slate-900">Physical KYC</p>
                <p className="text-sm text-slate-500 mt-1">Complete verification at a branch or via scheduled visit.</p>
              </div>
            <div className={["w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "border-orange-600" : "border-slate-200 group-hover:border-[#004C8F]"].join(" ")}>
                <div className={["w-3 h-3 rounded-full bg-orange-600 transition-opacity", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"].join(" ")} />
              </div>
            </div>
          );
        })()}
      </div>

      {selectedMethod === "physicalKyc" && (
        <div className="text-center">
          <button
            onClick={() => handleChoice("ekyc")}
            className="text-sm font-semibold text-[#004C8F] hover:underline"
          >
            Switch to Digital KYC (Fast • Recommended)
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-400 max-w-sm mx-auto">
        Verification is mandatory as per RBI guidelines. Your data is encrypted and secure.
      </p>
    </StepCard>
  );
}
