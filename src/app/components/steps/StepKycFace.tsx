"use client";

import { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, User } from "lucide-react";
import { trackEvent } from "@/lib/analytics"; // <-- IMPORT THE TRACKER

export default function StepKycFace() {
  const { goToStep } = useJourney();

  // --- Track this screen view ---
  useEffect(() => {
    trackEvent('page_viewed', { page: 'kycFace' });
  }, []);

  const handleCapture = () => {
    trackEvent('vkyc_step_captured', { step: 'face_capture' });
    goToStep("kycPan");
  };

  return (
    <Card className="w-full border-none md:border md:shadow-xl md:rounded-lg mx-auto bg-card">
      <CardHeader>
        <CardTitle className="text-text-darkest">1. Capture Your Face</CardTitle>
        <CardDescription>
          Please position your face inside the oval and click "Capture".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full aspect-square md:aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden relative">
          <User className="w-1/2 h-1/2 text-gray-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-3/4 md:w-1/2 md:h-3/4 rounded-[50%] border-4 border-dashed border-white/50" />
          </div>
          <p className="absolute bottom-4 text-white text-sm">Simulated Camera View</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary-cta" className="w-full" onClick={handleCapture}>
          <Camera className="w-4 h-4 mr-2" />
          Capture Face
        </Button>
      </CardFooter>
    </Card>
  );
}
