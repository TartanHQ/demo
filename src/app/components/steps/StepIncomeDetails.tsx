"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useBranding } from "@/app/context/BrandingContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Briefcase, Wallet } from "lucide-react";

export default function StepIncomeDetails() {
    const { nextStep, updateFormData, formData } = useJourney();
    const { config } = useBranding();
    const [income, setIncome] = useState(formData.income || "");
    const [occupation, setOccupation] = useState(formData.occupation || "");
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = () => {
        setIsLoading(true);
        updateFormData({ income, occupation });
        setTimeout(() => {
            setIsLoading(false);
            nextStep();
        }, 800);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Income & Profile</h1>
                <p className="text-slate-500 font-medium">Tell us more about your professional background</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-6 lg:p-8 space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" />
                            Occupation Type
                        </label>
                        <Select value={occupation} onValueChange={setOccupation}>
                            <SelectTrigger className="h-12 border-slate-200/60 rounded-xl bg-white/50 focus:ring-4 focus:ring-blue-100 transition-all font-medium">
                                <SelectValue placeholder="Select your occupation" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                                <SelectItem value="salaried" className="py-3">Salaried Employee</SelectItem>
                                <SelectItem value="self-employed" className="py-3">Self Employed</SelectItem>
                                <SelectItem value="professional" className="py-3">Business Professional</SelectItem>
                                <SelectItem value="student" className="py-3">Student / Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Wallet className="w-3.5 h-3.5" />
                            Annual Income (INR)
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={income}
                                onChange={(e) => setIncome(e.target.value.replace(/\D/g, ''))}
                                className="h-12 pl-9 border-slate-200/60 rounded-xl bg-white/50 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-lg"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Enter your gross annual income as per last ITR/Form 16</p>
                    </div>
                </div>

                <Button
                    onClick={handleContinue}
                    disabled={isLoading || !income || !occupation}
                    className="w-full h-14 text-white font-bold transition-all shadow-xl active:scale-[0.98] rounded-2xl"
                    style={{ backgroundColor: config.primary }}
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Continue"}
                </Button>
            </div>
        </div>
    );
}
