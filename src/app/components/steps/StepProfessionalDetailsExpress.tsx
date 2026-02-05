"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import AgentMessage from "@/app/components/chat/AgentMessage";
import UserResponse from "@/app/components/chat/UserResponse";
import HelpIcon from "@/app/components/shared/HelpIcon";

export default function StepProfessionalDetailsExpress() {
    const { nextStep, formData, updateFormData, currentStepIndex, journeySteps } = useJourney();

    // Prefilled data with editable nominee fields
    const [annualIncome, setAnnualIncome] = useState(formData.annualIncome || "2000000");
    const [nomineeName, setNomineeName] = useState(formData.nomineeName || "Sunita Sharma");
    const [nomineeRelation, setNomineeRelation] = useState(formData.nomineeRelation || "Mother");
    const [nomineeDob, setNomineeDob] = useState(formData.nomineeDob || "1965-03-15");
    const [enableTransfer, setEnableTransfer] = useState(formData.enableTransfer !== false);
    const [emailStatement, setEmailStatement] = useState(formData.emailStatement !== false);
    const [isPep, setIsPep] = useState(formData.isPep || false);

    const [isConfirmed, setIsConfirmed] = useState(false);

    const myIndex = journeySteps.findIndex(s => s.id === "professionalDetailsExpress");
    const isHistory = myIndex !== -1 && myIndex < currentStepIndex;
    const isActive = myIndex === currentStepIndex;

    useEffect(() => {
        if (isActive) trackEvent('page_viewed', { page: 'professional_details_express' });
    }, [isActive]);

    const handleConfirm = () => {
        setIsConfirmed(true);
        updateFormData({
            annualIncome,
            nomineeName,
            nomineeRelation,
            nomineeDob,
            enableTransfer,
            emailStatement,
            isPep
        });

        setTimeout(() => {
            nextStep();
        }, 500);
    };

    if (isHistory) {
        return (
            <div className="space-y-3">
                <AgentMessage isNew={false}>
                    Thanks! I've updated your income details and nominee information.
                </AgentMessage>
                <UserResponse isNew={false}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Details Confirmed</span>
                    </div>
                </UserResponse>
            </div>
        );
    }

    if (!isActive) return null;

    return (
        <div className="space-y-3 w-full animate-in slide-in-from-bottom-4 duration-300">
            <AgentMessage>
                Hi {formData.name || "Chirag"}! Please verify your income and nominee details. You can edit the nominee information if needed.
            </AgentMessage>

            <div className="pl-8 space-y-3">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Income & Nominee Details</span>
                        <HelpIcon tooltip="Edit nominee details if needed" />
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-600">Annual Income (₹)</label>
                            <Input
                                type="text"
                                value={annualIncome}
                                onChange={(e) => setAnnualIncome(e.target.value.replace(/\D/g, ''))}
                                className="h-9 text-sm border-slate-200 focus:border-blue-500"
                                placeholder="2000000"
                            />
                            <p className="text-xs text-slate-500">
                                ₹{(parseInt(annualIncome || "0") / 100000).toFixed(1)} Lakhs per year
                            </p>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                            <p className="text-xs font-semibold text-slate-700 mb-3">Nominee Details</p>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600">Nominee Name</label>
                                    <Input
                                        type="text"
                                        value={nomineeName}
                                        onChange={(e) => setNomineeName(e.target.value)}
                                        className="h-9 text-sm border-slate-200 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600">Relationship</label>
                                    <Select value={nomineeRelation} onValueChange={setNomineeRelation}>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Spouse">Spouse</SelectItem>
                                            <SelectItem value="Son">Son</SelectItem>
                                            <SelectItem value="Daughter">Daughter</SelectItem>
                                            <SelectItem value="Brother">Brother</SelectItem>
                                            <SelectItem value="Sister">Sister</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-600">Nominee Date of Birth</label>
                                    <Input
                                        type="date"
                                        value={nomineeDob}
                                        onChange={(e) => setNomineeDob(e.target.value)}
                                        className="h-9 text-sm border-slate-200 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3 space-y-2">
                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableTransfer}
                                    onChange={(e) => setEnableTransfer(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Enable online fund transfers</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emailStatement}
                                    onChange={(e) => setEmailStatement(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>Receive email statements</span>
                            </label>

                            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPep}
                                    onChange={(e) => setIsPep(e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>I am a Politically Exposed Person (PEP)</span>
                                <HelpIcon tooltip="As per RBI guidelines, please declare if you hold a prominent public position" />
                            </label>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleConfirm}
                    disabled={isConfirmed || !nomineeName || !annualIncome}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                    {isConfirmed ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmed
                        </>
                    ) : (
                        "Confirm & Continue"
                    )}
                </Button>
            </div>
        </div>
    );
}
