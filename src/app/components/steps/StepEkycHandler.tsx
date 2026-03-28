"use client";

import React, { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import StepCard from "@/app/components/layout/StepCard";
import { trackEvent } from "@/lib/analytics";
import AadhaarEkycForm from "@/app/components/steps/AadhaarEkycForm";

export default function StepEkycHandler() {
  const { nextStep } = useJourney();

  useEffect(() => {
    trackEvent("page_viewed", { page: "ekyc_handler" });
  }, []);

  return (
    <StepCard maxWidth="2xl">
      <AadhaarEkycForm onComplete={nextStep} />
    </StepCard>
  );
}
