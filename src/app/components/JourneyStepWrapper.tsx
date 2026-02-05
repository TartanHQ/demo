"use client";

import { motion } from "framer-motion";
import { useJourney } from "@/app/context/JourneyContext";
import StepError from "./steps/StepError";

interface Props {
  children: React.ReactNode;
}

export default function JourneyStepWrapper({ children }: Props) {
  const { error } = useJourney();

  return (
    <motion.div
      className="w-full h-full min-h-0 flex flex-col"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.22,
        ease: "easeOut"
      }}
    >
      {error ? (
        <StepError
          title={error.title}
          message={error.message}
        />
      ) : (
        children
      )}
    </motion.div>
  );
}