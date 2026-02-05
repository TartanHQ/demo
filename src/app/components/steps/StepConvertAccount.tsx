"use client";

import { useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics"; // <-- IMPORT THE TRACKER

export default function StepConvertAccount() {
  const { nextStep } = useJourney();

  // --- Track this screen view ---
  useEffect(() => {
    trackEvent('page_viewed', { page: 'convertAccount' });
  }, []);

  const handleConvert = () => {
    trackEvent('etb_choice_made', { choice: 'convert' });
    nextStep();
  };

  const handleCreateNew = () => {
    trackEvent('etb_choice_made', { choice: 'create_new' });
    nextStep();
  };

  return (
    <Card className="w-full max-w-2xl border-none md:border md:shadow-professional md:rounded-xl mx-auto bg-card min-h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-text-darkest text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription className="text-base">
          We see you already have a savings account with us:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="text-center p-4 bg-muted rounded-md">
          <p className="text-text-gray-2">Existing Savings Account</p>
          <p className="text-2xl font-semibold text-text-darkest">XXXX-XXXX-1234</p>
        </div>
        <p className="text-sm text-text-gray-2 text-center">
          Would you like to convert this to your new Salaried Account?
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button variant="primary-cta" className="w-full" onClick={handleConvert}>
          Yes, Convert to Salaried Account
        </Button>
        <Button variant="outline" className="w-full" onClick={handleCreateNew}>
          No, Create a New Account
        </Button>
      </CardFooter>
    </Card>
  );
}
