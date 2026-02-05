"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
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
};

export default function StepReviewApplication() {
    const { nextStep, formData, journeySteps, currentStepIndex, setBottomBarContent, journeyType, changedFields, updateFormData } =
        useJourney();
    const { config } = useBranding();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [editState, setEditState] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, Record<string, any>>>({});
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

    const stepLabel = useMemo(() => {
        const total = journeySteps.length || 0;
        if (!total) return undefined;
        return `Step ${currentStepIndex + 1} of ${total}`;
    }, [journeySteps.length, currentStepIndex]);

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

    const formatAddress = (address: {
        line1?: string;
        line2?: string;
        line3?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }) => {
        return [
            address.line1,
            address.line2,
            address.line3,
            address.city,
            address.state,
            address.pincode,
        ]
            .filter(Boolean)
            .join(", ");
    };

    const startEdit = (id: string, initial: Record<string, any>) => {
        setEditState((prev) => ({ ...prev, [id]: true }));
        setDrafts((prev) => ({ ...prev, [id]: initial }));
    };

    const cancelEdit = (id: string) => {
        setEditState((prev) => ({ ...prev, [id]: false }));
        setDrafts((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const saveEdit = (id: string, onSave?: (draft: Record<string, any>) => void) => {
        if (!onSave) return;
        const draft = drafts[id];
        onSave(draft || {});
        setEditState((prev) => ({ ...prev, [id]: false }));
        setDrafts((prev) => {
            const next = { ...prev };
            delete next[id];
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
        const hasChanged = (key: string) => changedFields.includes(key);
        const items: ReviewItem[] = [];

        if (hasChanged("communicationEmail")) {
            items.push({
                id: "statementEmail",
                label: "Statement & Notification Email",
                value: reviewEmail || "—",
                getDraft: () => ({
                    usesPrimaryEmailForComms: formData.usesPrimaryEmailForComms !== false,
                    communicationEmail: formData.communicationEmail || "",
                }),
                renderEdit: (draft, setDraft) => (
                    <div className="space-y-3">
                        <Select
                            value={draft.usesPrimaryEmailForComms ? "primary" : "different"}
                            onValueChange={(val) =>
                                setDraft({
                                    ...draft,
                                    usesPrimaryEmailForComms: val === "primary",
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
                        {!draft.usesPrimaryEmailForComms && (
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
                        usesPrimaryEmailForComms: draft.usesPrimaryEmailForComms,
                        communicationEmail: draft.usesPrimaryEmailForComms ? "" : draft.communicationEmail || "",
                    }),
            });
        }
        if (hasChanged("maritalStatus")) {
            items.push({
                id: "maritalStatus",
                label: "Marital Status",
                value: formData.maritalStatus ? String(formData.maritalStatus).charAt(0).toUpperCase() + String(formData.maritalStatus).slice(1) : "—",
                getDraft: () => ({ maritalStatus: formData.maritalStatus || "" }),
                renderEdit: (draft, setDraft) => (
                    <Select value={draft.maritalStatus || ""} onValueChange={(val) => setDraft({ ...draft, maritalStatus: val })}>
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                            <SelectItem value="single" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Single
                            </SelectItem>
                            <SelectItem value="married" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Married
                            </SelectItem>
                            <SelectItem value="other" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Other
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ maritalStatus: draft.maritalStatus || "" }),
            });
        }
        if (hasChanged("fatherName")) {
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
            });
        }
        if (hasChanged("motherName")) {
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
            });
        }
        if (hasChanged("incomeRange")) {
            items.push({
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
                            <SelectItem value="0-5L" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                Up to ₹5L
                            </SelectItem>
                            <SelectItem value="5-10L" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                ₹5L – ₹10L
                            </SelectItem>
                            <SelectItem value="10-15L" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                ₹10L – ₹15L
                            </SelectItem>
                            <SelectItem value="15-25L" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                ₹15L – ₹25L
                            </SelectItem>
                            <SelectItem value="25L+" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                                ₹25L+
                            </SelectItem>
                        </SelectContent>
                    </Select>
                ),
                onSave: (draft) => updateFormData({ incomeRange: draft.incomeRange || "" }),
            });
        }

        const communicationFields = [
            "communicationAddressLine1",
            "communicationAddressLine2",
            "communicationAddressLine3",
            "communicationAddressCity",
            "communicationAddressState",
            "communicationAddressPincode",
        ];
        if (communicationFields.some((key) => hasChanged(key))) {
            const communicationAddressValue = formData.sameAsPermanentAddress
                ? formData.currentAddress
                    ? `${formData.currentAddress} (same as permanent)`
                    : "Same as permanent address"
                : formatAddress({
                      line1: formData.communicationAddressLine1 || "",
                      line2: formData.communicationAddressLine2 || "",
                      line3: formData.communicationAddressLine3 || "",
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
                        communicationAddressCity: draft.city || "",
                        communicationAddressState: draft.state || "",
                        communicationAddressPincode: draft.pincode || "",
                        communicationAddress: formatAddress({
                            line1: draft.line1 || "",
                            line2: draft.line2 || "",
                            line3: draft.line3 || "",
                            city: draft.city || "",
                            state: draft.state || "",
                            pincode: draft.pincode || "",
                        }),
                    });
                },
            });
        }

        const nomineeEnabled = !!formData.wantsNominee;
        if (nomineeEnabled && hasChanged("nominees")) {
            const nominees = Array.isArray(formData.nominees) ? formData.nominees : [];
            nominees.forEach((nominee: any, index: number) => {
                const addressValue = formatAddress({
                    line1: nominee.addressLine1 || "",
                    line2: nominee.addressLine2 || "",
                    line3: nominee.addressLine3 || "",
                    city: nominee.addressCity || "",
                    state: nominee.addressState || "",
                    pincode: nominee.addressPincode || "",
                });
                items.push({
                    id: `nominee-${index}`,
                    label: `Nominee ${index + 1}`,
                    value: [nominee.name, nominee.relation, nominee.dob, addressValue].filter(Boolean).join(" • ") || "—",
                    getDraft: () => ({
                        name: nominee.name || "",
                        relation: nominee.relation || "",
                        dob: nominee.dob || "",
                        addressLine1: nominee.addressLine1 || "",
                        addressLine2: nominee.addressLine2 || "",
                        addressLine3: nominee.addressLine3 || "",
                        addressCity: nominee.addressCity || "",
                        addressState: nominee.addressState || "",
                        addressPincode: nominee.addressPincode || "",
                    }),
                    renderEdit: (draft, setDraft) => (
                        <div className="space-y-3">
                            <Input
                                value={draft.name || ""}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                className="enterprise-input"
                                placeholder="Nominee name"
                            />
                            <Select value={draft.relation || ""} onValueChange={(val) => setDraft({ ...draft, relation: val })}>
                                <SelectTrigger className="enterprise-input flex items-center justify-between">
                                    <SelectValue placeholder="Relationship" />
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
                            <Input
                                type="date"
                                value={draft.dob || ""}
                                onChange={(e) => setDraft({ ...draft, dob: e.target.value })}
                                className="enterprise-input"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                    <Input
                                        value={draft.addressLine1 || ""}
                                        onChange={(e) => setDraft({ ...draft, addressLine1: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="Line 1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        value={draft.addressLine2 || ""}
                                        onChange={(e) => setDraft({ ...draft, addressLine2: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="Line 2"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        value={draft.addressLine3 || ""}
                                        onChange={(e) => setDraft({ ...draft, addressLine3: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="Line 3"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={draft.addressCity || ""}
                                        onChange={(e) => setDraft({ ...draft, addressCity: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={draft.addressState || ""}
                                        onChange={(e) => setDraft({ ...draft, addressState: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={draft.addressPincode || ""}
                                        onChange={(e) => setDraft({ ...draft, addressPincode: e.target.value })}
                                        className="enterprise-input"
                                        placeholder="Pincode"
                                    />
                                </div>
                            </div>
                        </div>
                    ),
                    onSave: (draft) => {
                        const updated = nominees.map((item: any, idx: number) => {
                            if (idx !== index) return item;
                            return {
                                ...item,
                                name: draft.name || "",
                                relation: draft.relation || "",
                                dob: draft.dob || "",
                                addressLine1: draft.addressLine1 || "",
                                addressLine2: draft.addressLine2 || "",
                                addressLine3: draft.addressLine3 || "",
                                addressCity: draft.addressCity || "",
                                addressState: draft.addressState || "",
                                addressPincode: draft.addressPincode || "",
                                addressSource: "custom",
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
                            nomineeAddressCity: primaryNominee?.addressCity || "",
                            nomineeAddressState: primaryNominee?.addressState || "",
                            nomineeAddressPincode: primaryNominee?.addressPincode || "",
                        });
                    },
                });
            });
        }

        return items;
    }, [changedFields, formData, formatAddress, formatIncomeRange, isNtb, reviewEmail, updateFormData]);

    const sections = useMemo(() => {
        if (!isNtb) {
        const personal = [
            { label: "Full Name", value: formData.name || "—" },
            { label: "Mobile Number", value: formData.mobileNumber ? `+91 ${formData.mobileNumber}` : "—" },
            { label: "Email", value: formData.email || "—" },
            { label: "Date of Birth", value: formData.dob || "—" },
            { label: "PAN", value: formData.pan || "—" },
            { label: "Marital Status", value: formData.maritalStatus ? String(formData.maritalStatus).charAt(0).toUpperCase() + String(formData.maritalStatus).slice(1) : "—" },
            { label: "Father's Name", value: formData.fatherName || "—" },
            { label: "Mother's Name", value: formData.motherName || "—" },
        ];

        const addresses = [
            { label: "Current Address", value: formData.currentAddress || "—" },
            {
                label: "Communication Address",
                value: (formData.sameAsCurrentAddress ? formData.currentAddress : formData.communicationAddress) || "—",
            },
        ];

        const profile = [
            { label: "Annual Income Range", value: formatIncomeRange(formData.incomeRange) },
            { label: "KYC Method", value: formData.kycMethod === "physicalKyc" ? "Physical KYC" : "Digital KYC" },
        ];

        const nomineeEnabled = !!formData.wantsNominee;
        const nominee = nomineeEnabled
            ? [
                { label: "Nominee Name", value: formData.nomineeName || "—" },
                { label: "Relationship", value: formData.nomineeRelation ? String(formData.nomineeRelation).charAt(0).toUpperCase() + String(formData.nomineeRelation).slice(1) : "—" },
                { label: "Nominee DOB", value: formData.nomineeDob || "—" },
                { label: "Nominee Address", value: formData.nomineeAddress || "—" },
            ]
            : [];

        return [
            { title: "Personal & Identity", items: personal },
            { title: "Addresses", items: addresses },
            { title: "Profile", items: profile },
            ...(nomineeEnabled ? [{ title: "Nominee", items: nominee }] : []),
        ];
        }

        const hasChanged = (key: string) => changedFields.includes(key);

        const items: { title: string; items: { label: string; value: string }[] }[] = [];
        const personalItems: { label: string; value: string }[] = [];

        if (hasChanged("name")) personalItems.push({ label: "Full Name", value: formData.name });
        if (hasChanged("mobileNumber")) personalItems.push({ label: "Mobile Number", value: `+91 ${formData.mobileNumber}` });
        if (hasChanged("dob")) personalItems.push({ label: "Date of Birth", value: formData.dob });
        if (hasChanged("pan")) personalItems.push({ label: "PAN", value: formData.pan });
        if (hasChanged("maritalStatus")) {
            personalItems.push({
                label: "Marital Status",
                value: String(formData.maritalStatus).charAt(0).toUpperCase() + String(formData.maritalStatus).slice(1),
            });
        }
        if (hasChanged("fatherName")) personalItems.push({ label: "Father's Name", value: formData.fatherName });
        if (hasChanged("motherName")) personalItems.push({ label: "Mother's Name", value: formData.motherName });

        if (hasChanged("email")) {
            personalItems.push({ label: "Email", value: formData.email });
        } else if (formData.usesPrimaryEmailForComms === false && hasChanged("communicationEmail")) {
            personalItems.push({ label: "Communication Email", value: formData.communicationEmail });
        }

        if (personalItems.length) items.push({ title: "Personal & Identity", items: personalItems });

        const addressFields = [
            "permanentAddressLine1",
            "permanentAddressLine2",
            "permanentAddressLine3",
            "permanentAddressCity",
            "permanentAddressState",
            "permanentAddressPincode",
        ];

        const communicationFields = [
            "communicationAddressLine1",
            "communicationAddressLine2",
            "communicationAddressLine3",
            "communicationAddressCity",
            "communicationAddressState",
            "communicationAddressPincode",
        ];

        const permanentAddressChanged = addressFields.some((key) => hasChanged(key));
        const communicationAddressChanged =
            formData.sameAsPermanentAddress === false &&
            communicationFields.some((key) => hasChanged(key));

        const addressItems: { label: string; value: string }[] = [];
        if (permanentAddressChanged) {
            addressItems.push({
                label: "Permanent Address",
                value: formatAddress({
                    line1: formData.permanentAddressLine1 || "",
                    line2: formData.permanentAddressLine2 || "",
                    line3: formData.permanentAddressLine3 || "",
                    city: formData.permanentAddressCity || "",
                    state: formData.permanentAddressState || "",
                    pincode: formData.permanentAddressPincode || "",
                }),
            });
        }
        if (communicationAddressChanged) {
            addressItems.push({
                label: "Communication Address",
                value: formatAddress({
                    line1: formData.communicationAddressLine1 || "",
                    line2: formData.communicationAddressLine2 || "",
                    line3: formData.communicationAddressLine3 || "",
                    city: formData.communicationAddressCity || "",
                    state: formData.communicationAddressState || "",
                    pincode: formData.communicationAddressPincode || "",
                }),
            });
        }
        if (addressItems.length) items.push({ title: "Addresses", items: addressItems });

        const profileItems: { label: string; value: string }[] = [];
        if (hasChanged("incomeRange")) {
            profileItems.push({ label: "Annual Income Range", value: formatIncomeRange(formData.incomeRange) });
        }
        if (!hideBooleanChanges && hasChanged("kycMethod")) {
            profileItems.push({ label: "KYC Method", value: formData.kycMethod === "physicalKyc" ? "Physical KYC" : "Digital KYC" });
        }
        if (profileItems.length) items.push({ title: "Profile", items: profileItems });

        const declarationsItems: { label: string; value: string }[] = [];
        if (!hideBooleanChanges && hasChanged("isPep")) declarationsItems.push({ label: "Politically Exposed", value: formData.isPep ? "Yes" : "No" });
        if (!hideBooleanChanges && hasChanged("isIndianNational")) declarationsItems.push({ label: "Indian National", value: formData.isIndianNational ? "Yes" : "No" });
        if (!hideBooleanChanges && hasChanged("isTaxResidentIndiaOnly")) declarationsItems.push({ label: "Tax Resident of India Only", value: formData.isTaxResidentIndiaOnly ? "Yes" : "No" });
        if (declarationsItems.length) items.push({ title: "Declarations", items: declarationsItems });

        const nomineeEnabled = !!formData.wantsNominee;
        const nominees = Array.isArray(formData.nominees) ? formData.nominees : [];
        if (!hideBooleanChanges && nomineeEnabled && nominees.length && (hasChanged("nominees") || hasChanged("wantsNominee"))) {
            const nomineeItems = nominees.flatMap((nominee: any, index: number) => {
                const addressValue = formatAddress({
                    line1: nominee.addressLine1 || "",
                    line2: nominee.addressLine2 || "",
                    line3: nominee.addressLine3 || "",
                    city: nominee.addressCity || "",
                    state: nominee.addressState || "",
                    pincode: nominee.addressPincode || "",
                });
                return [
                    { label: `Nominee ${index + 1} Name`, value: nominee.name || "—" },
                    { label: `Nominee ${index + 1} Relationship`, value: nominee.relation ? String(nominee.relation).charAt(0).toUpperCase() + String(nominee.relation).slice(1) : "—" },
                    { label: `Nominee ${index + 1} DOB`, value: nominee.dob || "—" },
                    { label: `Nominee ${index + 1} Address`, value: addressValue || "—" },
                ];
            });
            items.push({ title: "Nominee", items: nomineeItems });
        }

        return items;
    }, [changedFields, formData, hideBooleanChanges, isNtb]);

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
                                                        <Button type="button" className="btn-primary h-8 px-4 text-xs" onClick={() => saveEdit(item.id, item.onSave)}>
                                                            Save
                                                        </Button>
                                                        <Button type="button" variant="outline" className="h-8 px-4 text-xs" onClick={() => cancelEdit(item.id)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
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
                            {section.items.map((item) => (
                                <div key={item.label} className="px-5 py-4 border-t border-gray-100 md:border-t-0 md:border-r last:md:border-r-0">
                                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-1 whitespace-pre-wrap break-words">{item.value}</p>
                                </div>
                            ))}
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
