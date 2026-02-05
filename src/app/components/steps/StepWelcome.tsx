"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, CreditCard, Loader2, AlertCircle, ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";

export default function StepWelcome() {
  const { updateFormData, formData, addNotification, nextStep, setBottomBarContent, journeySteps, currentStepIndex, journeyType } = useJourney();
  const { config } = useBranding();

  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || "");
  const [dob, setDob] = useState(formData.dob || "");
  const [pan, setPan] = useState(formData.pan || "");
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ mobile?: string; dob?: string; pan?: string; consent?: string }>({});
  const lastBottomBarKeyRef = useRef<string | null>(null);
  const otpSectionRef = useRef<HTMLDivElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const stepLabel = React.useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  useEffect(() => {
    trackEvent('page_viewed', { page: 'welcome' });
    if (formData.mobileNumber && !mobileNumber) setMobileNumber(formData.mobileNumber);
    if (formData.dob && !dob) setDob(formData.dob);
    if (formData.pan && !pan) setPan(formData.pan);
  }, [formData.mobileNumber, formData.dob, formData.pan]);

  const validateForm = useCallback(() => {
    const errors: { mobile?: string; dob?: string; pan?: string; consent?: string } = {};

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
      errors.mobile = "Please enter a valid 10-digit mobile number starting with 6-9";
    }
    if (!dob) {
      errors.dob = "Please provide your date of birth";
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan || !panRegex.test(pan)) {
      errors.pan = "Please enter a valid PAN number (e.g. ABCDE1234F)";
    }
    if (!consent) {
      errors.consent = "Please accept the terms to continue";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [consent, dob, mobileNumber, pan]);

  const requestOtp = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    updateFormData({ mobileNumber, dob, pan });

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      addNotification(`${config.name}`, `Your OTP is: 481230`);
    }, 800);
  }, [addNotification, config.name, dob, mobileNumber, pan, updateFormData, validateForm]);

  const verifyOtp = useCallback(() => {
    if (otp.length !== 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 800);
  }, [nextStep, otp.length]);

  useEffect(() => {
    if (!otpSent) return;

    // Mobile-first: ensure OTP section is visible and focused.
    // Use rAF so layout has committed before scrolling.
    const id = requestAnimationFrame(() => {
      otpSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      otpInputRef.current?.focus?.();
    });
    return () => cancelAnimationFrame(id);
  }, [otpSent]);

  useEffect(() => {
    const primaryLabel = otpSent ? "Verify & Continue" : "Request OTP";
    const disabled = isLoading || (otpSent ? otp.length !== 6 : false);
    const onClick = otpSent ? verifyOtp : requestOtp;
    const bottomBarKey = `${otpSent}|${isLoading}|${otp.length}|${mobileNumber}|${dob}|${pan}|${consent}`;

    // Prevent any accidental render -> effect -> state -> render loops by ensuring
    // we only update the bottom bar when its inputs meaningfully change.
    if (lastBottomBarKeyRef.current === bottomBarKey) return;
    lastBottomBarKeyRef.current = bottomBarKey;

    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={onClick}
          disabled={disabled}
          variant="primary-cta"
          className="btn-primary w-full md:w-[360px]"
          style={{background:"#000000 !important"}}
          
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {otpSent ? "Verifying..." : "Sending OTP..."}
            </>
          ) : (
            <>
              {primaryLabel}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    );
  }, [otpSent, otp.length, isLoading, setBottomBarContent, requestOtp, verifyOtp, mobileNumber, dob, pan, consent]);

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Verify Your Identity</h1>
        <p className="page-subtitle">
          Please provide your details to begin your account setup
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!otpSent) requestOtp();
        }}
        className="space-y-5"
      >
        {/* Mobile Number */}
        <div>
          <label htmlFor="mobile" className="form-label flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium text-sm z-10 pointer-events-none select-none">
              +91
            </span>
            <Input
              id="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (validationErrors.mobile) {
                  setValidationErrors(prev => ({ ...prev, mobile: undefined }));
                }
              }}
              className={`enterprise-input pl-12 relative z-0 ${validationErrors.mobile ? 'error' : ''} ${
                journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : ""
              }`}
              placeholder="98765 43210"
              autoFocus
              disabled={otpSent || journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"}
            />
          </div>
          {validationErrors.mobile && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.mobile}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dob" className="form-label flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            Date of Birth
          </label>
            <Input
            id="dob"
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              if (validationErrors.dob) {
                setValidationErrors(prev => ({ ...prev, dob: undefined }));
              }
            }}
            max={new Date().toISOString().split("T")[0]}
            className={`enterprise-input ${validationErrors.dob ? 'error' : ''} ${
              journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }`}
            disabled={otpSent || journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"}
          />
          {validationErrors.dob && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.dob}
            </p>
          )}
        </div>

        {/* PAN Number */}
        <div>
          <label htmlFor="pan" className="form-label flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            PAN Number
          </label>
          <Input
            id="pan"
            type="text"
            maxLength={10}
            value={pan}
            onChange={(e) => {
              setPan(e.target.value.toUpperCase());
              if (validationErrors.pan) {
                setValidationErrors(prev => ({ ...prev, pan: undefined }));
              }
            }}
            className={`enterprise-input uppercase ${validationErrors.pan ? 'error' : ''} ${
              journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : ""
            }`}
            placeholder="ABCDE1234F"
            disabled={otpSent || journeyType === "etb" || journeyType === "etb-nk" || journeyType === "ntb" || journeyType === "ntb-conversion"}
          />
          {validationErrors.pan && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.pan}
            </p>
          )}
        </div>

        {/* Consent */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Consent</span>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={consent}
              disabled={otpSent}
              onCheckedChange={(v) => {
                const next = v === true;
                setConsent(next);
                if (validationErrors.consent) {
                  setValidationErrors(prev => ({ ...prev, consent: undefined }));
                }
              }}
              className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              I authorize {config.name} to access my credit information and KYC details for account opening purposes.
            </span>
          </label>
          {validationErrors.consent && (
            <p className="error-text mt-2">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.consent}
            </p>
          )}
        </div>

        {/* OTP Section - Shows after request */}
        {otpSent && (
          <div
            ref={otpSectionRef}
            className="pt-4 border-t border-gray-200 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">
                A 6-digit code has been sent to +91 {mobileNumber}
              </p>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-blue-600 hover:text-blue-700 underline mt-1"
              >
                Change number
              </button>
            </div>

            <div>
              <label htmlFor="otp" className="form-label">
                Enter Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                }}
                ref={otpInputRef}
                className="enterprise-input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="• • • • • •"
                autoFocus
                disabled={isLoading}
              />
              <p className="text-center mt-3">
                <button
                  type="button"
                  className="btn-link text-sm"
                  onClick={requestOtp}
                >
                  Resend code
                </button>
              </p>
            </div>
          </div>
        )}
      </form>
    </StepCard>
  );
}
