"use client";

import React, { useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import StepCard from "@/app/components/layout/StepCard";
import { CheckCircle2, Loader2 } from "lucide-react";

type VerificationMethod = "debit" | "netbanking";

export default function StepConversionVerification() {
  const { nextStep, prevStep, journeySteps, currentStepIndex, updateFormData } = useJourney();
  const [method, setMethod] = useState<VerificationMethod>("debit");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [netbankingId, setNetbankingId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const stepLabel = useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  const isDebitValid = cardLast4.trim().length === 4 && !!cardExpiry.trim() && !!cardPin.trim();
  const isNetbankingValid = !!netbankingId.trim();
  const isFormValid = termsAccepted && (method === "debit" ? isDebitValid : isNetbankingValid);

  const handleVerify = () => {
    setShowErrors(true);
    if (!isFormValid) return;
    setIsVerifying(true);
    window.setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
      updateFormData({
        autoConvertVerified: true,
        verificationMethod: method,
      });
    }, 900);
  };

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      <div className="page-header">
        <h1 className="page-title">Verify Account</h1>
        <p className="page-subtitle">Verify the selected account to continue.</p>
      </div>

      {verified ? (
        <div className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-2">
          <div className="flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-sm font-semibold text-emerald-800">Verified</p>
          <p className="text-xs text-emerald-700">
            Your account has been verified and converted to a Salary Account.
          </p>
          <div className="pt-2">
            <Button type="button" className="btn-primary w-full md:w-[360px]" onClick={nextStep}>
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod("debit");
                setShowErrors(false);
              }}
              className={[
                "h-11 rounded-[var(--radius)] border px-4 text-sm font-semibold transition-colors text-left",
                method === "debit" ? "bg-[#004C8F] text-white border-[#004C8F]" : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              Verify with Debit Card
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("netbanking");
                setShowErrors(false);
              }}
              className={[
                "h-11 rounded-[var(--radius)] border px-4 text-sm font-semibold transition-colors text-left",
                method === "netbanking"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              Verify with Netbanking
            </button>
          </div>

          {method === "debit" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Last 4 digits of your card</label>
                  <Input
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={`enterprise-input ${showErrors && !cardLast4 ? "error" : ""}`}
                    placeholder="1234"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="form-label">Expiry date</label>
                  <Input
                    type="month"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className={`enterprise-input ${showErrors && !cardExpiry ? "error" : ""}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">PIN</label>
                  <Input
                    type="password"
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value)}
                    className={`enterprise-input ${showErrors && !cardPin ? "error" : ""}`}
                    placeholder="••••"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="form-label">Customer ID</label>
                <Input
                  value={netbankingId}
                  onChange={(e) => setNetbankingId(e.target.value)}
                  className={`enterprise-input ${showErrors && !netbankingId ? "error" : ""}`}
                  placeholder="Enter customer ID"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer select-none">
            <Checkbox
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(v === true)}
              className="rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
            />
            I accept the Terms & Conditions for verification.
          </label>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-10 px-4" onClick={prevStep}>
              Cancel
            </Button>
            <Button type="button" className="btn-primary h-10 px-4" onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : method === "debit" ? (
                "Verify"
              ) : (
                "Login and verify"
              )}
            </Button>
          </div>
        </div>
      )}
    </StepCard>
  );
}
