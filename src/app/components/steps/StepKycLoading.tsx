"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics"; // <-- IMPORT THE TRACKER
import { cn } from "@/lib/utils";

const checklistItems = [
  "Face scan matched...",
  "PAN card legible...",
  "Cross-referencing details...",
  "Connecting to KYC agent..."
];

export default function StepKycLoading() {
  const { goToStep } = useJourney();
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    // --- Track this screen view ---
    trackEvent('page_viewed', { page: 'kycLoading' });

    // Animate the checklist
    const itemTimer = setInterval(() => {
      setCurrentItem((prev) => {
        if (prev < checklistItems.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 750); // 0.75s per item

    // This simulates the 3-second API call
    const apiTimer = setTimeout(() => {
      clearInterval(itemTimer);
      const isSuccess = Math.random() > 0.3; 
      
      if (isSuccess) {
        trackEvent('vkyc_verification_success');
        goToStep("complete");
      } else {
        trackEvent('vkyc_verification_failed');
        goToStep("kycInstructions"); 
      }
    }, 3000); 

    return () => {
      clearInterval(itemTimer);
      clearTimeout(apiTimer);
    };
  }, [goToStep]);

  return (
    <Card className="w-full border-none md:border md:shadow-xl md:rounded-lg mx-auto bg-card">
      <CardHeader className="text-center items-center">
        <CardTitle className="text-text-darkest">Verifying Your Details</CardTitle>
        <CardDescription>
          This will just take a moment. Please do not close this window.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-48 flex flex-col justify-center px-10">
        <ul className="space-y-4">
          {checklistItems.map((item, index) => {
            const isDone = index < currentItem;
            const isCurrent = index === currentItem;

            return (
              <motion.li 
                key={item}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-3"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary-cta animate-spin" />
                ) : (
                  <div className="w-5 h-5" /> // Placeholder
                )}
                <span className={cn(
                  "text-lg",
                  isDone ? "text-success" : isCurrent ? "text-primary-cta" : "text-muted-foreground"
                )}>
                  {item}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
