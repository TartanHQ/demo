"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";

export default function StepKycDetails() {
    const { nextStep, updateFormData, formData, setBottomBarContent } = useJourney();
    const [consent, setConsent] = useState<boolean>(!!formData.vkycConsent);
    const [presentInIndia, setPresentInIndia] = useState<boolean>(!!formData.vkycPresentInIndia);
    const [showErrors, setShowErrors] = useState(false);

    useEffect(() => {
        trackEvent('page_viewed', { page: 'kyc_details_consent' });
    }, []);

    const isValid = consent && presentInIndia;

    const handleAgree = useCallback(() => {
        setShowErrors(true);
        if (!isValid) return;
        trackEvent('kyc_consent_agreed');
        updateFormData({ vkycConsent: true, vkycPresentInIndia: true });
        nextStep();
    }, [isValid, nextStep, updateFormData]);

    useEffect(() => {
        setBottomBarContent(
            <div className="w-full flex justify-end">
                <Button
                    type="button"
                    onClick={handleAgree}
                    disabled={!isValid}
                    className="btn-primary w-full md:w-[360px]"
                >
                    I Agree <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        );
    }, [handleAgree, isValid, setBottomBarContent]);

    return (
        <StepCard maxWidth="2xl">
            <div className="page-header">
                <h1 className="page-title">Video KYC Consent</h1>
                <p className="page-subtitle">Please review and provide consent to proceed with Video KYC (VCIP).</p>
            </div>

            <div className="space-y-5">
                <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-slate-50/40 p-4 text-sm text-slate-700 leading-relaxed space-y-3">
                    <p>
                        I hereby give my consent to complete my KYC through VCIP (Video Customer Identification Process) as
                        prescribed by RBI and processing of personal data (Name, PAN, DoB, Photograph, Lat/Long, Signature,
                        Economic and Financial Profile data) for KYC and agree to abide by the Terms and Conditions laid down
                        by the Bank for Savings/Salary Account.
                    </p>
                    <p>
                        I hereby authorize the Bank to open the Savings/Salary Account using Aadhaar OTP based e-KYC (non
                        face-to-face) in case my Video KYC process is unsuccessful due to any reason, subject to RBI
                        guidelines.
                    </p>
                    <p>
                        I hereby declare that I have completed the application myself and on my device.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => {
                                setConsent(e.target.checked);
                                updateFormData({ vkycConsent: e.target.checked });
                            }}
                            className="mt-0.5 h-4 w-4 rounded-[var(--radius)] border-gray-300 text-hdfc-blue focus:ring-hdfc-blue-light cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                            I have read and agree to the above consent for VCIP and related processing.
                        </span>
                    </label>
                    {showErrors && !consent && (
                        <p className="error-text">
                            <AlertCircle className="w-4 h-4" />
                            This consent is mandatory.
                        </p>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={presentInIndia}
                            onChange={(e) => {
                                setPresentInIndia(e.target.checked);
                                updateFormData({ vkycPresentInIndia: e.target.checked });
                            }}
                            className="mt-0.5 h-4 w-4 rounded-[var(--radius)] border-gray-300 text-hdfc-blue focus:ring-hdfc-blue-light cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                            I confirm that I am present in India while doing this Video KYC.
                        </span>
                    </label>
                    {showErrors && !presentInIndia && (
                        <p className="error-text">
                            <AlertCircle className="w-4 h-4" />
                            Confirmation is mandatory.
                        </p>
                    )}
                </div>
            </div>
        </StepCard>
    );
}
