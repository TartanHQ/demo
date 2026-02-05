"use client";

import React, { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, FileText, Lightbulb, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/lib/analytics"; // <-- IMPORT THE TRACKER

export default function StepKycInstructions() {
  const { goToStep } = useJourney();
  const [kycFailed, setKycFailed] = React.useState(false); 

  // --- Track this screen view ---
  useEffect(() => {
    trackEvent('page_viewed', { page: 'kycInstructions', kyc_attempt: kycFailed ? 2 : 1 });
  }, [kycFailed]);

  const handleStart = () => {
    trackEvent('vkyc_flow_started');
    goToStep("kycFace");
  };

  return (
    <Card className="w-full border-none md:border md:shadow-xl md:rounded-lg mx-auto bg-card">
      <CardHeader>
        <CardTitle className="text-text-darkest">Video KYC Instructions</CardTitle>
        <CardDescription>
          Please get ready for your Video KYC. It will only take 3 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {kycFailed && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-semibold">KYC Verification Failed</p>
              <p className="text-sm">We couldn't verify your details. Please try again.</p>
            </div>
          </div>
        )}
        
        <p className="font-semibold text-text-darkest">Please ensure you have:</p>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-primary-cta" />
            <span className="text-text-gray-2">Your original PAN Card</span>
          </li>
          <li className="flex items-center space-x-3">
            <Lightbulb className="w-6 h-6 text-primary-cta" />
            <span className="text-text-gray-2">A well-lit room</span>
          </li>
          <li className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-primary-cta" />
            <span className="text-text-gray-2">A stable internet connection & access to your camera</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          variant="primary-cta" 
          className="w-full" 
          onClick={handleStart}
        >
          {kycFailed ? "Try Again" : "I'm Ready, Start Video KYC"}
        </Button>
      </CardFooter>
    </Card>
  );
}
