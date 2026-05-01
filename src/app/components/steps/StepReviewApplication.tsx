"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { getJourneyProgress } from "@/app/context/stepDefinitions";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { useBranding } from "@/app/context/BrandingContext";
import { trackEvent } from "@/lib/analytics";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";

type ReviewItem = {
    id: string;
    label: string;
    value: string;
    getDraft?: () => Record<string, any>;
    renderEdit?: (draft: Record<string, any>, setDraft: (next: Record<string, any>) => void) => React.ReactNode;
    onSave?: (draft: Record<string, any>) => void;
    validate?: (draft: Record<string, any>) => string | null;
};

export default function StepReviewApplication() {
    const { nextStep, formData, journeySteps, currentStepIndex, setBottomBarContent, journeyType, changedFields, updateFormData } =
        useJourney();
    const { config } = useBranding();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [editState, setEditState] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, Record<string, any>>>({});
    const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
    const isNtb = journeyType === "ntb" || journeyType === "ntb-conversion";
    const hideBooleanChanges = journeyType === "etb";

    useEffect(() => {
        trackEvent('page_viewed', { page: 'review_application' });
    }, []);

    const handleSubmit = () => {
        if (!termsAccepted) return;

        setIsSubmitting(true);
        trackEvent(isNtb ? 'review_confirmed' : 'application_submitted');

        setTimeout(() => {
            setIsSubmitting(false);
            nextStep();
        }, 1500);
    };

    useEffect(() => {
        setBottomBarContent(
            <div className="w-full flex justify-end">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !termsAccepted}
                    className="btn-primary w-full md:w-[360px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isNtb ? "Preparing Video KYC..." : "Submitting Application..."}
                        </>
                    ) : (
                        <>
                            {isNtb ? "Proceed to Video KYC" : "Submit Application"}
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>
        );
    }, [isSubmitting, termsAccepted, setBottomBarContent, isNtb]);

    const stepLabel = useMemo(
        () => getJourneyProgress(journeySteps, currentStepIndex).label,
        [journeySteps, currentStepIndex]
    );

    const formatIncomeRange = (val: string | undefined) => {
        if (!val) return "—";
        const map: Record<string, string> = {
            "0-5L": "Up to ₹5L",
            "5-10L": "₹5L – ₹10L",
            "10-15L": "₹10L – ₹15L",
            "15-25L": "₹15L – ₹25L",
            "25L+": "₹25L+",
        };
        return map[val] || val;
    };

    const incomeRangeOptions = [
        { value: "0-5L", label: "Up to ₹5L" },
        { value: "5-10L", label: "₹5L – ₹10L" },
        { value: "10-15L", label: "₹10L – ₹15L" },
        { value: "15-25L", label: "₹15L – ₹25L" },
        { value: "25L+", label: "₹25L+" },
    ];

    const maritalOptions = [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "other", label: "Other" },
    ];

    const nomineeRelationOptions = [
        { value: "spouse", label: "Spouse" },
        { value: "father", label: "Father" },
        { value: "mother", label: "Mother" },
        { value: "son", label: "Son" },
        { value: "daughter", label: "Daughter" },
    ];

    const formatAddress = (address: {
        line1?: string;
        line2?: string;
        line3?: string;
        nearestLandmark?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }) => {
        return [
            address.line1,
            address.line2,
            address.line3,
            address.nearestLandmark,
            address.city,
            address.state,
            address.pincode,
        ]
            .filter(Boolean)
            .join(", ");
    };

    const formatNomineeAddressValue = (a: {
        line1?: string;
        line2?: string;
        line3?: string;
        nearestLandmark?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }) =>
        [a.line1, a.line2, a.line3, a.nearestLandmark, a.city, a.state, a.pincode].filter(Boolean).join(", ");

    const isBlank = (value: any) => !String(value ?? "").trim();
    const validateAddressFields = (draft: Record<string, any>) => {
        if (
            isBlank(draft.line1) ||
            isBlank(draft.line2) ||
            isBlank(draft.city) ||
            isBlank(draft.state) ||
            isBlank(draft.pincode)
        ) {
            return "Please complete all required address fields. Line 3 and nearest landmark are optional.";
        }
        return null;
    };

    const startEdit = (id: string, initial: Record<string, any>) => {
        setEditState((prev) => ({ ...prev, [id]: true }));
        setDrafts((prev) => ({ ...prev, [id]: initial }));
        setDraftErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const cancelEdit = (id: string) => {
        setEditState((prev) => ({ ...prev, [id]: false }));
        setDrafts((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
        setDraftErrors((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const saveEdit = (item: ReviewItem) => {
        if (!item.onSave) return;
        const draft = drafts[item.id] || {};
        const error = item.validate ? item.validate(draft) : null;
        if (error) {
            setDraftErrors((prev) => ({ ...prev, [item.id]: error }));
            return;
        }
        item.onSave(draft);
        setEditState((prev) => ({ ...prev, [item.id]: false }));
        setDrafts((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
        });
        setDraftErrors((prev) => {
            const next = { ...prev };
            delete next[item.id];
            return next;
        });
    };

    const reviewEmail = useMemo(() => {
        if (formData.usesPrimaryEmailForComms === false && formData.communicationEmail) {
            return formData.communicationEmail;
        }
        return formData.email || "—";
    }, [formData.communicationEmail, formData.email, formData.usesPrimaryEmailForComms]);

    const ntbItems = useMemo(() => {
        if (!isNtb) return [];
        const personalBaseline = formData.personalDetailsBaseline as Record<string, any> | undefined;
        const areValuesEqual = (a: any, b: any) => {
            if (typeof a === "object" || typeof b === "object") {
                try {
                    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
                } catch {
                    return false;
                }
            }
            return a === b;
        };
        const hasChanged = (key: string, currentValue: any) =>
            personalBaseline ? !areValuesEqual(currentValue, personalBaseline[key]) : changedFields.includes(key);
        const items: ReviewItem[] = [];

        const statementEmailChanged = personalBaseline
            ? !areValuesEqual(
                  {
                      usesPrimaryEmailForComms: formData.usesPrimaryEmailForComms,
                      communicationEmail: formData.communicationEmail || "",
                  },
                  {
                      usesPrimaryEmailForComms: personalBaseline.usesPrimaryEmailForComms,
                      communicationEmail: personalBaseline.communicationEmail || "",
                  }
              )
            : changedFields.includes("communicationEmail");

        if (statementEmailChanged) {
            items.push({
                id: "statementEmail",
                label: "Statement & Notification Email",
                value: reviewEmail || "—",
                getDraft: () => ({
                    usesPrimaryEmailForComms: formData.usesPrimaryEmailForComms,
                    communicationEmail: formData.communicationEmail || "",
                }),
                renderEdit: (draft, setDraft) => (
                    <div className="space-y-3">
                        <Select
                            value={draft.usesPrimaryEmailForComms === false ? "different" : "primary"}
                            onValueChange={(val) =>
                                setDraft({
                                    ...draft,
                                    usesPrimaryEmailForComms: val !== "different",
                                })
                            }
                        >
                            <SelectTrigger className="enterprise-input flex items-center justify-between">
                                <SelectValue placeholder="Select email preference" />
                            </SelectTrigger>
                            <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                                <SelectItem value="primary" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                    Use primary email
                                </SelectItem>
                                <SelectItem value="different" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                    Use a different email
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {draft.usesPrimaryEmailForComms === false && (
                            <Input
                                type="email"
                                value={draft.communicationEmail || ""}
                                onChange={(e) => setDraft({ ...draft, communicationEmail: e.target.value })}
                                className="enterprise-input"
                                placeholder="name@example.com"
                            />
                        )}
                    </div>
                ),
                onSave: (draft) =>
                    updateFormData({
                        usesPrimaryEmailForComms: draft.usesPrimaryEmailForComms !== false,
                        communicationEmail: draft.usesPrimaryEmailForComms === false ? draft.communicationEmail || "" : "",
                    }),
                validate: (draft) => {
                    if (draft.usesPrimaryEmailForComms === false && isBlank(draft.communicationEmail)) {
                        return "Please enter a communication email.";
                    }
                    return null;
                },
            });
        }
        if (hasChanged("fatherName", formData.fatherName)) {
            items.push({
                id: "fatherName",
                label: "Father's Name",
                value: formData.fatherName || "—",
                getDraft: () => ({ fatherName: formData.fatherName || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.fatherName || ""}
                        onChange={(e) => setDraft({ ...draft, fatherName: e.target.value })}
                        className="enterprise-input"
                        placeholder="Full name"
                    />
                ),
                onSave: (draft) => updateFormData({ fatherName: draft.fatherName || "" }),
                validate: (draft) => (isBlank(draft.fatherName) ? "Please enter father's name." : null),
            });
        }
        if (hasChanged("motherName", formData.motherName)) {
            items.push({
                id: "motherName",
                label: "Mother's Name",
                value: formData.motherName || "—",
                getDraft: () => ({ motherName: formData.motherName || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.motherName || ""}
                        onChange={(e) => setDraft({ ...draft, motherName: e.target.value })}
                        className="enterprise-input"
                        placeholder="Full name"
                    />
                ),
                onSave: (draft) => updateFormData({ motherName: draft.motherName || "" }),
                validate: (draft) => (isBlank(draft.motherName) ? "Please enter mother's name." : null),
            });
        }

        if (hasChanged("maritalStatus", formData.maritalStatus)) {
            items.push({
                id: "maritalStatus",
                label: "Marital Status",
                value: formData.maritalStatus
                    ? String(formData.maritalStatus).charAt(0).toUpperCase() + String(formData.maritalStatus).slice(1)
                    : "—",
                getDraft: () => ({ maritalStatus: formData.maritalStatus || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select
                        value={draft.maritalStatus || ""}
                        onValueChange={(val) => setDraft({ ...draft, maritalStatus: val })}
                    >
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            {maritalOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ maritalStatus: draft.maritalStatus || "" }),
                validate: (draft) => (isBlank(draft.maritalStatus) ? "Please select marital status." : null),
            });
        }

        if (hasChanged("incomeRange", formData.incomeRange)) {
            items.push({
                id: "incomeRange",
                label: "Annual Income Range",
                value: formatIncomeRange(formData.incomeRange),
                getDraft: () => ({ incomeRange: formData.incomeRange || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select
                        value={draft.incomeRange || ""}
                        onValueChange={(val) => setDraft({ ...draft, incomeRange: val })}
                    >
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            {incomeRangeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ incomeRange: draft.incomeRange || "" }),
                validate: (draft) => (isBlank(draft.incomeRange) ? "Please select an income range." : null),
            });
        }

        if (hasChanged("isPep", formData.isPep)) {
            items.push({
                id: "isPep",
                label: "Politically Exposed",
                value: formData.isPep ? "Yes" : "No",
                getDraft: () => ({ isPep: formData.isPep ? "yes" : "no" }),
                renderEdit: (draft, setDraft) => (
                    <Select value={draft.isPep || "no"} onValueChange={(val) => setDraft({ ...draft, isPep: val })}>
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="yes" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Yes
                            </SelectItem>
                            <SelectItem value="no" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                No
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ isPep: draft.isPep === "yes" }),
                validate: (draft) => (isBlank(draft.isPep) ? "Please select a value." : null),
            });
        }

        if (hasChanged("isIndianNational", formData.isIndianNational)) {
            items.push({
                id: "isIndianNational",
                label: "Indian National",
                value: formData.isIndianNational ? "Yes" : "No",
                getDraft: () => ({ isIndianNational: formData.isIndianNational ? "yes" : "no" }),
                renderEdit: (draft, setDraft) => (
                    <Select
                        value={draft.isIndianNational || "yes"}
                        onValueChange={(val) => setDraft({ ...draft, isIndianNational: val })}
                    >
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="yes" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Yes
                            </SelectItem>
                            <SelectItem value="no" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                No
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ isIndianNational: draft.isIndianNational === "yes" }),
                validate: (draft) => (isBlank(draft.isIndianNational) ? "Please select a value." : null),
            });
        }

        if (hasChanged("isTaxResidentIndiaOnly", formData.isTaxResidentIndiaOnly)) {
            items.push({
                id: "isTaxResidentIndiaOnly",
                label: "Tax Resident of India Only",
                value: formData.isTaxResidentIndiaOnly ? "Yes" : "No",
                getDraft: () => ({ isTaxResidentIndiaOnly: formData.isTaxResidentIndiaOnly ? "yes" : "no" }),
                renderEdit: (draft, setDraft) => (
                    <Select
                        value={draft.isTaxResidentIndiaOnly || "yes"}
                        onValueChange={(val) => setDraft({ ...draft, isTaxResidentIndiaOnly: val })}
                    >
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="yes" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Yes
                            </SelectItem>
                            <SelectItem value="no" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                No
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ isTaxResidentIndiaOnly: draft.isTaxResidentIndiaOnly === "yes" }),
                validate: (draft) => (isBlank(draft.isTaxResidentIndiaOnly) ? "Please select a value." : null),
            });
        }

        const permanentAddressChanged = personalBaseline
            ? !areValuesEqual(formData.currentAddress || "", personalBaseline.currentAddress || "")
            : changedFields.includes("currentAddress");
        if (permanentAddressChanged) {
            items.push({
                id: "permanentAddress",
                label: "Permanent Address",
                value: formData.currentAddress || "—",
                getDraft: () => ({ currentAddress: formData.currentAddress || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.currentAddress || ""}
                        onChange={(e) => setDraft({ ...draft, currentAddress: e.target.value })}
                        className="enterprise-input"
                        placeholder="Permanent address"
                    />
                ),
                onSave: (draft) => updateFormData({ currentAddress: draft.currentAddress || "" }),
                validate: (draft) => (isBlank(draft.currentAddress) ? "Please enter permanent address." : null),
            });
        }

        const communicationAddressValue = formatAddress({
            line1: formData.communicationAddressLine1 || "",
            line2: formData.communicationAddressLine2 || "",
            line3: formData.communicationAddressLine3 || "",
            nearestLandmark: formData.communicationAddressNearestLandmark || "",
            city: formData.communicationAddressCity || "",
            state: formData.communicationAddressState || "",
            pincode: formData.communicationAddressPincode || "",
        });
        const baselineCommunicationAddress = personalBaseline
            ? formatAddress({
                  line1: personalBaseline.communicationAddressLine1 || "",
                  line2: personalBaseline.communicationAddressLine2 || "",
                  line3: personalBaseline.communicationAddressLine3 || "",
                  nearestLandmark: personalBaseline.communicationAddressNearestLandmark || "",
                  city: personalBaseline.communicationAddressCity || "",
                  state: personalBaseline.communicationAddressState || "",
                  pincode: personalBaseline.communicationAddressPincode || "",
              })
            : "";
        const communicationAddressChanged = personalBaseline
            ? !areValuesEqual(communicationAddressValue, baselineCommunicationAddress) ||
              !areValuesEqual(formData.sameAsPermanentAddress, personalBaseline.sameAsPermanentAddress)
            : changedFields.some((key) =>
                  [
                      "communicationAddressLine1",
                      "communicationAddressLine2",
                      "communicationAddressLine3",
                      "communicationAddressNearestLandmark",
                      "communicationAddressCity",
                      "communicationAddressState",
                      "communicationAddressPincode",
                  ].includes(key)
              );

        if (formData.sameAsPermanentAddress === false && communicationAddressChanged) {
            const communicationAddressValue = formatAddress({
                line1: formData.communicationAddressLine1 || "",
                line2: formData.communicationAddressLine2 || "",
                line3: formData.communicationAddressLine3 || "",
                nearestLandmark: formData.communicationAddressNearestLandmark || "",
                city: formData.communicationAddressCity || "",
                state: formData.communicationAddressState || "",
                pincode: formData.communicationAddressPincode || "",
            });
            items.push({
                id: "communicationAddress",
                label: "Communication Address",
                value: communicationAddressValue || "—",
                getDraft: () => ({
                    line1: formData.communicationAddressLine1 || "",
                    line2: formData.communicationAddressLine2 || "",
                    line3: formData.communicationAddressLine3 || "",
                    nearestLandmark: formData.communicationAddressNearestLandmark || "",
                    city: formData.communicationAddressCity || "",
                    state: formData.communicationAddressState || "",
                    pincode: formData.communicationAddressPincode || "",
                }),
                renderEdit: (draft, setDraft) => (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Input
                                    value={draft.line1 || ""}
                                    onChange={(e) => setDraft({ ...draft, line1: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="Line 1"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    value={draft.line2 || ""}
                                    onChange={(e) => setDraft({ ...draft, line2: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="Line 2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    value={draft.line3 || ""}
                                    onChange={(e) => setDraft({ ...draft, line3: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="Line 3"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    value={draft.nearestLandmark || ""}
                                    onChange={(e) => setDraft({ ...draft, nearestLandmark: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="Nearest landmark"
                                />
                            </div>
                            <div>
                                <Input
                                    value={draft.city || ""}
                                    onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <Input
                                    value={draft.state || ""}
                                    onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <Input
                                    value={draft.pincode || ""}
                                    onChange={(e) => setDraft({ ...draft, pincode: e.target.value })}
                                    className="enterprise-input"
                                    placeholder="Pincode"
                                />
                            </div>
                        </div>
                    </div>
                ),
                onSave: (draft) => {
                    updateFormData({
                        sameAsPermanentAddress: false,
                        communicationAddressLine1: draft.line1 || "",
                        communicationAddressLine2: draft.line2 || "",
                        communicationAddressLine3: draft.line3 || "",
                        communicationAddressNearestLandmark: draft.nearestLandmark || "",
                        communicationAddressCity: draft.city || "",
                        communicationAddressState: draft.state || "",
                        communicationAddressPincode: draft.pincode || "",
                        communicationAddress: formatAddress({
                            line1: draft.line1 || "",
                            line2: draft.line2 || "",
                            line3: draft.line3 || "",
                            nearestLandmark: draft.nearestLandmark || "",
                            city: draft.city || "",
                            state: draft.state || "",
                            pincode: draft.pincode || "",
                        }),
                    });
                },
                validate: (draft) => validateAddressFields(draft),
            });
        }

        const nomineeEnabled = !!formData.wantsNominee;
        const permanentNomineeAddress = {
            line1: formData.currentAddress || "",
            line2: "",
            line3: "",
            nearestLandmark: formData.permanentAddressNearestLandmark || "",
            city: "",
            state: "",
            pincode: "",
        };
        const communicationNomineeAddress = {
            line1: formData.communicationAddressLine1 || "",
            line2: formData.communicationAddressLine2 || "",
            line3: formData.communicationAddressLine3 || "",
            nearestLandmark: formData.communicationAddressNearestLandmark || "",
            city: formData.communicationAddressCity || "",
            state: formData.communicationAddressState || "",
            pincode: formData.communicationAddressPincode || "",
        };
        const nomineesChanged = personalBaseline
            ? !areValuesEqual(formData.nominees || [], personalBaseline.nominees || []) ||
              !areValuesEqual(formData.wantsNominee, personalBaseline.wantsNominee)
            : changedFields.includes("nominees") || changedFields.includes("wantsNominee");

        if (nomineeEnabled && nomineesChanged) {
            const nominees = Array.isArray(formData.nominees) ? formData.nominees : [];
            nominees.forEach((nominee: any, index: number) => {
                const addressValue = formatNomineeAddressValue({
                    line1: nominee.addressLine1 || "",
                    line2: nominee.addressLine2 || "",
                    line3: nominee.addressLine3 || "",
                    nearestLandmark: nominee.addressNearestLandmark || "",
                    city: nominee.addressCity || "",
                    state: nominee.addressState || "",
                    pincode: nominee.addressPincode || "",
                });
                items.push({
                    id: `nominee-${index}`,
                    label: `Nominee ${index + 1}`,
                    value: [nominee.name, addressValue].filter(Boolean).join(" • ") || "—",
                    getDraft: () => {
                        const raw = nominee.addressSource || "custom";
                        const normalizedSource =
                            raw === "permanent" && formData.sameAsPermanentAddress !== false
                                ? "communication"
                                : raw === "none"
                                  ? "communication"
                                  : raw === "permanent"
                                    ? "custom"
                                    : raw;
                        return {
                            name: nominee.name || "",
                            relation: nominee.relation || "",
                            dob: nominee.dob || "",
                            addressSource: normalizedSource,
                            addressLine1: nominee.addressLine1 || "",
                            addressLine2: nominee.addressLine2 || "",
                            addressLine3: nominee.addressLine3 || "",
                            addressNearestLandmark: nominee.addressNearestLandmark || "",
                            addressCity: nominee.addressCity || "",
                            addressState: nominee.addressState || "",
                            addressPincode: nominee.addressPincode || "",
                        };
                    },
                    renderEdit: (draft, setDraft) => {
                        const livesAtSame =
                            draft.addressSource === "communication" ||
                            (draft.addressSource === "permanent" && formData.sameAsPermanentAddress !== false);
                        const presentAadhaarStyle = isNtb && formData.sameAsPermanentAddress;
                        const resolvedAddress = livesAtSame
                            ? communicationNomineeAddress
                            : {
                                  line1: draft.addressLine1 || "",
                                  line2: draft.addressLine2 || "",
                                  line3: draft.addressLine3 || "",
                                  nearestLandmark: draft.addressNearestLandmark || "",
                                  city: draft.addressCity || "",
                                  state: draft.addressState || "",
                                  pincode: draft.addressPincode || "",
                              };
                        const addressReadOnly = livesAtSame;
                        const readOnlyCls = "bg-gray-100 text-gray-500 cursor-not-allowed";
                        return (
                            <div className="space-y-3">
                                <Select
                                    value={draft.relation || ""}
                                    onValueChange={(val) => {
                                        const next: Record<string, any> = { ...draft, relation: val };
                                        if (val === "father") {
                                            next.name = formData.fatherName || "";
                                        } else if (val === "mother") {
                                            next.name = formData.motherName || "";
                                        }
                                        setDraft(next);
                                    }}
                                >
                                    <SelectTrigger className="enterprise-input flex items-center justify-between">
                                        <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                                        {nomineeRelationOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={draft.name || ""}
                                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                    className={`enterprise-input ${
                                        draft.relation === "father" || draft.relation === "mother"
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : ""
                                    }`}
                                    placeholder="Nominee name"
                                    readOnly={draft.relation === "father" || draft.relation === "mother"}
                                    disabled={draft.relation === "father" || draft.relation === "mother"}
                                />
                                <Input
                                    type="date"
                                    value={draft.dob || ""}
                                    onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                                    className="enterprise-input"
                                />
                                <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer select-none">
                                    <Checkbox
                                        checked={livesAtSame}
                                        onCheckedChange={(v) => {
                                            const on = v === true;
                                            if (on) {
                                                setDraft({
                                                    ...draft,
                                                    addressSource: "communication",
                                                    addressLine1: communicationNomineeAddress.line1,
                                                    addressLine2: communicationNomineeAddress.line2,
                                                    addressLine3: communicationNomineeAddress.line3,
                                                    addressNearestLandmark: communicationNomineeAddress.nearestLandmark,
                                                    addressCity: communicationNomineeAddress.city,
                                                    addressState: communicationNomineeAddress.state,
                                                    addressPincode: communicationNomineeAddress.pincode,
                                                });
                                            } else {
                                                setDraft({ ...draft, addressSource: "custom" });
                                            }
                                        }}
                                        className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                                    />
                                    <span>
                                        <span className="font-semibold">Nominee lives at same address</span>
                                        <span className="block text-xs text-gray-600 font-normal mt-0.5">
                                            Present address from your application. Edit it in the address section above.
                                        </span>
                                    </span>
                                </label>
                                {addressReadOnly && presentAadhaarStyle ? (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Address</label>
                                        <Input
                                            value={formData.currentAddress || communicationNomineeAddress.line1 || ""}
                                            readOnly
                                            className={`enterprise-input mt-1 ${readOnlyCls}`}
                                            placeholder="Aadhaar address"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="md:col-span-2">
                                            <Input
                                                value={resolvedAddress.line1 || ""}
                                                onChange={(e) => setDraft({ ...draft, addressLine1: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="House/Flat, Building"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                value={resolvedAddress.line2 || ""}
                                                onChange={(e) => setDraft({ ...draft, addressLine2: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="Street, Locality"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                value={resolvedAddress.line3 || ""}
                                                onChange={(e) => setDraft({ ...draft, addressLine3: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="Area, colony (optional)"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                value={resolvedAddress.nearestLandmark || ""}
                                                onChange={(e) =>
                                                    setDraft({ ...draft, addressNearestLandmark: e.target.value })
                                                }
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="Nearest landmark"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={resolvedAddress.pincode || ""}
                                                onChange={(e) => setDraft({ ...draft, addressPincode: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="6-digit PIN"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={resolvedAddress.city || ""}
                                                onChange={(e) => setDraft({ ...draft, addressCity: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="City"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                value={resolvedAddress.state || ""}
                                                onChange={(e) => setDraft({ ...draft, addressState: e.target.value })}
                                                className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                                placeholder="State"
                                                readOnly={addressReadOnly}
                                                disabled={addressReadOnly}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    },
                    onSave: (draft) => {
                        const selectedAddress =
                            draft.addressSource === "communication" ||
                            (draft.addressSource === "permanent" && formData.sameAsPermanentAddress !== false)
                                ? communicationNomineeAddress
                                : draft.addressSource === "permanent"
                                  ? permanentNomineeAddress
                                  : {
                                        line1: draft.addressLine1 || "",
                                        line2: draft.addressLine2 || "",
                                        line3: draft.addressLine3 || "",
                                        nearestLandmark: draft.addressNearestLandmark || "",
                                        city: draft.addressCity || "",
                                        state: draft.addressState || "",
                                        pincode: draft.addressPincode || "",
                                    };
                        const saveAsPresent =
                            draft.addressSource === "communication" ||
                            (draft.addressSource === "permanent" && formData.sameAsPermanentAddress !== false);
                        const updated = nominees.map((item: any, idx: number) => {
                            if (idx !== index) return item;
                            return {
                                ...item,
                                name: draft.name || "",
                                relation: draft.relation || "",
                                dob: draft.dob || "",
                                addressLine1: selectedAddress.line1 || "",
                                addressLine2: selectedAddress.line2 || "",
                                addressLine3: selectedAddress.line3 || "",
                                addressNearestLandmark: selectedAddress.nearestLandmark || "",
                                addressCity: selectedAddress.city || "",
                                addressState: selectedAddress.state || "",
                                addressPincode: selectedAddress.pincode || "",
                                addressSource: saveAsPresent ? "communication" : draft.addressSource || "custom",
                            };
                        });
                        const primaryNominee = updated[0];
                        updateFormData({
                            nominees: updated,
                            nomineeName: primaryNominee?.name || "",
                            nomineeRelation: primaryNominee?.relation || "",
                            nomineeDob: primaryNominee?.dob || "",
                            nomineeAddressLine1: primaryNominee?.addressLine1 || "",
                            nomineeAddressLine2: primaryNominee?.addressLine2 || "",
                            nomineeAddressLine3: primaryNominee?.addressLine3 || "",
                            nomineeAddressNearestLandmark: primaryNominee?.addressNearestLandmark || "",
                            nomineeAddressCity: primaryNominee?.addressCity || "",
                            nomineeAddressState: primaryNominee?.addressState || "",
                            nomineeAddressPincode: primaryNominee?.addressPincode || "",
                            nomineeAddress: formatNomineeAddressValue({
                                line1: primaryNominee?.addressLine1,
                                line2: primaryNominee?.addressLine2,
                                line3: primaryNominee?.addressLine3,
                                nearestLandmark: primaryNominee?.addressNearestLandmark,
                                city: primaryNominee?.addressCity,
                                state: primaryNominee?.addressState,
                                pincode: primaryNominee?.addressPincode,
                            }),
                            nomineeAddressSource: primaryNominee?.addressSource || "custom",
                            nomineeSameAsCommunicationAddress: primaryNominee?.addressSource === "communication",
                        });
                    },
                    validate: (draft) => {
                        if (isBlank(draft.addressSource) || draft.addressSource === "none") {
                            return "Please confirm nominee address (same as yours or enter manually).";
                        }
                        if (isBlank(draft.relation)) {
                            return "Please select a relationship.";
                        }
                        if (isBlank(draft.name)) {
                            return "Please enter nominee name.";
                        }
                        if (isBlank(draft.dob)) {
                            return "Please enter nominee date of birth.";
                        }
                        if (draft.addressSource === "custom") {
                            return validateAddressFields({
                                line1: draft.addressLine1,
                                line2: draft.addressLine2,
                                city: draft.addressCity,
                                state: draft.addressState,
                                pincode: draft.addressPincode,
                            });
                        }
                        return null;
                    },
                });
            });
        }

        return items;
    }, [changedFields, formData, formatAddress, formatIncomeRange, isNtb, reviewEmail, updateFormData]);

    const sections = useMemo(() => {
        if (isNtb) return [];
        const personal: ReviewItem[] = [
            {
                id: "fullName",
                label: "Full Name",
                value: formData.name || "—",
                getDraft: () => ({ name: formData.name || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.name || ""}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        className="enterprise-input"
                        placeholder="Full name"
                    />
                ),
                onSave: (draft) => updateFormData({ name: draft.name || "" }),
                validate: (draft) => (isBlank(draft.name) ? "Please enter full name." : null),
            },
            {
                id: "mobileNumber",
                label: "Mobile Number",
                value: formData.mobileNumber ? `+91 ${formData.mobileNumber}` : "—",
                getDraft: () => ({ mobileNumber: formData.mobileNumber || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.mobileNumber || ""}
                        onChange={(e) => setDraft({ ...draft, mobileNumber: e.target.value })}
                        className="enterprise-input"
                        placeholder="Mobile number"
                    />
                ),
                onSave: (draft) => updateFormData({ mobileNumber: draft.mobileNumber || "" }),
                validate: (draft) => (isBlank(draft.mobileNumber) ? "Please enter mobile number." : null),
            },
            {
                id: "email",
                label: "Email",
                value: formData.email || "—",
                getDraft: () => ({ email: formData.email || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        type="email"
                        value={draft.email || ""}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="enterprise-input"
                        placeholder="name@example.com"
                    />
                ),
                onSave: (draft) => updateFormData({ email: draft.email || "" }),
                validate: (draft) => (isBlank(draft.email) ? "Please enter email." : null),
            },
            {
                id: "dob",
                label: "Date of Birth",
                value: formData.dob || "—",
                getDraft: () => ({ dob: formData.dob || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        type="date"
                        value={draft.dob || ""}
                        onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                        className="enterprise-input"
                    />
                ),
                onSave: (draft) => updateFormData({ dob: draft.dob || "" }),
                validate: (draft) => (isBlank(draft.dob) ? "Please enter date of birth." : null),
            },
            {
                id: "pan",
                label: "PAN",
                value: formData.pan || "—",
                getDraft: () => ({ pan: formData.pan || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.pan || ""}
                        onChange={(e) => setDraft({ ...draft, pan: e.target.value })}
                        className="enterprise-input"
                        placeholder="PAN"
                    />
                ),
                onSave: (draft) => updateFormData({ pan: draft.pan || "" }),
                validate: (draft) => (isBlank(draft.pan) ? "Please enter PAN." : null),
            },
            {
                id: "maritalStatus",
                label: "Marital Status",
                value: formData.maritalStatus
                    ? String(formData.maritalStatus).charAt(0).toUpperCase() + String(formData.maritalStatus).slice(1)
                    : "—",
                getDraft: () => ({ maritalStatus: formData.maritalStatus || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select value={draft.maritalStatus || ""} onValueChange={(val) => setDraft({ ...draft, maritalStatus: val })}>
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            {maritalOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ maritalStatus: draft.maritalStatus || "" }),
                validate: (draft) => (isBlank(draft.maritalStatus) ? "Please select marital status." : null),
            },
            {
                id: "fatherName",
                label: "Father's Name",
                value: formData.fatherName || "—",
                getDraft: () => ({ fatherName: formData.fatherName || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.fatherName || ""}
                        onChange={(e) => setDraft({ ...draft, fatherName: e.target.value })}
                        className="enterprise-input"
                        placeholder="Father's name"
                    />
                ),
                onSave: (draft) => updateFormData({ fatherName: draft.fatherName || "" }),
                validate: (draft) => (isBlank(draft.fatherName) ? "Please enter father's name." : null),
            },
            {
                id: "motherName",
                label: "Mother's Name",
                value: formData.motherName || "—",
                getDraft: () => ({ motherName: formData.motherName || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.motherName || ""}
                        onChange={(e) => setDraft({ ...draft, motherName: e.target.value })}
                        className="enterprise-input"
                        placeholder="Mother's name"
                    />
                ),
                onSave: (draft) => updateFormData({ motherName: draft.motherName || "" }),
                validate: (draft) => (isBlank(draft.motherName) ? "Please enter mother's name." : null),
            },
        ];

        const addresses: ReviewItem[] = [
            {
                id: "currentAddress",
                label: "Current Address",
                value: formData.currentAddress || "—",
                getDraft: () => ({ currentAddress: formData.currentAddress || "" }),
                renderEdit: (draft, setDraft) => (
                    <Input
                        value={draft.currentAddress || ""}
                        onChange={(e) => setDraft({ ...draft, currentAddress: e.target.value })}
                        className="enterprise-input"
                        placeholder="Current address"
                    />
                ),
                onSave: (draft) => updateFormData({ currentAddress: draft.currentAddress || "" }),
                validate: (draft) => (isBlank(draft.currentAddress) ? "Please enter current address." : null),
            },
            {
                id: "communicationAddress",
                label: "Communication Address",
                value: (formData.sameAsCurrentAddress ? formData.currentAddress : formData.communicationAddress) || "—",
                getDraft: () => ({
                    line1: formData.communicationAddressLine1 || "",
                    line2: formData.communicationAddressLine2 || "",
                    line3: formData.communicationAddressLine3 || "",
                    nearestLandmark: formData.communicationAddressNearestLandmark || "",
                    city: formData.communicationAddressCity || "",
                    state: formData.communicationAddressState || "",
                    pincode: formData.communicationAddressPincode || "",
                }),
                renderEdit: (draft, setDraft) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                            <Input
                                value={draft.line1 || ""}
                                onChange={(e) => setDraft({ ...draft, line1: e.target.value })}
                                className="enterprise-input"
                                placeholder="Line 1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Input
                                value={draft.line2 || ""}
                                onChange={(e) => setDraft({ ...draft, line2: e.target.value })}
                                className="enterprise-input"
                                placeholder="Line 2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Input
                                value={draft.line3 || ""}
                                onChange={(e) => setDraft({ ...draft, line3: e.target.value })}
                                className="enterprise-input"
                                placeholder="Line 3"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Input
                                value={draft.nearestLandmark || ""}
                                onChange={(e) => setDraft({ ...draft, nearestLandmark: e.target.value })}
                                className="enterprise-input"
                                placeholder="Nearest landmark"
                            />
                        </div>
                        <div>
                            <Input
                                value={draft.city || ""}
                                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                                className="enterprise-input"
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <Input
                                value={draft.state || ""}
                                onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                                className="enterprise-input"
                                placeholder="State"
                            />
                        </div>
                        <div>
                            <Input
                                value={draft.pincode || ""}
                                onChange={(e) => setDraft({ ...draft, pincode: e.target.value })}
                                className="enterprise-input"
                                placeholder="Pincode"
                            />
                        </div>
                    </div>
                ),
                onSave: (draft) =>
                    updateFormData({
                        sameAsPermanentAddress: false,
                        communicationAddressLine1: draft.line1 || "",
                        communicationAddressLine2: draft.line2 || "",
                        communicationAddressLine3: draft.line3 || "",
                        communicationAddressNearestLandmark: draft.nearestLandmark || "",
                        communicationAddressCity: draft.city || "",
                        communicationAddressState: draft.state || "",
                        communicationAddressPincode: draft.pincode || "",
                        communicationAddress: formatAddress({
                            line1: draft.line1 || "",
                            line2: draft.line2 || "",
                            line3: draft.line3 || "",
                            nearestLandmark: draft.nearestLandmark || "",
                            city: draft.city || "",
                            state: draft.state || "",
                            pincode: draft.pincode || "",
                        }),
                    }),
                validate: (draft) => validateAddressFields(draft),
            },
        ];

        const profile: ReviewItem[] = [
            {
                id: "incomeRange",
                label: "Annual Income Range",
                value: formatIncomeRange(formData.incomeRange),
                getDraft: () => ({ incomeRange: formData.incomeRange || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select value={draft.incomeRange || ""} onValueChange={(val) => setDraft({ ...draft, incomeRange: val })}>
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            {incomeRangeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ incomeRange: draft.incomeRange || "" }),
                validate: (draft) => (isBlank(draft.incomeRange) ? "Please select an income range." : null),
            },
            {
                id: "kycMethod",
                label: "KYC Method",
                value: formData.kycMethod === "physicalKyc" ? "Physical KYC" : "Digital KYC",
                getDraft: () => ({ kycMethod: formData.kycMethod || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select value={draft.kycMethod || ""} onValueChange={(val) => setDraft({ ...draft, kycMethod: val })}>
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select KYC method" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="digitalKyc" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Digital KYC
                            </SelectItem>
                            <SelectItem value="physicalKyc" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Physical KYC
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ kycMethod: draft.kycMethod || "" }),
                validate: (draft) => (isBlank(draft.kycMethod) ? "Please select a KYC method." : null),
            },
        ];

        const nomineeEnabled = !!formData.wantsNominee;
        const etbPresentNomineeAddress = {
            line1: formData.communicationAddressLine1 || "",
            line2: formData.communicationAddressLine2 || "",
            line3: formData.communicationAddressLine3 || "",
            nearestLandmark: formData.communicationAddressNearestLandmark || "",
            city: formData.communicationAddressCity || "",
            state: formData.communicationAddressState || "",
            pincode: formData.communicationAddressPincode || "",
        };
        const nominee: ReviewItem[] = nomineeEnabled
            ? [
                  {
                      id: "nominee",
                      label: "Nominee",
                      value:
                          [
                              formData.nomineeName,
                              formatNomineeAddressValue({
                                  line1: formData.nomineeAddressLine1,
                                  line2: formData.nomineeAddressLine2,
                                  line3: formData.nomineeAddressLine3,
                                  nearestLandmark: formData.nomineeAddressNearestLandmark,
                                  city: formData.nomineeAddressCity,
                                  state: formData.nomineeAddressState,
                                  pincode: formData.nomineeAddressPincode,
                              }),
                          ]
                              .filter(Boolean)
                              .join(" • ") || "—",
                      getDraft: () => {
                          const raw = formData.nomineeAddressSource || "custom";
                          const normalizedSource =
                              raw === "permanent" && formData.sameAsPermanentAddress !== false
                                  ? "communication"
                                  : raw === "none"
                                    ? "communication"
                                    : raw === "permanent"
                                      ? "custom"
                                      : raw;
                          return {
                              name: formData.nomineeName || "",
                              relation: formData.nomineeRelation || "",
                              dob: formData.nomineeDob || "",
                              addressSource: normalizedSource,
                              addressLine1: formData.nomineeAddressLine1 || "",
                              addressLine2: formData.nomineeAddressLine2 || "",
                              addressLine3: formData.nomineeAddressLine3 || "",
                              addressNearestLandmark: formData.nomineeAddressNearestLandmark || "",
                              addressCity: formData.nomineeAddressCity || "",
                              addressState: formData.nomineeAddressState || "",
                              addressPincode: formData.nomineeAddressPincode || "",
                          };
                      },
                      renderEdit: (draft, setDraft) => {
                          const livesAtSame =
                              draft.addressSource === "communication" ||
                              (draft.addressSource === "permanent" && formData.sameAsPermanentAddress !== false);
                          const resolvedAddress = livesAtSame
                              ? etbPresentNomineeAddress
                              : {
                                    line1: draft.addressLine1 || "",
                                    line2: draft.addressLine2 || "",
                                    line3: draft.addressLine3 || "",
                                    nearestLandmark: draft.addressNearestLandmark || "",
                                    city: draft.addressCity || "",
                                    state: draft.addressState || "",
                                    pincode: draft.addressPincode || "",
                                };
                          const addressReadOnly = livesAtSame;
                          const readOnlyCls = "bg-gray-100 text-gray-500 cursor-not-allowed";
                          return (
                              <div className="space-y-3">
                                  <Select
                                      value={draft.relation || ""}
                                      onValueChange={(val) => setDraft({ ...draft, relation: val })}
                                  >
                                      <SelectTrigger className="enterprise-input flex items-center justify-between">
                                          <SelectValue placeholder="Select relationship" />
                                      </SelectTrigger>
                                      <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                                          {nomineeRelationOptions.map((option) => (
                                              <SelectItem
                                                  key={option.value}
                                                  value={option.value}
                                                  className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                                              >
                                                  {option.label}
                                              </SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                                  <Input
                                      value={draft.name || ""}
                                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                      className="enterprise-input"
                                      placeholder="Nominee name"
                                  />
                                  <Input
                                      type="date"
                                      value={draft.dob || ""}
                                      onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                                      className="enterprise-input"
                                  />
                                  <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer select-none">
                                      <Checkbox
                                          checked={livesAtSame}
                                          onCheckedChange={(v) => {
                                              const on = v === true;
                                              if (on) {
                                                  setDraft({
                                                      ...draft,
                                                      addressSource: "communication",
                                                      addressLine1: etbPresentNomineeAddress.line1,
                                                      addressLine2: etbPresentNomineeAddress.line2,
                                                      addressLine3: etbPresentNomineeAddress.line3,
                                                      addressNearestLandmark: etbPresentNomineeAddress.nearestLandmark,
                                                      addressCity: etbPresentNomineeAddress.city,
                                                      addressState: etbPresentNomineeAddress.state,
                                                      addressPincode: etbPresentNomineeAddress.pincode,
                                                  });
                                              } else {
                                                  setDraft({ ...draft, addressSource: "custom" });
                                              }
                                          }}
                                          className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                                      />
                                      <span>
                                          <span className="font-semibold">Nominee lives at same address</span>
                                          <span className="block text-xs text-gray-600 font-normal mt-0.5">
                                              Present address from your application. Edit it in the address section
                                              above.
                                          </span>
                                      </span>
                                  </label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="md:col-span-2">
                                          <Input
                                              value={resolvedAddress.line1 || ""}
                                              onChange={(e) => setDraft({ ...draft, addressLine1: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="House/Flat, Building"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div className="md:col-span-2">
                                          <Input
                                              value={resolvedAddress.line2 || ""}
                                              onChange={(e) => setDraft({ ...draft, addressLine2: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="Street, Locality"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div className="md:col-span-2">
                                          <Input
                                              value={resolvedAddress.line3 || ""}
                                              onChange={(e) => setDraft({ ...draft, addressLine3: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="Area, colony (optional)"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div className="md:col-span-2">
                                          <Input
                                              value={resolvedAddress.nearestLandmark || ""}
                                              onChange={(e) =>
                                                  setDraft({ ...draft, addressNearestLandmark: e.target.value })
                                              }
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="Nearest landmark"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div>
                                          <Input
                                              value={resolvedAddress.pincode || ""}
                                              onChange={(e) => setDraft({ ...draft, addressPincode: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="6-digit PIN"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div>
                                          <Input
                                              value={resolvedAddress.city || ""}
                                              onChange={(e) => setDraft({ ...draft, addressCity: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="City"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                      <div>
                                          <Input
                                              value={resolvedAddress.state || ""}
                                              onChange={(e) => setDraft({ ...draft, addressState: e.target.value })}
                                              className={`enterprise-input ${addressReadOnly ? readOnlyCls : ""}`}
                                              placeholder="State"
                                              readOnly={addressReadOnly}
                                              disabled={addressReadOnly}
                                          />
                                      </div>
                                  </div>
                              </div>
                          );
                      },
                      onSave: (draft) => {
                          const saveAsPresent =
                              draft.addressSource === "communication" ||
                              (draft.addressSource === "permanent" && formData.sameAsPermanentAddress !== false);
                          const selected = saveAsPresent
                              ? etbPresentNomineeAddress
                              : {
                                    line1: draft.addressLine1 || "",
                                    line2: draft.addressLine2 || "",
                                    line3: draft.addressLine3 || "",
                                    nearestLandmark: draft.addressNearestLandmark || "",
                                    city: draft.addressCity || "",
                                    state: draft.addressState || "",
                                    pincode: draft.addressPincode || "",
                                };
                          updateFormData({
                              nomineeName: draft.name || "",
                              nomineeRelation: draft.relation || "",
                              nomineeDob: draft.dob || "",
                              nomineeAddressLine1: selected.line1 || "",
                              nomineeAddressLine2: selected.line2 || "",
                              nomineeAddressLine3: selected.line3 || "",
                              nomineeAddressNearestLandmark: selected.nearestLandmark || "",
                              nomineeAddressCity: selected.city || "",
                              nomineeAddressState: selected.state || "",
                              nomineeAddressPincode: selected.pincode || "",
                              nomineeAddress: formatNomineeAddressValue({
                                  line1: selected.line1 || "",
                                  line2: selected.line2 || "",
                                  line3: selected.line3 || "",
                                  nearestLandmark: selected.nearestLandmark || "",
                                  city: selected.city || "",
                                  state: selected.state || "",
                                  pincode: selected.pincode || "",
                              }),
                              nomineeAddressSource: saveAsPresent ? "communication" : "custom",
                              nomineeSameAsCommunicationAddress: saveAsPresent,
                          });
                      },
                      validate: (draft) => {
                          if (isBlank(draft.relation)) return "Please select a relationship.";
                          if (isBlank(draft.name)) return "Please enter nominee name.";
                          if (isBlank(draft.dob)) return "Please enter nominee date of birth.";
                          if (draft.addressSource === "custom") {
                              return validateAddressFields({
                                  line1: draft.addressLine1,
                                  line2: draft.addressLine2,
                                  city: draft.addressCity,
                                  state: draft.addressState,
                                  pincode: draft.addressPincode,
                              });
                          }
                          return null;
                      },
                  },
              ]
            : [];

        return [
            { title: "Personal & Identity", items: personal },
            { title: "Addresses", items: addresses },
            { title: "Profile", items: profile },
            ...(nomineeEnabled ? [{ title: "Nominee", items: nominee }] : []),
        ];
    }, [formData, formatAddress, formatIncomeRange, isNtb, updateFormData]);

    useEffect(() => {
        if (!isNtb) return;
        if (ntbItems.length === 0) {
            setBottomBarContent(null);
            nextStep();
        }
    }, [isNtb, nextStep, ntbItems.length, setBottomBarContent]);

    return (
        <StepCard step={stepLabel} maxWidth="2xl">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Review Your Application</h1>
                <p className="page-subtitle">
                    Please verify all details before submitting
                </p>
            </div>

            {/* Summary */}
            <div className="space-y-4">
                {isNtb ? (
                    ntbItems.length === 0 ? (
                        <div className="bg-white rounded-[var(--radius-lg)] border border-gray-200 p-5 text-center">
                            <p className="text-sm font-semibold text-gray-800">No changes to review.</p>
                            <p className="text-xs text-gray-600 mt-1">You can continue with the next step.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[var(--radius-lg)] border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {ntbItems.map((item) => {
                                    const isEditing = !!editState[item.id];
                                    const draft = drafts[item.id] || item.getDraft?.() || {};
                                    return (
                                        <div key={item.id} className="px-5 py-4 border-t border-gray-100 md:border-t-0 md:border-r last:md:border-r-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                                {item.renderEdit && !isEditing && (
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(item.id, item.getDraft ? item.getDraft() : {})}
                                                        className="text-[11px] font-semibold text-hdfc-blue hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                            {isEditing && item.renderEdit ? (
                                                <div className="mt-3 space-y-3">
                                                    {item.renderEdit(draft, (next) => setDrafts((prev) => ({ ...prev, [item.id]: next })))}
                                                    <div className="flex items-center gap-2">
                                                        <Button type="button" className="btn-primary h-8 px-4 text-xs" onClick={() => saveEdit(item)}>
                                                            Save
                                                        </Button>
                                                        <Button type="button" variant="outline" className="h-8 px-4 text-xs" onClick={() => cancelEdit(item.id)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    {draftErrors[item.id] && (
                                                        <p className="error-text">
                                                            <AlertCircle className="w-4 h-4" />
                                                            {draftErrors[item.id]}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm font-semibold text-gray-900 mt-1 whitespace-pre-wrap break-words">{item.value}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ) : sections.length === 0 ? (
                    <div className="bg-white rounded-[var(--radius-lg)] border border-gray-200 p-5 text-center">
                        <p className="text-sm font-semibold text-gray-800">No changes to review.</p>
                        <p className="text-xs text-gray-600 mt-1">You can continue with the next step.</p>
                    </div>
                ) : (
                    sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-[var(--radius-lg)] border border-gray-200 overflow-hidden">
                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{section.title}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {section.items.map((item) => {
                                const isEditing = !!editState[item.id];
                                const draft = drafts[item.id] || item.getDraft?.() || {};
                                return (
                                    <div key={item.id} className="px-5 py-4 border-t border-gray-100 md:border-t-0 md:border-r last:md:border-r-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                            {item.renderEdit && !isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(item.id, item.getDraft ? item.getDraft() : {})}
                                                    className="text-[11px] font-semibold text-hdfc-blue hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                        {isEditing && item.renderEdit ? (
                                            <div className="mt-3 space-y-3">
                                                {item.renderEdit(draft, (next) => setDrafts((prev) => ({ ...prev, [item.id]: next })))}
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" className="btn-primary h-8 px-4 text-xs" onClick={() => saveEdit(item)}>
                                                        Save
                                                    </Button>
                                                    <Button type="button" variant="outline" className="h-8 px-4 text-xs" onClick={() => cancelEdit(item.id)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                                {draftErrors[item.id] && (
                                                    <p className="error-text">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {draftErrors[item.id]}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm font-semibold text-gray-900 mt-1 whitespace-pre-wrap break-words">{item.value}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    ))
                )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                        checked={termsAccepted}
                        onCheckedChange={(v) => setTermsAccepted(v === true)}
                        className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                        I confirm that all information provided is accurate and I accept the{" "}
                        <a href="#" className="text-hdfc-blue hover:underline font-medium">
                            Terms & Conditions
                        </a>{" "}
                        of {config.name}.
                    </span>
                </label>

                {!termsAccepted && (
                    <p className="helper-text flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" />
                        Please accept the terms to submit
                    </p>
                )}
            </div>
        </StepCard>
    );
}
