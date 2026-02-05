"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Gift, ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";

export default function StepLoanOffer() {
  const { nextStep, journeyType } = useJourney();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show for Journey 2 (SAJ) ETB customers
    if (journeyType === "journey2") {
      trackEvent('page_viewed', { page: 'loanOffer' });
      trackEvent('pre_approved_loan_shown');
    }
  }, [journeyType]);

  // Don't render if not Journey 2
  if (journeyType !== "journey2") {
    return null;
  }

  const handleAccept = () => {
    trackEvent('pre_approved_loan_clicked', { action: 'accept' });
    // Redirect to loan application (would use API to share intent with HDFC)
    window.open('https://hdfc-loan-application.com', '_blank');
    nextStep();
  };

  const handleDecline = () => {
    trackEvent('pre_approved_loan_clicked', { action: 'decline' });
    setIsVisible(false);
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <StepCard maxWidth="2xl">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Pre-approved Loan Offer</h1>
            <p className="page-subtitle">Exclusive offer available for you.</p>
          </div>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={handleDecline}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Gift className="h-5 w-5 text-[#004C8F]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">Offer Summary</p>
            <p className="text-xs text-gray-600">No documentation required.</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-slate-50/40 p-4">
          <p className="text-xs text-gray-600">Pre-approved Amount</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₹5,00,000</p>
          <p className="text-xs text-gray-600 mt-1">Interest Rate: 10.5% p.a.</p>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          {["Quick approval process", "No documentation required", "Flexible repayment options"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#004C8F]" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button className="btn-primary w-full" onClick={handleAccept}>
            View Offer Details <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-[var(--radius)]" onClick={handleDecline}>
            Not Now
          </Button>
          <p className="helper-text text-center">
            This offer is valid for 30 days. You can apply later from your account dashboard.
          </p>
        </div>
      </div>
    </StepCard>
  );
}
