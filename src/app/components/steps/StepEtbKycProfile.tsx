"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import StepCard from "@/app/components/layout/StepCard";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Calendar, DollarSign, Loader2, Mail, Phone, User } from "lucide-react";

export default function StepEtbKycProfile() {
  const { nextStep, formData, updateFormData, setBottomBarContent, journeySteps, currentStepIndex } = useJourney();
  const [incomeRange, setIncomeRange] = useState(formData.incomeRange || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

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

  const isValid = !!incomeRange;

  const handleContinue = useCallback(() => {
    setShowErrors(true);
    if (!isValid) return;
    setIsLoading(true);
    updateFormData({ incomeRange });
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 800);
  }, [incomeRange, isValid, nextStep, updateFormData]);

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isLoading || !isValid}
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
        </Button>
      </div>
    );
  }, [handleContinue, isLoading, isValid, setBottomBarContent]);

  return (
    <StepCard
      step={(() => {
        const total = journeySteps.length || 0;
        if (!total) return undefined;
        return `Step ${currentStepIndex + 1} of ${total}`;
      })()}
      maxWidth="2xl"
    >
      <div className="page-header">
        <h1 className="page-title">Your Profile</h1>
        <p className="page-subtitle">Verify your prefilled details and update your income range if needed.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Full Name
            </label>
            <Input
              value={formData.name || ""}
              readOnly
              className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              Mobile Number
            </label>
            <Input
              value={formData.mobileNumber ? `+91 ${formData.mobileNumber}` : ""}
              readOnly
              className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email ID
            </label>
            <Input
              value={formData.email || ""}
              readOnly
              className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Date of Birth
            </label>
            <Input
              value={formData.dob || ""}
              readOnly
              className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-3">
          <label className="form-label flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            Annual Income Range
          </label>
          <Select value={incomeRange} onValueChange={setIncomeRange}>
            <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !incomeRange ? "error" : ""}`}>
              <SelectValue placeholder="Select income range" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
              {incomeRanges.map((r) => (
                <SelectItem
                  key={r.value}
                  value={r.value}
                  className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                >
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErrors && !incomeRange && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              Please select an income range.
            </p>
          )}
        </div>
      </form>
    </StepCard>
  );
}
