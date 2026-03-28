"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, DollarSign, Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type AddressFields,
  type Nominee,
  buildInitialNomineesFromFormData,
  createEmptyNominee,
  formatAddress,
  formatNomineeAddressDisplay,
  getCityStateForPincode,
  mapAddressFieldsToNominee,
} from "@/app/components/steps/personalDetailsNomineeShared";

export default function StepIncomeAndNominee() {
  const { nextStep, formData, updateFormData, setNomineeEnabled, setBottomBarContent, journeySteps, currentStepIndex, journeyType } =
    useJourney();
  const isNtb = journeyType === "ntb" || journeyType === "ntb-conversion";

  const fatherName = formData.fatherName || "";
  const motherName = formData.motherName || "";
  const sameAsPermanentAddress = formData.sameAsPermanentAddress ?? formData.sameAsCurrentAddress ?? true;

  const permanentAddress = useMemo<AddressFields>(
    () => ({
      line1: formData.permanentAddressLine1 || "",
      line2: formData.permanentAddressLine2 || "",
      line3: formData.permanentAddressLine3 || "",
      nearestLandmark: formData.permanentAddressNearestLandmark || "",
      city: formData.permanentAddressCity || "",
      state: formData.permanentAddressState || "",
      pincode: formData.permanentAddressPincode || "",
    }),
    [formData]
  );

  const communicationAddress = useMemo<AddressFields>(
    () => ({
      line1: formData.communicationAddressLine1 || formData.communicationAddress || "",
      line2: formData.communicationAddressLine2 || "",
      line3: formData.communicationAddressLine3 || "",
      nearestLandmark: formData.communicationAddressNearestLandmark || "",
      city: formData.communicationAddressCity || "",
      state: formData.communicationAddressState || "",
      pincode: formData.communicationAddressPincode || "",
    }),
    [formData]
  );

  const permanentAddressText = useMemo(
    () => formData.currentAddress || formatAddress(permanentAddress),
    [formData.currentAddress, permanentAddress]
  );

  const permanentAddressFieldsForComm = useMemo<AddressFields>(
    () =>
      isNtb
        ? {
            line1: permanentAddressText,
            line2: "",
            line3: "",
            nearestLandmark: "",
            city: "",
            state: "",
            pincode: "",
          }
        : permanentAddress,
    [isNtb, permanentAddress, permanentAddressText]
  );

  const permanentAddressForNominee = useMemo(
    () => (isNtb ? mapAddressFieldsToNominee(permanentAddressFieldsForComm) : mapAddressFieldsToNominee(permanentAddress)),
    [isNtb, permanentAddress, permanentAddressFieldsForComm]
  );

  const communicationAddressForNominee = useMemo(
    () =>
      sameAsPermanentAddress ? permanentAddressForNominee : mapAddressFieldsToNominee(communicationAddress),
    [sameAsPermanentAddress, permanentAddressForNominee, communicationAddress]
  );

  const presentAddressIsAadhaarStyle = isNtb && sameAsPermanentAddress;

  const [incomeRange, setIncomeRange] = useState(formData.incomeRange || "");
  const [wantsNominee, setWantsNominee] = useState<boolean | null>(
    formData.wantsNominee === undefined ? null : !!formData.wantsNominee
  );
  const [nominees, setNominees] = useState<Nominee[]>(() => buildInitialNomineesFromFormData(formData));
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const incomeRanges = useMemo(
    () => [
      { value: "0-5L", label: "Up to ₹5L" },
      { value: "5-10L", label: "₹5L – ₹10L" },
      { value: "10-15L", label: "₹10L – ₹15L" },
      { value: "15-25L", label: "₹15L – ₹25L" },
      { value: "25L+", label: "₹25L+" },
    ],
    []
  );

  useEffect(() => {
    if (!wantsNominee) return;
    setNominees((prev) =>
      prev.map((nominee) => {
        if (nominee.addressSource === "communication") {
          return { ...nominee, ...communicationAddressForNominee };
        }
        if (nominee.addressSource === "permanent" && !sameAsPermanentAddress) {
          return { ...nominee, ...permanentAddressForNominee };
        }
        if (nominee.addressSource === "permanent" && sameAsPermanentAddress) {
          return { ...nominee, addressSource: "communication", ...communicationAddressForNominee };
        }
        return nominee;
      })
    );
  }, [communicationAddressForNominee, permanentAddressForNominee, sameAsPermanentAddress, wantsNominee]);

  useEffect(() => {
    if (wantsNominee === true && nominees.length === 0) {
      setNominees([createEmptyNominee()]);
    }
  }, [wantsNominee, nominees.length]);

  const isNomineeAddressComplete = (nominee: Nominee) =>
    !!nominee.addressLine1 &&
    !!nominee.addressLine2 &&
    !!nominee.addressCity &&
    !!nominee.addressState &&
    !!nominee.addressPincode;

  const isGuardianAddressComplete = (nominee: Nominee) =>
    !!nominee.guardianAddressLine1?.trim() &&
    !!nominee.guardianAddressLine2?.trim() &&
    !!nominee.guardianAddressCity?.trim() &&
    !!nominee.guardianAddressState?.trim() &&
    !!nominee.guardianAddressPincode?.trim();

  const getAgeInYears = (dob: string) => {
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const monthDiff = now.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age;
  };

  const isMinorNominee = (dob: string) => {
    const age = getAgeInYears(dob);
    return age !== null && age < 18;
  };

  const isGuardianComplete = (nominee: Nominee) =>
    !!nominee.guardianFullName?.trim() &&
    !!nominee.guardianDob &&
    isGuardianAddressComplete(nominee);

  const isNomineeComplete = (nominee: Nominee) =>
    nominee.addressSource !== "none" &&
    !!nominee.name &&
    !!nominee.relation &&
    !!nominee.dob &&
    (nominee.addressSource !== "custom" || isNomineeAddressComplete(nominee)) &&
    (!isMinorNominee(nominee.dob) || isGuardianComplete(nominee));

  const isFormValid =
    !!incomeRange &&
    wantsNominee !== null &&
    (!wantsNominee || (nominees.length > 0 && nominees.every(isNomineeComplete)));

  const handleContinue = useCallback(() => {
    setShowErrors(true);
    if (!isFormValid) return;

    setIsLoading(true);
    const resolvedNominees = wantsNominee
      ? nominees.map((nominee) =>
          nominee.addressSource === "communication"
            ? { ...nominee, ...communicationAddressForNominee }
            : nominee.addressSource === "permanent"
              ? { ...nominee, ...permanentAddressForNominee }
              : nominee
        )
      : [];
    const primaryNominee = resolvedNominees[0];
    const prevBaseline = (formData.personalDetailsBaseline || {}) as Record<string, unknown>;
    const mergedBaseline = {
      ...prevBaseline,
      incomeRange,
      wantsNominee: wantsNominee === true,
      nominees: resolvedNominees,
    };

    updateFormData({
      incomeRange,
      wantsNominee: wantsNominee === true,
      nominees: resolvedNominees,
      nomineeName: primaryNominee?.name || "",
      nomineeRelation: primaryNominee?.relation || "",
      nomineeDob: primaryNominee?.dob || "",
      nomineeAddress: primaryNominee ? formatNomineeAddressDisplay(primaryNominee) : "",
      nomineeAddressLine1: primaryNominee?.addressLine1 || "",
      nomineeAddressLine2: primaryNominee?.addressLine2 || "",
      nomineeAddressLine3: primaryNominee?.addressLine3 || "",
      nomineeAddressNearestLandmark: primaryNominee?.addressNearestLandmark || "",
      nomineeAddressCity: primaryNominee?.addressCity || "",
      nomineeAddressState: primaryNominee?.addressState || "",
      nomineeAddressPincode: primaryNominee?.addressPincode || "",
      nomineeSameAsCommunicationAddress: primaryNominee?.addressSource === "communication",
      nomineeAddressSource: primaryNominee?.addressSource || "custom",
      personalDetailsBaseline: mergedBaseline,
    });
    setNomineeEnabled(wantsNominee === true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 800);
  }, [
    communicationAddressForNominee,
    formData.personalDetailsBaseline,
    incomeRange,
    isFormValid,
    nextStep,
    nominees,
    permanentAddressForNominee,
    setNomineeEnabled,
    updateFormData,
    wantsNominee,
  ]);

  useEffect(() => {
    setBottomBarContent(
      <div className="w-full flex justify-end">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isLoading || !isFormValid}
          className="btn-primary w-full md:w-[360px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Continue</span>
              {wantsNominee && (
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-extrabold tracking-wide">
                  Nominee Added
                </span>
              )}
            </span>
          )}
        </Button>
      </div>
    );
  }, [handleContinue, isLoading, isFormValid, setBottomBarContent, wantsNominee]);

  const stepLabel = useMemo(() => {
    const total = journeySteps.length || 0;
    if (!total) return undefined;
    return `Step ${currentStepIndex + 1} of ${total}`;
  }, [journeySteps.length, currentStepIndex]);

  return (
    <StepCard step={stepLabel} maxWidth="2xl">
      <div className="page-header">
        <h1 className="page-title">Income & nominee</h1>
        <p className="page-subtitle">Select your income range and tell us if you would like to add a nominee.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="space-y-6"
      >
        {/* Income + Nominee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              Annual Income Range *
            </label>
            <Select value={incomeRange} onValueChange={setIncomeRange}>
              <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !incomeRange ? "error" : ""}`}>
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                {incomeRanges.map((r) => (
                  <SelectItem
                    key={r.value}
                    value={r.value}
                    className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showErrors && !incomeRange && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please select an income range.
              </p>
            )}
          </div>

          <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Do you want to add a nominee? *
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  If yes, add nominee details. You can add up to 4 nominees.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setWantsNominee(true)}
                  className={[
                    "h-9 px-4 rounded-[999px] text-xs font-semibold border transition-colors",
                    wantsNominee === true
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWantsNominee(false)}
                  className={[
                    "h-9 px-4 rounded-[999px] text-xs font-semibold border transition-colors",
                    wantsNominee === false
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  No
                </button>
              </div>
            </div>
            {showErrors && wantsNominee === null && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please choose whether to add a nominee.
              </p>
            )}
          </div>
        </div>

        {wantsNominee && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-slate-400" />
                Nominee Details
              </p>
              {nominees.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNominees((prev) => [...prev, createEmptyNominee()])}
                  className="h-8 px-3 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add nominee
                </Button>
              )}
            </div>

            {nominees.map((nominee, index) => {
              const nomineeErrors = showErrors && !isNomineeComplete(nominee);
              const livesAtSameAddress =
                nominee.addressSource === "communication" ||
                (nominee.addressSource === "permanent" && sameAsPermanentAddress);
              const addressReadOnly = livesAtSameAddress;
              const readOnlyAddressClass =
                "bg-gray-100 text-gray-500 cursor-not-allowed";
              const nomineeIsMinor = isMinorNominee(nominee.dob);

              return (
                <div key={`nominee-${index}`} className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">Nominee {index + 1}</p>
                    {nominees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNominees((prev) => prev.filter((_, i) => i !== index))}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Relationship *</label>
                      <Select
                        value={nominee.relation}
                        onValueChange={(val) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => {
                              if (idx !== index) return item;
                              const next = { ...item, relation: val };
                              if (val === "father") {
                                next.name = fatherName;
                                next.nameLocked = true;
                                return next;
                              }
                              if (val === "mother") {
                                next.name = motherName;
                                next.nameLocked = true;
                                return next;
                              }
                              next.name = "";
                              next.nameLocked = false;
                              return next;
                            })
                          )
                        }
                      >
                        <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !nominee.relation ? "error" : ""}`}>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                          {[
                            { value: "spouse", label: "Spouse" },
                            { value: "father", label: "Father" },
                            { value: "mother", label: "Mother" },
                            { value: "son", label: "Son" },
                            { value: "daughter", label: "Daughter" },
                          ].map((o) => (
                            <SelectItem
                              key={o.value}
                              value={o.value}
                              className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3"
                            >
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="form-label">Nominee’s Full Name *</label>
                      <Input
                        type="text"
                        value={nominee.name}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, name: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.name ? "error" : ""} ${
                          nominee.nameLocked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                        }`}
                        placeholder="Enter full name"
                        readOnly={nominee.nameLocked}
                        disabled={nominee.nameLocked}
                      />
                    </div>
                  <div>
                    <label className="form-label">Nominee Date of Birth *</label>
                    <Input
                      type="date"
                        value={nominee.dob}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, dob: e.target.value } : item))
                          )
                        }
                      className={`enterprise-input ${showErrors && !nominee.dob ? "error" : ""}`}
                    />
                    </div>
                  </div>

                  {nomineeIsMinor && (
                    <div className="rounded-[var(--radius-lg)] border border-rose-100 bg-rose-50/50 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">Guardian Details *</p>
                          <p className="text-xs text-gray-600 mt-1">Nominee is under 18. Capture guardian details.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Guardian Full Name *</label>
                          <Input
                            value={nominee.guardianFullName}
                            onChange={(e) =>
                              setNominees((prev) =>
                                prev.map((item, idx) => (idx === index ? { ...item, guardianFullName: e.target.value } : item))
                              )
                            }
                            className={`enterprise-input ${showErrors && !nominee.guardianFullName ? "error" : ""}`}
                            placeholder="Full name"
                          />
                          {showErrors && !nominee.guardianFullName && (
                            <p className="error-text">
                              <AlertCircle className="w-4 h-4" />
                              Please enter guardian full name.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Guardian DOB *</label>
                          <Input
                            type="date"
                            value={nominee.guardianDob}
                            onChange={(e) =>
                              setNominees((prev) =>
                                prev.map((item, idx) => (idx === index ? { ...item, guardianDob: e.target.value } : item))
                              )
                            }
                            className={`enterprise-input ${showErrors && !nominee.guardianDob ? "error" : ""}`}
                          />
                          {showErrors && !nominee.guardianDob && (
                            <p className="error-text">
                              <AlertCircle className="w-4 h-4" />
                              Please enter guardian date of birth.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-800">Guardian Address *</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="form-label">Line 1 *</label>
                            <Input
                              value={nominee.guardianAddressLine1}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressLine1: e.target.value } : item
                                  )
                                )
                              }
                              className={`enterprise-input ${showErrors && !nominee.guardianAddressLine1?.trim() ? "error" : ""}`}
                              placeholder="House/Flat, Building"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="form-label">Line 2 *</label>
                            <Input
                              value={nominee.guardianAddressLine2}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressLine2: e.target.value } : item
                                  )
                                )
                              }
                              className={`enterprise-input ${showErrors && !nominee.guardianAddressLine2?.trim() ? "error" : ""}`}
                              placeholder="Street, Locality"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="form-label">Line 3</label>
                            <Input
                              value={nominee.guardianAddressLine3}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressLine3: e.target.value } : item
                                  )
                                )
                              }
                              className="enterprise-input"
                              placeholder="Area, colony (optional)"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="form-label">Nearest landmark</label>
                            <Input
                              value={nominee.guardianAddressNearestLandmark}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressNearestLandmark: e.target.value } : item
                                  )
                                )
                              }
                              className="enterprise-input"
                              placeholder="e.g. Near metro station, temple"
                            />
                          </div>
                          <div>
                            <label className="form-label">Pincode *</label>
                            <Input
                              value={nominee.guardianAddressPincode}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) => {
                                    if (idx !== index) return item;
                                    const nextPincode = e.target.value;
                                    const lookup = getCityStateForPincode(nextPincode);
                                    return {
                                      ...item,
                                      guardianAddressPincode: nextPincode,
                                      guardianAddressCity: lookup?.city || item.guardianAddressCity,
                                      guardianAddressState: lookup?.state || item.guardianAddressState,
                                    };
                                  })
                                )
                              }
                              className={`enterprise-input ${showErrors && !nominee.guardianAddressPincode?.trim() ? "error" : ""}`}
                              placeholder="6-digit PIN"
                            />
                          </div>
                          <div>
                            <label className="form-label">City *</label>
                            <Input
                              value={nominee.guardianAddressCity}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressCity: e.target.value } : item
                                  )
                                )
                              }
                              className={`enterprise-input ${showErrors && !nominee.guardianAddressCity?.trim() ? "error" : ""}`}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="form-label">State *</label>
                            <Input
                              value={nominee.guardianAddressState}
                              onChange={(e) =>
                                setNominees((prev) =>
                                  prev.map((item, idx) =>
                                    idx === index ? { ...item, guardianAddressState: e.target.value } : item
                                  )
                                )
                              }
                              className={`enterprise-input ${showErrors && !nominee.guardianAddressState?.trim() ? "error" : ""}`}
                              placeholder="State"
                            />
                          </div>
                        </div>
                        {showErrors && !isGuardianAddressComplete(nominee) && (
                          <p className="error-text">
                            <AlertCircle className="w-4 h-4" />
                            Please complete all required guardian address fields.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-800">Nominee Address</p>
                    <label className="flex items-start gap-2 text-sm text-gray-800 cursor-pointer select-none">
                      <Checkbox
                        checked={livesAtSameAddress}
                        onCheckedChange={(v) => {
                          const on = v === true;
                          setNominees((prev) =>
                            prev.map((item, idx) => {
                              if (idx !== index) return item;
                              if (on) {
                                return {
                                  ...item,
                                  addressSource: "communication",
                                  ...communicationAddressForNominee,
                                };
                              }
                              return { ...item, addressSource: "custom" };
                            })
                          );
                        }}
                        className="mt-0.5 rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
                      />
                      <span>
                        <span className="font-semibold">Nominee lives at same address</span>
                        <span className="block text-xs text-gray-600 font-normal mt-0.5">
                          Uses your present address (permanent or communication, as above). Edit it only in your address
                          section, not here.
                        </span>
                      </span>
                    </label>
                  </div>

                  {livesAtSameAddress && presentAddressIsAadhaarStyle ? (
                    <div>
                      <label className="form-label">Address</label>
                      <Input
                        value={permanentAddressText}
                        readOnly
                        className={`enterprise-input ${readOnlyAddressClass}`}
                        placeholder="Aadhaar address"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="form-label">Line 1 *</label>
                        <Input
                          value={nominee.addressLine1}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, addressLine1: e.target.value } : item))
                            )
                          }
                          className={`enterprise-input ${showErrors && !nominee.addressLine1 ? "error" : ""} ${
                            addressReadOnly ? readOnlyAddressClass : ""
                          }`}
                          placeholder="House/Flat, Building"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Line 2 *</label>
                        <Input
                          value={nominee.addressLine2}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, addressLine2: e.target.value } : item))
                            )
                          }
                          className={`enterprise-input ${showErrors && !nominee.addressLine2 ? "error" : ""} ${
                            addressReadOnly ? readOnlyAddressClass : ""
                          }`}
                          placeholder="Street, Locality"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Line 3</label>
                        <Input
                          value={nominee.addressLine3}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, addressLine3: e.target.value } : item))
                            )
                          }
                          className={`enterprise-input ${addressReadOnly ? readOnlyAddressClass : ""}`}
                          placeholder="Area, colony (optional)"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Nearest landmark</label>
                        <Input
                          value={nominee.addressNearestLandmark}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) =>
                                idx === index ? { ...item, addressNearestLandmark: e.target.value } : item
                              )
                            )
                          }
                          className={`enterprise-input ${addressReadOnly ? readOnlyAddressClass : ""}`}
                          placeholder="e.g. Near metro station, temple"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div>
                        <label className="form-label">Pincode *</label>
                        <Input
                          value={nominee.addressPincode}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => {
                                if (idx !== index) return item;
                                const nextPincode = e.target.value;
                                const lookup = getCityStateForPincode(nextPincode);
                                return {
                                  ...item,
                                  addressPincode: nextPincode,
                                  addressCity: lookup?.city || item.addressCity,
                                  addressState: lookup?.state || item.addressState,
                                };
                              })
                            )
                          }
                          className={`enterprise-input ${showErrors && !nominee.addressPincode ? "error" : ""} ${
                            addressReadOnly ? readOnlyAddressClass : ""
                          }`}
                          placeholder="6-digit PIN"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div>
                        <label className="form-label">City *</label>
                        <Input
                          value={nominee.addressCity}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, addressCity: e.target.value } : item))
                            )
                          }
                          className={`enterprise-input ${showErrors && !nominee.addressCity ? "error" : ""} ${
                            addressReadOnly ? readOnlyAddressClass : ""
                          }`}
                          placeholder="City"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                      <div>
                        <label className="form-label">State *</label>
                        <Input
                          value={nominee.addressState}
                          onChange={(e) =>
                            setNominees((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, addressState: e.target.value } : item))
                            )
                          }
                          className={`enterprise-input ${showErrors && !nominee.addressState ? "error" : ""} ${
                            addressReadOnly ? readOnlyAddressClass : ""
                          }`}
                          placeholder="State"
                          readOnly={addressReadOnly}
                          disabled={addressReadOnly}
                        />
                      </div>
                    </div>
                  )}

                  {nomineeErrors && (
                    <p className="error-text">
                      <AlertCircle className="w-4 h-4" />
                      Please complete nominee {index + 1} details.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </form>
    </StepCard>
  );
}
