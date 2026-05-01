"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  CreditCard,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";
import { getJourneyProgress, makeJourneyStepId } from "@/app/context/stepDefinitions";

// Cross-tab channel: the dashboard listens on this localStorage key to update
// the Journey Category column for "unknown" rows once we resolve the applicant
// to a concrete journey type.
const RESOLVED_JOURNEYS_KEY = "hdfcDashboard_resolvedJourneys";

type ResolvedJourney = "etb" | "ntb";

/**
 * Discovery welcome screen used when the journey category is not yet known
 * ("-" in the dashboard). The user enters Name + Mobile + DOB + PAN; once
 * submitted we "determine" the category and route them into the appropriate
 * downstream journey:
 *   - Resolved as ETB → step 2 of ETB: Auto Conv. (account selection)
 *   - Resolved as NTB → step 2 of NTB                (KYC selection)
 *
 * The resolution is also written back to localStorage under
 * `hdfcDashboard_resolvedJourneys` so the dashboard table reflects the
 * concrete category instead of "-".
 */
export default function StepUnknownWelcome() {
  const {
    formData,
    prefilledData,
    addNotification,
    setBottomBarContent,
    startJourney,
    journeySteps,
    currentStepIndex,
  } = useJourney();
  const { config } = useBranding();

  // Welcome is a pre-journey precursor — the helper returns undefined for it,
  // so no "Step X of N" pill appears on this screen.
  const stepLabel = React.useMemo(
    () => getJourneyProgress(journeySteps, currentStepIndex).label,
    [journeySteps, currentStepIndex]
  );

  // Name and Mobile come from the HR/HRIS record on the dashboard, so they
  // are prefilled and disabled (consistent with how the original 3 journeys
  // disable the Mobile field on their first screen).
  const initialName: string =
    (typeof prefilledData?.name === "string" && prefilledData.name) ||
    (typeof formData?.name === "string" && formData.name) ||
    "";
  const initialMobile: string =
    (typeof prefilledData?.mobileNumber === "string" && prefilledData.mobileNumber) ||
    (typeof formData?.mobileNumber === "string" && formData.mobileNumber) ||
    "";

  const [name, setName] = useState<string>(initialName);
  const [mobile, setMobile] = useState<string>(initialMobile);
  // DOB and PAN are intentionally NOT prefilled for "unknown" invites — the
  // applicant must enter these themselves so we can "look up" their journey.
  const [dob, setDob] = useState<string>(
    typeof prefilledData?.dob === "string" ? (prefilledData.dob as string) : ""
  );
  const [pan, setPan] = useState<string>(
    typeof prefilledData?.pan === "string" ? (prefilledData.pan as string) : ""
  );
  const [consent, setConsent] = useState<boolean>(false);
  const [isDetermining, setIsDetermining] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    mobile?: string;
    dob?: string;
    pan?: string;
    consent?: string;
  }>({});
  const lastBottomBarKeyRef = useRef<string | null>(null);
  const namePrefilled = Boolean(initialName);
  const mobilePrefilled = Boolean(initialMobile);

  useEffect(() => {
    trackEvent("page_viewed", { page: "discovery_welcome" });
  }, []);

  const validateForm = useCallback(() => {
    const errors: typeof validationErrors = {};

    if (!name?.trim()) {
      errors.name = "Please enter your full name";
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number starting with 6-9";
    }
    if (!dob) {
      errors.dob = "Please provide your date of birth";
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) {
      errors.pan = "Please enter your PAN number";
    } else if (!panRegex.test(pan)) {
      errors.pan = "Please enter a valid Indian PAN (e.g. ABCDE1234F)";
    }
    if (!consent) {
      errors.consent = "Please accept the terms to continue";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [consent, dob, mobile, name, pan]);

  const persistResolutionToDashboard = useCallback(
    (resolvedJourney: ResolvedJourney) => {
      if (typeof window === "undefined") return;
      const employeeId =
        (typeof prefilledData?.employeeId === "string" && prefilledData.employeeId) ||
        (typeof formData?.employeeId === "string" && formData.employeeId) ||
        "";
      if (!employeeId) return;
      try {
        const raw = localStorage.getItem(RESOLVED_JOURNEYS_KEY);
        const existing: Record<string, ResolvedJourney> = raw ? JSON.parse(raw) : {};
        existing[String(employeeId)] = resolvedJourney;
        localStorage.setItem(RESOLVED_JOURNEYS_KEY, JSON.stringify(existing));
      } catch {
        // ignore — best-effort cross-tab signal
      }
    },
    [formData, prefilledData]
  );

  const handleDetermineAndContinue = useCallback(() => {
    if (!validateForm()) return;

    setIsDetermining(true);
    addNotification(
      `${config.name}`,
      "Verifying your details to determine the best account opening journey…"
    );

    // The dashboard hints at the resolution via prefilledData. In a real
    // system this is where an identity / CBS lookup would happen. Default to
    // ETB if no hint is provided.
    const hint = prefilledData?.resolvedJourneyHint;
    const resolvedJourney: ResolvedJourney = hint === "ntb" ? "ntb" : "etb";

    persistResolutionToDashboard(resolvedJourney);

    setTimeout(() => {
      const merged = {
        ...prefilledData,
        ...formData,
        name,
        mobileNumber: mobile,
        dob,
        pan,
      };
      if (resolvedJourney === "ntb") {
        // Skip OTP welcome (verification already done here); land on step 2.
        startJourney("ntb", merged, makeJourneyStepId("ntb", "kycChoice"));
      } else {
        startJourney("etb", merged, makeJourneyStepId("etb", "autoConversion"));
      }
    }, 900);
  }, [
    addNotification,
    config.name,
    dob,
    formData,
    mobile,
    name,
    pan,
    persistResolutionToDashboard,
    prefilledData,
    startJourney,
    validateForm,
  ]);

  useEffect(() => {
    const bottomBarKey = `${isDetermining}|${name}|${mobile}|${dob}|${pan}|${consent}`;
    if (lastBottomBarKeyRef.current === bottomBarKey) return;
    lastBottomBarKeyRef.current = bottomBarKey;

    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={handleDetermineAndContinue}
          disabled={isDetermining}
          variant="primary-cta"
          className="btn-primary w-full md:w-[360px]"
          style={{ background: "#000000 !important" }}
        >
          {isDetermining ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Determining your journey…
            </>
          ) : (
            <>
              Verify & Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    );
  }, [
    consent,
    dob,
    handleDetermineAndContinue,
    isDetermining,
    mobile,
    name,
    pan,
    setBottomBarContent,
  ]);

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Verify Your Identity</h1>
        <p className="page-subtitle">
          Please provide your details so we can set up the right account opening journey for you.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isDetermining) handleDetermineAndContinue();
        }}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-400" />
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationErrors.name) {
                setValidationErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={`enterprise-input ${validationErrors.name ? "error" : ""} ${
              namePrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
            placeholder="As per your PAN card"
            disabled={isDetermining || namePrefilled}
          />
          {validationErrors.name && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.name}
            </p>
          )}
        </div>

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
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                if (validationErrors.mobile) {
                  setValidationErrors((prev) => ({ ...prev, mobile: undefined }));
                }
              }}
              className={`enterprise-input pl-12 relative z-0 ${
                validationErrors.mobile ? "error" : ""
              } ${mobilePrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              placeholder="98765 43210"
              disabled={isDetermining || mobilePrefilled}
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
                setValidationErrors((prev) => ({ ...prev, dob: undefined }));
              }
            }}
            max={new Date().toISOString().split("T")[0]}
            className={`enterprise-input ${validationErrors.dob ? "error" : ""}`}
            disabled={isDetermining}
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
              const next = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              setPan(next);
              if (validationErrors.pan) {
                setValidationErrors((prev) => ({ ...prev, pan: undefined }));
              }
            }}
            className={`enterprise-input uppercase ${validationErrors.pan ? "error" : ""}`}
            placeholder="ABCDE1234F"
            disabled={isDetermining}
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
              onCheckedChange={(v) => {
                const next = v === true;
                setConsent(next);
                if (validationErrors.consent) {
                  setValidationErrors((prev) => ({ ...prev, consent: undefined }));
                }
              }}
              disabled={isDetermining}
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
      </form>
    </StepCard>
  );
}
