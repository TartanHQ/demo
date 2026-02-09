"use client";

import { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { makeJourneyStepId } from "@/app/context/stepDefinitions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, MapPin, Search, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";

export default function StepPhysicalKyc() {
  const { resetJourney, goToStep, journeyType } = useJourney();

  useEffect(() => {
    trackEvent('page_viewed', { page: 'physicalKyc' });
  }, []);

  const handleDone = () => {
    trackEvent('physical_kyc_journey_ended');
    resetJourney();
  };

  return (
    <StepCard maxWidth="2xl">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="success-icon">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
      </div>

      {/* Header */}
      <div className="page-header text-center">
        <h1 className="page-title">Application Saved</h1>
        <p className="page-subtitle">
          Visit your nearest HDFC Bank branch to complete KYC verification. Your account activation will not be processed right now in this case. 
        </p>
      </div>

      {/* Reference ID */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          Reference ID
        </p>
        <p className="text-3xl font-bold text-gray-900 text-center font-mono tracking-wide">
          SR10002345
        </p>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Valid for 7 days. Please present this ID at the branch.
        </p>
      </div>

      {/* Branch Locator */}
      <div className="pt-2">
        <label htmlFor="pincode" className="form-label">
          Find Nearest Branch
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="pincode"
              placeholder="Enter pincode"
              type="tel"
              maxLength={6}
              className="enterprise-input pl-10"
            />
          </div>
          <Button className="btn-secondary px-4">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleDone}
          className="btn-primary w-full"
        >
          I've Noted the Details
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <button
            onClick={() => journeyType && goToStep(makeJourneyStepId(journeyType, "ekycHandler"))}
            className="btn-link"
          >
            Switch to Digital KYC (Faster)
          </button>
        </div>
      </div>
    </StepCard>
  );
}
