"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsentCheckboxProps {
  id: string;
  label: React.ReactNode | string;
  termsUrl?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  title?: string;
  description?: string;
  content?: string[];
}

export default function ConsentCheckbox({
  id,
  label,
  termsUrl,
  checked,
  onCheckedChange,
  required = false,
  title = "Terms and Conditions",
  description = "Please review carefully to understand your rights and the security of your data.",
  content = [
    "Accuracy: You confirm all data provided matches official Aadhaar records.",
    "Authorization: You permit secure data verification with trusted partners.",
    "Service Quality: We maintain high standards for your banking experience.",
    "Communication: Receive real-time alerts for your security.",
    "Eligibility: Verified based on employment and profile details.",
    "Compliance: Adherence to the latest digital banking regulations."
  ]
}: ConsentCheckboxProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleCheckboxClick = (newChecked: boolean | string) => {
    const isChecked = newChecked === true;
    if (isChecked) {
      setIsDialogOpen(true);
      setHasScrolledToBottom(false);
    } else {
      onCheckedChange(isChecked);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleConfirm = () => {
    onCheckedChange(true);
    setIsDialogOpen(false);
    setHasScrolledToBottom(false);
  };

  return (
    <>
      <div className="flex items-center space-x-3 group">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={handleCheckboxClick}
          required={required}
          className="h-5 w-5 rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300 group-hover:border-primary/50"
        />
        <Label
          htmlFor={id}
          className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5 transition-colors duration-300 group-hover:text-primary"
        >
          {label}
          {termsUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
              className="text-primary hover:text-blue-700 transition-colors ml-1 p-1 hover:bg-primary/5 rounded"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </Label>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-8 border-none shadow-2xl rounded-3xl overflow-hidden glass">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-400" />
          <DialogHeader className="space-y-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-gradient">
                {title}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div
            className="flex-1 overflow-y-auto border border-border/50 rounded-2xl p-6 bg-background/50 backdrop-blur-sm scroll-smooth"
            onScroll={handleScroll}
          >
            <div className="prose prose-blue prose-sm max-w-none space-y-4">
              <p className="font-semibold text-primary">Key Highlights of Your Agreement:</p>
              <div className="grid gap-4">
                {content.map((text, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-white/50 border border-white shadow-sm transition-all hover:scale-[1.01]">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">{text}</p>
                  </div>
                ))}
              </div>
              <div className="h-20" />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                hasScrolledToBottom ? "bg-success scale-125" : "bg-muted-foreground/30 animate-pulse"
              )} />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {hasScrolledToBottom
                  ? "Read Confirmed"
                  : "Scroll to verify"}
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                className="rounded-xl flex-1 sm:flex-none font-bold text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsDialogOpen(false);
                  setHasScrolledToBottom(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary-cta"
                className="rounded-xl flex-1 sm:flex-none font-bold px-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                onClick={handleConfirm}
              >
                Confirm & Agree
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
