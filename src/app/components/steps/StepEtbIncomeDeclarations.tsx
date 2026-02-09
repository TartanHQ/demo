"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { makeJourneyStepId } from "@/app/context/stepDefinitions";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";

export default function StepEtbIncomeDeclarations() {
  const { updateFormData, formData, journeySteps, currentStepIndex, setBottomBarContent, goToStep, journeyType } = useJourney();
  const [incomeRange, setIncomeRange] = useState(formData.incomeRange || "");
  const [isPep, setIsPep] = useState<boolean>(!!formData.isPep);
  const [isIndianNational, setIsIndianNational] = useState<boolean>(formData.isIndianNational !== false);
  const [isTaxResidentIndiaOnly, setIsTaxResidentIndiaOnly] = useState<boolean>(formData.isTaxResidentIndiaOnly !== false);

  const stepLabel = useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  const incomeRanges = useMemo(
    () => [
      { value: "0-5L", label: "Up to ₹5L" },
      { value: "5-10L", label: "₹5L – ₹10L" },
      { value: "10-15L", label: "₹10L – ₹15L" },
      { value: "15-25L", label: "₹15L – ₹25L" },
      { value: "25L+", label: "₹25L+" },
    ],
    []
  );

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={() => {
            updateFormData({ incomeRange, isPep, isIndianNational, isTaxResidentIndiaOnly });
            const targetJourney = journeyType || "etb";
            goToStep(makeJourneyStepId(targetJourney, "conversionVerification"));
          }}
          disabled={!incomeRange}
          className="btn-primary w-full md:w-[360px]"
        >
          Continue
        </Button>
      </div>
    );
  }, [goToStep, incomeRange, isIndianNational, isPep, isTaxResidentIndiaOnly, journeyType, setBottomBarContent, updateFormData]);

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      <div className="page-header">
        <h1 className="page-title">Income & Declarations</h1>
        <p className="page-subtitle">Select your income range and confirm regulatory declarations.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="form-label">Annual Income Range</label>
          <Select value={incomeRange} onValueChange={setIncomeRange}>
            <SelectTrigger className="enterprise-input flex items-center justify-between">
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
              {incomeRanges.map((r) => (
                <SelectItem key={r.value} value={r.value} className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Regulatory Declarations
            </p>
            <p className="text-xs text-gray-600 mt-1">As per RBI/Compliance requirements, please confirm the below.</p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Are you a Politically Exposed Person (PEP)?", value: isPep, setValue: setIsPep, key: "isPep" },
              { label: "Are you an Indian national?", value: isIndianNational, setValue: setIsIndianNational, key: "isIndianNational" },
              { label: "Are you a Tax Resident of India only?", value: isTaxResidentIndiaOnly, setValue: setIsTaxResidentIndiaOnly, key: "isTaxResidentIndiaOnly" },
            ].map((q) => (
              <div key={q.key} className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-800">{q.label}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => q.setValue(false)}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === false ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => q.setValue(true)}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === true ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Yes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
