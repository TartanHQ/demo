/* src/app/components/DemoToggle.tsx */

"use client";

import { useJourney } from "@/app/context/JourneyContext";
import { JourneyType } from "@/app/context/stepDefinitions";
import { Toggle } from "@/components/ui/toggle";
import { CreditCard, ArrowRight, Zap } from "lucide-react";

const JOURNEY_TYPES: JourneyType[] = ["ntb", "ntb-conversion", "etb-nk", "etb"];

const JOURNEY_DETAILS: Record<JourneyType, { label: string; icon: React.ElementType }> = {
  "ntb": { label: "Journey 1 (NTB)", icon: CreditCard },
  "ntb-conversion": { label: "Journey 1B (NTB Conversion)", icon: ArrowRight },
  "etb-nk": { label: "Journey 2 (ETB-NK)", icon: CreditCard },
  "etb": { label: "Journey 3 (ETB)", icon: Zap },
};

export default function DemoToggle() {
  const { journeyType, setJourneyType, updateFormData } = useJourney();

  const cycleJourneyType = () => {
    let nextJourney: JourneyType;
    if (!journeyType) {
      nextJourney = "ntb";
    } else {
      const currentIndex = JOURNEY_TYPES.indexOf(journeyType);
      const nextIndex = (currentIndex + 1) % JOURNEY_TYPES.length;
      nextJourney = JOURNEY_TYPES[nextIndex];
    }

    setJourneyType(nextJourney);

    // Update PAN based on journey
    const nextPan = nextJourney === "etb" ? "EXSIT1234P" : "ABCDE1234E";
    updateFormData({ pan: nextPan });
  };

  const CurrentIcon = journeyType ? JOURNEY_DETAILS[journeyType].icon : CreditCard;
  const currentLabel = journeyType ? JOURNEY_DETAILS[journeyType].label : "Select Journey";

  return (
    <Toggle
      aria-label="Toggle journey type"
      onClick={cycleJourneyType}
      className="fixed bottom-4 left-4 z-50 bg-card shadow-lg border data-[state=on]:bg-primary-cta data-[state=on]:text-primary-cta-foreground"
      pressed={true}
    >
      <CurrentIcon className="h-4 w-4 mr-2" />
      <span className="text-xs font-semibold">
        {currentLabel}
      </span>
    </Toggle>
  );
}