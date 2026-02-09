"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { makeJourneyStepId } from "@/app/context/stepDefinitions";
import { Button } from "@/app/components/ui/button";
import StepCard from "@/app/components/layout/StepCard";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function StepAutoConversion() {
  const {
    nextStep,
    goToStep,
    updateFormData,
    formData,
    journeySteps,
    currentStepIndex,
    setBottomBarContent,
    journeyType,
  } = useJourney();
  const [choice, setChoice] = useState<"yes" | "newSalary" | null>(formData.autoConvertConsent ?? null);
  const [status, setStatus] = useState<"idle" | "converting" | "success">(
    formData.autoConvertStatus ?? "idle"
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    formData.salaryConversionAccountId ?? null
  );

  const stepLabel = useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  const accounts = useMemo(() => {
    const fromData = Array.isArray(formData.accounts) ? formData.accounts : null;
    if (fromData?.length) return fromData as Array<any>;

    // Fallback synthetic accounts (masked) when not provided by invite.
    return [
      { id: "acc-1", type: "Savings", numberMasked: "XX01 2345", branch: "Mumbai Main" },
      { id: "acc-2", type: "Savings", numberMasked: "XX09 6781", branch: "Mumbai Main" },
      { id: "acc-3", type: "Savings", numberMasked: "XX77 4402", branch: "Bengaluru HSR" },
    ];
  }, [formData.accounts]);

  const canContinue = !!selectedAccountId;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    updateFormData({ autoConvertStatus: "success", salaryConversionAccountId: selectedAccountId });
    goToStep(makeJourneyStepId(journeyType || "etb", "complete"));
  }, [canContinue, goToStep, journeyType, selectedAccountId, updateFormData]);
    // }, [canContinue, nextStep, selectedAccountId, updateFormData]);

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary w-full md:w-[360px]"
        >
          Continue
        </Button>
      </div>
    );
  }, [canContinue, handleContinue, setBottomBarContent]);

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      <div className="page-header">
        <h1 className="page-title">Convert to Salary Account</h1>
        <p className="page-subtitle">
          Would you like to convert your existing Savings Account to a Salary Account?
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Select account to convert</p>
            <p className="helper-text !mt-0">Choose the Savings Account you want to convert to Salary.</p>
          </div>

          <div className="space-y-2">
            {accounts.map((acc: any) => {
              const active = selectedAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    updateFormData({ salaryConversionAccountId: acc.id });
                  }}
                  className={[
                    "w-full rounded-[var(--radius-lg)] border p-3 text-left transition-colors",
                    active ? "border-[#004C8F] bg-blue-50/40" : "border-slate-200 bg-white hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {acc.type} • {acc.numberMasked}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">Branch: {acc.branch}</p>
                    </div>
                    <div
                      className={[
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                        active ? "border-[#004C8F]" : "border-slate-300",
                      ].join(" ")}
                    >
                      <div className={["h-2.5 w-2.5 rounded-full", active ? "bg-[#004C8F]" : "bg-transparent"].join(" ")} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setChoice("newSalary");
                updateFormData({ autoConvertConsent: "newSalary" });
                goToStep(makeJourneyStepId(journeyType || "etb", "etbIncomeDeclarations"));
              }}
              className={[
                "h-11 rounded-[var(--radius)] border px-4 text-sm font-semibold transition-colors text-left",
                choice === "newSalary"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              Create new salary account
            </button>
          </div>

          <p className="helper-text">
            You can also request conversion later from your account settings.
          </p>
        </div>
      </div>
    </StepCard>
  );
}

