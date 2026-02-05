"use client";

import { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CreditCard, User } from "lucide-react";
import { trackEvent } from "@/lib/analytics"; // <-- IMPORT THE TRACKER

export default function StepKycPanFace() {
  const { goToStep } = useJourney();

  // --- Track this screen view ---
  useEffect(() => {
    trackEvent('page_viewed', { page: 'kycPanFace' });
  }, []);

  const handleCapture = () => {
    trackEvent('vkyc_step_captured', { step: 'pan_face_capture' });
    goToStep("kycLoading");
  };

  return (
    <Card className="w-full border-none md:border md:shadow-xl md:rounded-lg mx-auto bg-card">
      <CardHeader>
        <CardTitle className="text-text-darkest">3. Final Proof</CardTitle>
        <CardDescription>
          Hold your PAN card next to your face and capture.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full aspect-square md:aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden relative p-4">
          <div className="flex flex-col md:flex-row w-full h-full items-center justify-center gap-4">
             <div className="w-1/2 h-1/2 rounded-[50%] border-4 border-dashed border-white/50 flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-gray-700" />
            </div>
            <div className="w-1/2 h-1/2 rounded-lg border-4 border-dashed border-white/50 flex items-center justify-center">
              <CreditCard className="w-1/2 h-1/2 text-gray-700" />
            </div>
          </div>
          <p className="absolute bottom-4 text-white text-sm">Simulated Camera View</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary-cta" className="w-full" onClick={handleCapture}>
          <Camera className="w-4 h-4 mr-2" />
          Capture Final Proof
        </Button>
      </CardFooter>
    </Card>
  );
}
