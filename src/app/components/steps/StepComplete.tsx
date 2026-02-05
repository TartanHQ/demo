"use client";

import React, { useEffect, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import {
  CheckCircle2,
  Download,
  CreditCard,
  Gift,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Home
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import StepCard from "@/app/components/layout/StepCard";

export default function StepComplete() {
  const { formData, setBottomBarContent } = useJourney();
  const { config } = useBranding();
  const [isApiLoading, setIsApiLoading] = useState(true);

  useEffect(() => {
    trackEvent('journey_completed');
    setBottomBarContent(null);
    // Simulate final API call to fetch account details
    const timer = setTimeout(() => {
      setIsApiLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [setBottomBarContent]);

  const offers = [
    { icon: CreditCard, title: "Millennia Credit Card", desc: "Pre-approved with ₹2.5L limit", color: "bg-blue-50 text-blue-600" },
    { icon: TrendingUp, title: "Personal Loan", desc: "Instant disbursal up to ₹15L", color: "bg-purple-50 text-purple-600" },
    { icon: Home, title: "Home Loan Refinancing", desc: "Rates starting at 8.45% p.a.", color: "bg-orange-50 text-orange-600" },
    { icon: ShieldCheck, title: "Secure Life Insurance", desc: "Cover up to ₹1 Crore", color: "bg-green-50 text-green-600" },
    { icon: Gift, title: "Demat Account", desc: "Zero AMC for first year", color: "bg-pink-50 text-pink-600" },
  ];

  if (isApiLoading) {
    return (
      <StepCard maxWidth="2xl">
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-transparent animate-spin" style={{ borderTopColor: config.primary }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-slate-200" />
            </div>
          </div>
          <h2 className="mt-8 text-xl font-bold text-slate-800">Finalizing Your Account</h2>
          <p className="mt-2 text-slate-500 font-medium">Communicating with {config.name} Core Systems...</p>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard maxWidth="2xl">
      <div className="space-y-2 text-center mb-8">
        <div className="w-24 h-24 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 shadow-sm animate-bounce-subtle">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Active!</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">Welcome aboard, {formData.name || 'valued customer'}. Your banking journey starts now.</p>
      </div>

      <div className="space-y-6">
        {/* Account Details */}
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer ID (CIF)</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">192837465</p>
            </div>
            <div className="sm:col-span-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</p>
              <p className="mt-1 text-base font-bold text-slate-900 tabular-nums">XXXX XXXX 1234</p>
            </div>
            <div className="sm:col-span-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Name</p>
              <p className="mt-1 text-base font-bold text-slate-900 capitalize">Mumbai Main</p>
            </div>
          </div>
        </div>

        {/* Pre-approved Offers Section */}
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase">Exclusive for You</h3>
            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-black uppercase">Pre-Approved</span>
          </div>

          <div className="mt-4 space-y-3">
            {offers.map((offer, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-slate-100 bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className={cn("w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-[1.03]", offer.color)}>
                  <offer.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{offer.title}</p>
                  <p className="text-xs text-slate-500 font-medium">{offer.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-4">
            <Button className="btn-primary flex-1" style={{ backgroundColor: config.primary }}>
              Setup Mobile Banking
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-[var(--radius)] active:scale-[0.98]"
            >
              View Passbook
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-xs font-bold tracking-wider uppercase">
        © 2026 {config.name}. All Rights Reserved.
      </p>
    </StepCard>
  );
}
