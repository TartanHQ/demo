/* src/app/components/steps/StepAadhaarKyc.tsx */

"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StepAadhaarKyc() {
  const { nextStep } = useJourney();
  const [otpSent, setOtpSent] = React.useState(false);

  return (
    <Card className="w-full md:shadow-lg md:border md:rounded-lg mx-auto border-none md:border-solid">
      <CardHeader>
        <CardTitle className="text-text-darkest">In-Flow EKYC</CardTitle>
        <CardDescription>
          {otpSent ? "Enter the OTP sent to your Aadhaar-linked mobile." : "Please enter your 12-digit Aadhaar number."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!otpSent ? (
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input 
              id="aadhaar" 
              placeholder="XXXX XXXX XXXX" 
              type="tel" 
              inputMode="numeric"
              maxLength={14} // 12 digits + 2 spaces
              // PM Detail: Auto-format Aadhaar as user types
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) value = value.slice(0, 4) + ' ' + value.slice(4);
                if (value.length > 9) value = value.slice(0, 9) + ' ' + value.slice(9);
                e.target.value = value.slice(0, 14);
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="aadhaar-otp">Enter OTP</Label>
            <Input 
              id="aadhaar-otp" 
              placeholder="XXXXXX" 
              maxLength={6}
              type="tel"
              inputMode="numeric"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="primary-cta" 
          className="w-full" 
          onClick={() => {
            if (otpSent) {
              nextStep(); // Move to next step after OTP
            } else {
              setOtpSent(true); // Simulate sending OTP
            }
          }}
        >
          {otpSent ? "Verify Aadhaar OTP" : "Send OTP"}
        </Button>
      </CardFooter>
    </Card>
  );
}