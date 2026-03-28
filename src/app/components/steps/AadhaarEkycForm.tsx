"use client";

import React, { useState, useEffect, useRef } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export type AadhaarEkycFormProps = {
  onComplete: () => void;
};

export default function AadhaarEkycForm({ onComplete }: AadhaarEkycFormProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const { formData, updateFormData, setBottomBarContent } = useJourney();
  const [aadhaarNumber, setAadhaarNumber] = useState(formData.aadhaarNumber || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [timer, setTimer] = useState(30);
  const [uidaiConsent, setUidaiConsent] = useState<boolean>(!!formData.ekycUidaiConsent);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    return () => setBottomBarContent(null);
  }, [setBottomBarContent]);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  const sendOtp = () => {
    setShowErrors(true);
    if (aadhaarNumber.length !== 12) {
      setValidationError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!uidaiConsent) {
      setValidationError("");
      return;
    }
    setValidationError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setTimer(30);
      setOtp("");
      updateFormData({ aadhaarNumber, ekycUidaiConsent: uidaiConsent });
    }, 800);
  };

  const verifyOtp = () => {
    if (otp.length !== 6) {
      setValidationError("Please enter a valid 6-digit OTP.");
      return;
    }

    setValidationError("");
    setIsLoading(true);
    trackEvent("ekyc_otp_verified");

    setTimeout(() => {
      setIsLoading(false);
      onCompleteRef.current();
    }, 800);
  };

  const resetAadhaarEntry = () => {
    setOtpSent(false);
    setOtp("");
    setTimer(30);
    setValidationError("");
  };

  useEffect(() => {
    if (!otpSent) {
      const getOtpDisabled = isLoading || aadhaarNumber.length !== 12 || !uidaiConsent;
      setBottomBarContent(
        <div className="w-full flex justify-end">
          <Button
            type="button"
            onClick={() => sendOtp()}
            disabled={getOtpDisabled}
            className="btn-primary w-full md:w-[360px]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Get OTP for Verification"}
          </Button>
        </div>
      );
      return;
    }

    const verifyDisabled = isLoading || otp.length !== 6;
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={() => verifyOtp()}
          disabled={verifyDisabled}
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Verification"}
        </Button>
      </div>
    );
  }, [otpSent, isLoading, otp.length, aadhaarNumber.length, uidaiConsent, setBottomBarContent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
        <Shield className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-900 leading-tight">
          <span className="font-bold">Secure Verification.</span> Your Aadhaar data is encrypted and used only for
          identity validation as per RBI guidelines.
        </p>
      </div>

      {otpSent && (
        <div className="page-header">
          <h2 className="page-title">Verify Identity</h2>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otpSent) verifyOtp();
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-end gap-2">
            <label className="form-label">Aadhaar Number</label>
            {otpSent && (
              <button type="button" onClick={resetAadhaarEntry} className="btn-link text-xs shrink-0">
                Edit Aadhaar
              </button>
            )}
          </div>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={12}
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
            className="enterprise-input text-center tracking-[0.2em]"
            placeholder="0000 0000 0000"
            disabled={otpSent}
            readOnly={otpSent}
            autoFocus={!otpSent}
          />
          {validationError && !otpSent && (
            <p className="error-text flex items-start gap-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {validationError}
            </p>
          )}
        </div>

        {!otpSent && (
          <>
            <div className={cn("rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4", !uidaiConsent ? "attention-pulse" : "")}>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={uidaiConsent}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    setUidaiConsent(next);
                    updateFormData({ ekycUidaiConsent: next });
                    if (showErrors) setValidationError("");
                  }}
                  className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I voluntarily authorize the Bank to use my Aadhaar details for eKYC authentication and to fetch my KYC
                  details from UIDAI for account opening. I indemnify the Bank against losses arising due to any difference in my
                  name on Aadhaar and PAN, if any.
                </span>
              </label>
              {showErrors && !uidaiConsent && (
                <p className="error-text mt-2">
                  <AlertCircle className="w-4 h-4" />
                  This consent is mandatory to proceed.
                </p>
              )}
            </div>
          </>
        )}

        {otpSent && (
          <div className="space-y-2">
            <label className="form-label">Aadhaar OTP</label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="enterprise-input text-center text-xl tracking-[0.5em] font-bold"
              placeholder="000000"
              autoFocus
            />
            <p className="text-xs text-center text-slate-500 mt-2">
              We&apos;ve sent a code to the mobile number registered with Aadhaar ending in{" "}
              <span className="font-semibold text-slate-900">xxxx {aadhaarNumber.slice(-4)}</span>
            </p>
            <div className="text-center pt-1">
              <button
                type="button"
                className={cn(
                  "text-sm transition-colors",
                  timer > 0 ? "text-slate-400 cursor-not-allowed" : "text-blue-600 font-medium hover:underline"
                )}
                disabled={timer > 0 || isLoading}
                onClick={() => setTimer(30)}
              >
                {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP"}
              </button>
            </div>
            {validationError && (
              <p className="error-text flex items-start gap-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {validationError}
              </p>
            )}
          </div>
        )}

        {otpSent && (
          <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-gray-50/80 p-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={uidaiConsent} disabled className="mt-0.5 opacity-70" />
              <span className="text-sm text-gray-600 leading-relaxed">
                I voluntarily authorize the Bank to use my Aadhaar details for eKYC authentication and to fetch my KYC
                details from UIDAI for account opening. I indemnify the Bank against losses arising due to any difference in my
                name on Aadhaar and PAN, if any.
              </span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
