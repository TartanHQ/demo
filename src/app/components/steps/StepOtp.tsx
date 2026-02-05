/* src/app/components/steps/StepOtp.tsx */

"use client";

import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export default function StepOtp() {
  const { nextStep } = useJourney();

  // PM Detail: Add state for OTP timer
  const [timer, setTimer] = React.useState(30);

  React.useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <Card className="w-full md:shadow-lg md:border md:rounded-lg mx-auto border-none md:border-solid">
      <CardHeader>
        <CardTitle className="text-text-darkest">Verify Mobile</CardTitle>
        <CardDescription>
          We've sent a 6-digit OTP to +91 98XXXXXX00.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <Input 
            id="otp" 
            placeholder="XXXXXX" 
            maxLength={6} 
            type="tel" 
            inputMode="numeric" 
            pattern="[0-9]*"
          />
        </div>
        <div className="text-center">
          <Button 
            variant="link" 
            size="sm" 
            className="text-text-gray-1" 
            disabled={timer > 0}
            onClick={() => setTimer(30)} // Reset timer
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary-cta" className="w-full" onClick={nextStep}>
          Confirm OTP
        </Button>
      </CardFooter>
    </Card>
  );
}