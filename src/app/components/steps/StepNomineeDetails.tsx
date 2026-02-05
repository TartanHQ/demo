"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";

import StepCard from "@/app/components/layout/StepCard";

export default function StepNomineeDetails() {
    const { nextStep, updateFormData, formData, journeySteps, currentStepIndex, setBottomBarContent } = useJourney();
    const [nomineeName, setNomineeName] = useState(formData.nomineeName || "");
    const [nomineeRelation, setNomineeRelation] = useState(formData.nomineeRelation || "");
    const [nomineeDob, setNomineeDob] = useState(formData.nomineeDob || "");
    const [nomineeAddress, setNomineeAddress] = useState(formData.nomineeAddress || "");
    const [isLoading, setIsLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    const stepLabel = useMemo(() => {
        const total = journeySteps.length || 0;
        if (!total) return undefined;
        return `Step ${currentStepIndex + 1} of ${total}`;
    }, [journeySteps.length, currentStepIndex]);

    const surname = useMemo(() => {
        const fullName = String(formData?.name || "").trim();
        const parts = fullName.split(/\s+/).filter(Boolean);
        return parts.length >= 2 ? parts[parts.length - 1] : "";
    }, [formData?.name]);

    const prefilledNameForRelation = (rel: string) => {
        const last = surname ? ` ${surname}` : "";
        switch (rel) {
            case "spouse":
                return `Aarushi${last}`.trim();
            case "father":
                return `Rakesh${last}`.trim();
            case "mother":
                return `Neeta${last}`.trim();
            case "son":
                return `Ayaan${last}`.trim();
            case "daughter":
                return `Anaya${last}`.trim();
            default:
                return "";
        }
    };

    const isValid = !!nomineeName && !!nomineeRelation;

    const handleContinue = useCallback(() => {
        setShowErrors(true);
        if (!isValid) return;
        setIsLoading(true);
        updateFormData({ nomineeName, nomineeRelation, nomineeDob, nomineeAddress });
        setTimeout(() => {
            setIsLoading(false);
            nextStep();
        }, 800);
    }, [isValid, nextStep, nomineeAddress, nomineeDob, nomineeName, nomineeRelation, updateFormData]);

    useEffect(() => {
        setBottomBarContent(
            <div className="w-full flex justify-end">
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={isLoading || !isValid}
                    className="btn-primary w-full md:w-[360px]"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Nominee"}
                </Button>
            </div>
        );
    }, [handleContinue, isLoading, setBottomBarContent]);

    return (
        <StepCard step={stepLabel} maxWidth="2xl">
            <div className="page-header">
                <h1 className="page-title">Nominee Details</h1>
                <p className="page-subtitle">Add nominee details for smoother account servicing later.</p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleContinue();
                }}
                className="space-y-5"
            >
                <div>
                    <label className="form-label">Nominee’s Full Name</label>
                    <Input
                        type="text"
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        className={`enterprise-input ${showErrors && !nomineeName ? "error" : ""}`}
                        placeholder="Enter full name"
                    />
                    {showErrors && !nomineeName && (
                        <p className="error-text">
                            <AlertCircle className="w-4 h-4" />
                            Please enter nominee name.
                        </p>
                    )}
                </div>

                <div>
                    <label className="form-label">Relationship</label>
                    <Select
                        value={nomineeRelation}
                        onValueChange={(val) => {
                            setNomineeRelation(val);
                            const suggested = prefilledNameForRelation(val);
                            if (suggested) setNomineeName(suggested);
                        }}
                    >
                        <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !nomineeRelation ? "error" : ""}`}>
                            <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="spouse" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Spouse
                            </SelectItem>
                            <SelectItem value="father" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Father
                            </SelectItem>
                            <SelectItem value="mother" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Mother
                            </SelectItem>
                            <SelectItem value="son" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Son
                            </SelectItem>
                            <SelectItem value="daughter" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Daughter
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {showErrors && !nomineeRelation && (
                        <p className="error-text">
                            <AlertCircle className="w-4 h-4" />
                            Please select a relationship.
                        </p>
                    )}
                    <p className="helper-text">Choosing a relationship can auto-suggest a nominee name.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="form-label">Nominee Date of Birth</label>
                        <Input
                            type="date"
                            value={nomineeDob}
                            onChange={(e) => setNomineeDob(e.target.value)}
                            className="enterprise-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">Nominee Address</label>
                        <Input
                            type="text"
                            value={nomineeAddress}
                            onChange={(e) => setNomineeAddress(e.target.value)}
                            className="enterprise-input"
                            placeholder="House/Flat, Street, City, PIN"
                        />
                    </div>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-blue-100 bg-blue-50/50 p-4">
                    <p className="helper-text !mt-0 text-blue-900">
                        <span className="font-semibold">Pro tip:</span> Adding a nominee helps ensure smooth transfer of funds in unforeseen events.
                    </p>
                </div>
            </form>
        </StepCard>
    );
}
