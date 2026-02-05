"use client";

import React, { useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import StepCard from "@/app/components/layout/StepCard";
import { CheckCircle2, CreditCard, Globe } from "lucide-react";

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
    <StepCard step={stepLabel} maxWidth="3xl">
      <div className="page-header">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="page-title">Verify Yourself</h1>
            <p className="page-subtitle">Select an option to confirm your identity.</p>
          </div>
          <div className="rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Relax! No money will be debited from your account, this is for verification purposes only.
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1">
          Expires in: 03:24 mins
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setMethod("debit");
                setShowErrors(false);
              }}
              className={[
                "w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors flex items-center gap-3",
                method === "debit" ? "border-[#004C8F] bg-blue-50/40" : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="h-10 w-10 rounded-full bg-violet-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Debit Card</p>
                <p className="text-xs text-slate-500">Requires last 4 digits, expiry date & PIN</p>
              </div>
              <div
                className={[
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  method === "debit" ? "border-[#004C8F]" : "border-slate-300",
                ].join(" ")}
              >
                <div className={["h-2.5 w-2.5 rounded-full", method === "debit" ? "bg-[#004C8F]" : "bg-transparent"].join(" ")} />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("netbanking");
                setShowErrors(false);
              }}
              className={[
                "w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors flex items-center gap-3",
                method === "netbanking" ? "border-[#004C8F] bg-blue-50/40" : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Net Banking</p>
                <p className="text-xs text-slate-500">Requires password/MPIN</p>
              </div>
              <div
                className={[
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  method === "netbanking" ? "border-[#004C8F]" : "border-slate-300",
                ].join(" ")}
              >
                <div
                  className={["h-2.5 w-2.5 rounded-full", method === "netbanking" ? "bg-[#004C8F]" : "bg-transparent"].join(" ")}
                />
              </div>
            </button>
          </div>

          <div className="lg:col-span-2 rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5 space-y-4">
            {method === "debit" ? (
              <>
                <p className="text-base font-semibold text-slate-900">Enter Debit Card Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={`enterprise-input ${showErrors && !cardLast4 ? "error" : ""}`}
                    placeholder="Last 4 digits of your card"
                    inputMode="numeric"
                  />
                  <Input
                    type="month"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className={`enterprise-input ${showErrors && !cardExpiry ? "error" : ""}`}
                    placeholder="Expiry Date"
                  />
                  <Input
                    type="password"
                    value={cardPin}
                    onChange={(e) => setCardPin(e.target.value)}
                    className={`enterprise-input ${showErrors && !cardPin ? "error" : ""}`}
                    placeholder="PIN"
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-slate-900">Login to NetBanking</p>
                <div>
                  <label className="form-label">Customer ID</label>
                  <Input
                    value={netbankingId}
                    onChange={(e) => setNetbankingId(e.target.value)}
                    className={`enterprise-input ${showErrors && !netbankingId ? "error" : ""}`}
                    placeholder="Customer ID"
                  />
                </div>
              </>
            )}

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer select-none">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
                className="rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
              />
              I agree to the Terms & Conditions described in the notice here.
            </label>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="h-11 px-6" onClick={prevStep}>
                Cancel
              </Button>
              <Button
                type="button"
                className="btn-primary h-11 px-6"
                onClick={handleVerify}
                disabled={isVerifying || !isFormValid}
              >
                {method === "debit" ? "Verify" : "Login to Verify"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </StepCard>
  );
}
