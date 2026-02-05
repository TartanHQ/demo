"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, DollarSign, Loader2, Mail, MapPin, ShieldCheck, User, UserPlus, Plus, Trash2 } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";

type AddressFields = {
  line1: string;
  line2: string;
  line3: string;
  city: string;
  state: string;
  pincode: string;
};

type NomineeAddressSource = "communication" | "permanent" | "custom";

type Nominee = {
  name: string;
  relation: string;
  dob: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  addressSource: NomineeAddressSource;
};

const createEmptyNominee = (): Nominee => ({
  name: "",
  relation: "",
  dob: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  addressCity: "",
  addressState: "",
  addressPincode: "",
  addressSource: "custom",
});

const formatAddress = (address: AddressFields) => {
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

const mapAddressFieldsToNominee = (address: AddressFields) => ({
  addressLine1: address.line1,
  addressLine2: address.line2,
  addressLine3: address.line3,
  addressCity: address.city,
  addressState: address.state,
  addressPincode: address.pincode,
});

export default function StepCombinedDetails() {
  const { nextStep, formData, updateFormData, setNomineeEnabled, setBottomBarContent, journeySteps, currentStepIndex, journeyType } =
    useJourney();
  const isNtb = journeyType === "ntb" || journeyType === "ntb-conversion";
  const isNtbConversion = journeyType === "ntb-conversion";

  const [email] = useState(formData.email || "");
  const [usesPrimaryEmailForComms, setUsesPrimaryEmailForComms] = useState<boolean | null>(
    formData.usesPrimaryEmailForComms === undefined ? null : !!formData.usesPrimaryEmailForComms
  );
  const [communicationEmail, setCommunicationEmail] = useState(formData.communicationEmail || "");
  const [fatherName, setFatherName] = useState(formData.fatherName || "");
  const [motherName, setMotherName] = useState(formData.motherName || "");
  const [maritalStatus, setMaritalStatus] = useState(formData.maritalStatus || "");
  const [incomeRange, setIncomeRange] = useState(formData.incomeRange || "");
  const [isPep, setIsPep] = useState<boolean>(!!formData.isPep);
  const [isIndianNational, setIsIndianNational] = useState<boolean>(formData.isIndianNational !== false);
  const [isTaxResidentIndiaOnly, setIsTaxResidentIndiaOnly] = useState<boolean>(formData.isTaxResidentIndiaOnly !== false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [permanentAddress, setPermanentAddress] = useState<AddressFields>({
    line1: formData.permanentAddressLine1 || formData.currentAddress || "",
    line2: formData.permanentAddressLine2 || "",
    line3: formData.permanentAddressLine3 || "",
    city: formData.permanentAddressCity || "",
    state: formData.permanentAddressState || "",
    pincode: formData.permanentAddressPincode || "",
  });
  const [communicationAddress, setCommunicationAddress] = useState<AddressFields>({
    line1: formData.communicationAddressLine1 || formData.communicationAddress || "",
    line2: formData.communicationAddressLine2 || "",
    line3: formData.communicationAddressLine3 || "",
    city: formData.communicationAddressCity || "",
    state: formData.communicationAddressState || "",
    pincode: formData.communicationAddressPincode || "",
  });
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState<boolean>(
    formData.sameAsPermanentAddress ?? formData.sameAsCurrentAddress ?? true
  );

  const [wantsNominee, setWantsNominee] = useState<boolean | null>(
    formData.wantsNominee === undefined ? null : !!formData.wantsNominee
  );

  const [nominees, setNominees] = useState<Nominee[]>(() => {
    if (Array.isArray(formData.nominees) && formData.nominees.length > 0) {
      return formData.nominees.map((nominee: any) => ({
        ...createEmptyNominee(),
        ...nominee,
        addressSource:
          nominee.addressSource ||
          (nominee.sameAsCommunicationAddress ? "communication" : "custom"),
      }));
    }
    if (formData.nomineeName || formData.nomineeRelation || formData.nomineeDob || formData.nomineeAddress) {
      return [
        {
          ...createEmptyNominee(),
          name: formData.nomineeName || "",
          relation: formData.nomineeRelation || "",
          dob: formData.nomineeDob || "",
          addressLine1: formData.nomineeAddressLine1 || formData.nomineeAddress || "",
          addressLine2: formData.nomineeAddressLine2 || "",
          addressLine3: formData.nomineeAddressLine3 || "",
          addressCity: formData.nomineeAddressCity || "",
          addressState: formData.nomineeAddressState || "",
          addressPincode: formData.nomineeAddressPincode || "",
          addressSource: formData.nomineeAddressSource || (formData.nomineeSameAsCommunicationAddress ? "communication" : "custom"),
        },
      ];
    }
    return [createEmptyNominee()];
  });

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
      sameAsPermanentAddress
        ? permanentAddressForNominee
        : mapAddressFieldsToNominee(communicationAddress),
    [sameAsPermanentAddress, permanentAddressForNominee, communicationAddress]
  );

  useEffect(() => {
    if (!sameAsPermanentAddress) return;
    if (isNtb) {
      setCommunicationAddress({ ...permanentAddressFieldsForComm });
    } else {
      setCommunicationAddress({ ...permanentAddress });
    }
  }, [sameAsPermanentAddress, permanentAddress, isNtb, permanentAddressFieldsForComm]);

  useEffect(() => {
    if (!wantsNominee) return;
    setNominees((prev) =>
      prev.map((nominee) => {
        if (nominee.addressSource === "communication") {
          return { ...nominee, ...communicationAddressForNominee };
        }
        if (nominee.addressSource === "permanent") {
          return { ...nominee, ...permanentAddressForNominee };
        }
        return nominee;
      })
    );
  }, [communicationAddressForNominee, permanentAddressForNominee, wantsNominee]);

  useEffect(() => {
    if (wantsNominee === true && nominees.length === 0) {
      setNominees([createEmptyNominee()]);
    }
  }, [wantsNominee, nominees.length]);

  const isAddressComplete = (address: AddressFields) =>
    !!address.line1 &&
    !!address.line2 &&
    !!address.line3 &&
    !!address.city &&
    !!address.state &&
    !!address.pincode;

  const isNomineeAddressComplete = (nominee: Nominee) =>
    !!nominee.addressLine1 &&
    !!nominee.addressLine2 &&
    !!nominee.addressLine3 &&
    !!nominee.addressCity &&
    !!nominee.addressState &&
    !!nominee.addressPincode;

  const isNomineeComplete = (nominee: Nominee) =>
    !!nominee.name &&
    !!nominee.relation &&
    (nominee.addressSource !== "custom" || isNomineeAddressComplete(nominee));

  const displayEmail = useMemo(
    () => (usesPrimaryEmailForComms === false && communicationEmail ? communicationEmail : email),
    [communicationEmail, email, usesPrimaryEmailForComms]
  );

  const isPermanentAddressValid = isNtb ? !!permanentAddressText.trim() : isAddressComplete(permanentAddress);

  const isFormValid =
    email &&
    fatherName &&
    motherName &&
    maritalStatus &&
    incomeRange &&
    usesPrimaryEmailForComms !== null &&
    (usesPrimaryEmailForComms || !!communicationEmail) &&
    isPermanentAddressValid &&
    (sameAsPermanentAddress || isAddressComplete(communicationAddress)) &&
    wantsNominee !== null &&
    (!wantsNominee || (nominees.length > 0 && nominees.every(isNomineeComplete)));

  const handleContinue = useCallback(() => {
    setShowErrors(true);
    if (!isFormValid) return;

    setIsLoading(true);
    const resolvedCommunicationAddress = sameAsPermanentAddress ? permanentAddressFieldsForComm : communicationAddress;
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
    const nextData: Record<string, any> = {
      email: displayEmail,
      usesPrimaryEmailForComms,
      communicationEmail: usesPrimaryEmailForComms ? "" : communicationEmail,
      fatherName,
      motherName,
      maritalStatus,
      incomeRange,
      communicationAddressLine1: resolvedCommunicationAddress.line1,
      communicationAddressLine2: resolvedCommunicationAddress.line2,
      communicationAddressLine3: resolvedCommunicationAddress.line3,
      communicationAddressCity: resolvedCommunicationAddress.city,
      communicationAddressState: resolvedCommunicationAddress.state,
      communicationAddressPincode: resolvedCommunicationAddress.pincode,
      sameAsPermanentAddress,
      sameAsCurrentAddress: sameAsPermanentAddress,
      currentAddress: permanentAddressText,
      communicationAddress: formatAddress(resolvedCommunicationAddress),
      wantsNominee: wantsNominee === true,
      nominees: resolvedNominees,
      nomineeName: primaryNominee?.name || "",
      nomineeRelation: primaryNominee?.relation || "",
      nomineeDob: primaryNominee?.dob || "",
      nomineeAddress: primaryNominee
        ? formatAddress({
            line1: primaryNominee.addressLine1,
            line2: primaryNominee.addressLine2,
            line3: primaryNominee.addressLine3,
            city: primaryNominee.addressCity,
            state: primaryNominee.addressState,
            pincode: primaryNominee.addressPincode,
          })
        : "",
      nomineeAddressLine1: primaryNominee?.addressLine1 || "",
      nomineeAddressLine2: primaryNominee?.addressLine2 || "",
      nomineeAddressLine3: primaryNominee?.addressLine3 || "",
      nomineeAddressCity: primaryNominee?.addressCity || "",
      nomineeAddressState: primaryNominee?.addressState || "",
      nomineeAddressPincode: primaryNominee?.addressPincode || "",
      nomineeSameAsCommunicationAddress: primaryNominee?.addressSource === "communication",
      nomineeAddressSource: primaryNominee?.addressSource || "custom",
      isPep,
      isIndianNational,
      isTaxResidentIndiaOnly,
    };
    if (!isNtb) {
      nextData.permanentAddressLine1 = permanentAddress.line1;
      nextData.permanentAddressLine2 = permanentAddress.line2;
      nextData.permanentAddressLine3 = permanentAddress.line3;
      nextData.permanentAddressCity = permanentAddress.city;
      nextData.permanentAddressState = permanentAddress.state;
      nextData.permanentAddressPincode = permanentAddress.pincode;
    }
    updateFormData(nextData);
    setNomineeEnabled(wantsNominee === true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 1000);
  }, [
    communicationAddress,
    communicationAddressForNominee,
    communicationEmail,
    displayEmail,
    email,
    fatherName,
    incomeRange,
    isFormValid,
    isIndianNational,
    isPep,
    isTaxResidentIndiaOnly,
    maritalStatus,
    motherName,
    nextStep,
    nominees,
    permanentAddress,
    permanentAddressFieldsForComm,
    permanentAddressForNominee,
    permanentAddressText,
    sameAsPermanentAddress,
    setNomineeEnabled,
    updateFormData,
    usesPrimaryEmailForComms,
    wantsNominee,
    isNtb,
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

  return (
    <StepCard
      step={(() => {
        const total = journeySteps.length || 0;
        if (!total) return undefined;
        return `Step ${currentStepIndex + 1} of ${total}`;
      })()}
      maxWidth="2xl"
    >
      <div className="page-header">
        <h1 className="page-title">Personal Details</h1>
        <p className="page-subtitle">Confirm a few details so we can complete your account setup.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="space-y-6"
      >
        {/* Contact & Family */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address
            </label>
            <Input
              type="email"
              value={displayEmail}
              readOnly
              className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="helper-text">This is prefilled from your invite.</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Statement & Notification Email</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUsesPrimaryEmailForComms(true)}
                  className={[
                    "h-9 px-4 rounded-[999px] text-xs font-semibold border transition-colors",
                    usesPrimaryEmailForComms === true
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Use this email
                </button>
                <button
                  type="button"
                  onClick={() => setUsesPrimaryEmailForComms(false)}
                  className={[
                    "h-9 px-4 rounded-[999px] text-xs font-semibold border transition-colors",
                    usesPrimaryEmailForComms === false
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Use a different email
                </button>
              </div>
              {showErrors && usesPrimaryEmailForComms === null && (
                <p className="error-text">
                  <AlertCircle className="w-4 h-4" />
                  Please select an option.
                </p>
              )}
              {usesPrimaryEmailForComms === false && (
                <div>
                  <Input
                    type="email"
                    value={communicationEmail}
                    onChange={(e) => setCommunicationEmail(e.target.value)}
                    className={`enterprise-input ${showErrors && !communicationEmail ? "error" : ""}`}
                    placeholder="name@example.com"
                  />
                  {showErrors && !communicationEmail && (
                    <p className="error-text">
                      <AlertCircle className="w-4 h-4" />
                      Please enter a communication email.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Marital Status
            </label>
            <Select
              value={maritalStatus}
              onValueChange={(val) => {
                if (isNtbConversion) return;
                setMaritalStatus(val);
              }}
              disabled={isNtbConversion}
            >
              <SelectTrigger
                className={`enterprise-input flex items-center justify-between ${showErrors && !maritalStatus ? "error" : ""} ${
                  isNtbConversion ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
              >
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
            {showErrors && !maritalStatus && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please select your marital status.
              </p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Father’s Name
            </label>
            <Input
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className={`enterprise-input ${showErrors && !fatherName ? "error" : ""} ${
                isNtbConversion ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
              placeholder="Full name"
              readOnly={isNtbConversion}
            />
            {showErrors && !fatherName && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please enter your father’s name.
              </p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Mother’s Name
            </label>
            <Input
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className={`enterprise-input ${showErrors && !motherName ? "error" : ""} ${
                isNtbConversion ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
              placeholder="Full name"
              readOnly={isNtbConversion}
            />
            {showErrors && !motherName && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please enter your mother’s name.
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Permanent Address
              </p>
              <p className="text-xs text-gray-600 mt-1">This is prefilled from your Aadhaar.</p>
            </div>
          </div>

          {isNtb ? (
            <div>
              <label className="form-label">Address</label>
              <Input
                value={permanentAddressText}
                readOnly
                className={`enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed ${showErrors && !isPermanentAddressValid ? "error" : ""}`}
                placeholder="Aadhaar address"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label">Line 1</label>
                <Input
                  value={permanentAddress.line1}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, line1: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.line1 ? "error" : ""}`}
                  placeholder="House/Flat, Building"
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Line 2</label>
                <Input
                  value={permanentAddress.line2}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, line2: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.line2 ? "error" : ""}`}
                  placeholder="Street, Locality"
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Line 3</label>
                <Input
                  value={permanentAddress.line3}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, line3: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.line3 ? "error" : ""}`}
                  placeholder="Area/Landmark"
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <Input
                  value={permanentAddress.city}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.city ? "error" : ""}`}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <Input
                  value={permanentAddress.state}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.state ? "error" : ""}`}
                  placeholder="State"
                />
              </div>
              <div>
                <label className="form-label">Pincode</label>
                <Input
                  value={permanentAddress.pincode}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.pincode ? "error" : ""}`}
                  placeholder="6-digit PIN"
                />
              </div>
            </div>
          )}
          {showErrors && !isPermanentAddressValid && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              Please confirm your permanent address.
            </p>
          )}

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer select-none">
            <Checkbox
              checked={sameAsPermanentAddress}
              onCheckedChange={(v) => setSameAsPermanentAddress(v === true)}
              className="rounded-[var(--radius)] border-gray-300 data-[state=checked]:bg-[#004C8F] data-[state=checked]:border-[#004C8F]"
            />
            Communication/Current address is the same as permanent
          </label>

          {!sameAsPermanentAddress && (
            <div className="space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                  Communication/Current Address
                </p>
                <p className="text-xs text-gray-600 mt-1">Provide the address for correspondence.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Line 1</label>
                  <Input
                    value={communicationAddress.line1}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, line1: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.line1 ? "error" : ""}`}
                    placeholder="House/Flat, Building"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Line 2</label>
                  <Input
                    value={communicationAddress.line2}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, line2: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.line2 ? "error" : ""}`}
                    placeholder="Street, Locality"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Line 3</label>
                  <Input
                    value={communicationAddress.line3}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, line3: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.line3 ? "error" : ""}`}
                    placeholder="Area/Landmark"
                  />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <Input
                    value={communicationAddress.city}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.city ? "error" : ""}`}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <Input
                    value={communicationAddress.state}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.state ? "error" : ""}`}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="form-label">Pincode</label>
                  <Input
                    value={communicationAddress.pincode}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.pincode ? "error" : ""}`}
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>
              {showErrors && !isAddressComplete(communicationAddress) && (
                <p className="error-text">
                  <AlertCircle className="w-4 h-4" />
                  Please complete all communication address fields.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Income + Nominee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="form-label flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              Annual Income Range
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
                  Do you want to add a nominee?
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
              const addressDisabled = nominee.addressSource !== "custom";

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
                      <label className="form-label">Nominee’s Full Name</label>
                  <Input
                    type="text"
                        value={nominee.name}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, name: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.name ? "error" : ""}`}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                      <label className="form-label">Relationship</label>
                  <Select
                        value={nominee.relation}
                        onValueChange={(val) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => {
                              if (idx !== index) return item;
                              const next = { ...item, relation: val };
                              if (val === "father") {
                                next.name = fatherName;
                              }
                              if (val === "mother") {
                                next.name = motherName;
                              }
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
                    <label className="form-label">Nominee Date of Birth</label>
                    <Input
                      type="date"
                        value={nominee.dob}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, dob: e.target.value } : item))
                          )
                        }
                      className="enterprise-input"
                    />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-800">Nominee Address</p>
                    {isNtb ? (
                      <Select
                        value={nominee.addressSource}
                        onValueChange={(val) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => {
                              if (idx !== index) return item;
                              const next = { ...item, addressSource: val as NomineeAddressSource };
                              if (val === "communication") {
                                return { ...next, ...communicationAddressForNominee };
                              }
                              if (val === "permanent") {
                                return { ...next, ...permanentAddressForNominee };
                              }
                              return next;
                            })
                          )
                        }
                      >
                        <SelectTrigger className="enterprise-input flex items-center justify-between">
                          <SelectValue placeholder="Select address source" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                          <SelectItem value="permanent" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                            Use permanent address
                          </SelectItem>
                          <SelectItem value="communication" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                            Use communication address
                          </SelectItem>
                          <SelectItem value="custom" className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                            Enter a different address
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "permanent", label: "Use permanent address" },
                          { value: "communication", label: "Use communication address" },
                          { value: "custom", label: "Enter a different address" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setNominees((prev) =>
                                prev.map((item, idx) => {
                                  if (idx !== index) return item;
                                  const next = { ...item, addressSource: option.value as NomineeAddressSource };
                                  if (option.value === "communication") {
                                    return { ...next, ...communicationAddressForNominee };
                                  }
                                  if (option.value === "permanent") {
                                    return { ...next, ...permanentAddressForNominee };
                                  }
                                  return next;
                                })
                              )
                            }
                            className={[
                              "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                              nominee.addressSource === option.value
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="form-label">Line 1</label>
                      <Input
                        value={nominee.addressLine1}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, addressLine1: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.addressLine1 ? "error" : ""}`}
                        placeholder="House/Flat, Building"
                        disabled={addressDisabled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Line 2</label>
                      <Input
                        value={nominee.addressLine2}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, addressLine2: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.addressLine2 ? "error" : ""}`}
                        placeholder="Street, Locality"
                        disabled={addressDisabled}
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
                        className={`enterprise-input ${showErrors && !nominee.addressLine3 ? "error" : ""}`}
                        placeholder="Area/Landmark"
                        disabled={addressDisabled}
                      />
                    </div>
                    <div>
                      <label className="form-label">City</label>
                      <Input
                        value={nominee.addressCity}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, addressCity: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.addressCity ? "error" : ""}`}
                        placeholder="City"
                        disabled={addressDisabled}
                      />
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <Input
                        value={nominee.addressState}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, addressState: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.addressState ? "error" : ""}`}
                        placeholder="State"
                        disabled={addressDisabled}
                      />
                    </div>
                    <div>
                      <label className="form-label">Pincode</label>
                      <Input
                        value={nominee.addressPincode}
                        onChange={(e) =>
                          setNominees((prev) =>
                            prev.map((item, idx) => (idx === index ? { ...item, addressPincode: e.target.value } : item))
                          )
                        }
                        className={`enterprise-input ${showErrors && !nominee.addressPincode ? "error" : ""}`}
                        placeholder="6-digit PIN"
                        disabled={addressDisabled}
                      />
                    </div>
                  </div>

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

        {/* Regulatory declarations (mandatory) */}
        <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              Regulatory Declarations
            </p>
            <p className="text-xs text-gray-600 mt-1">As per RBI/Compliance requirements, please confirm the below.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Are you a Politically Exposed Person (PEP)?",
                value: isPep,
                setValue: setIsPep,
                key: "isPep",
              },
              {
                label: "Are you an Indian national?",
                value: isIndianNational,
                setValue: setIsIndianNational,
                key: "isIndianNational",
              },
              {
                label: "Are you a Tax Resident of India only?",
                value: isTaxResidentIndiaOnly,
                setValue: setIsTaxResidentIndiaOnly,
                key: "isTaxResidentIndiaOnly",
              },
            ].map((q) => (
              <div key={q.key} className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-800">{q.label}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isNtbConversion) return;
                      q.setValue(false);
                    }}
                    disabled={isNtbConversion}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === false ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      isNtbConversion ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isNtbConversion) return;
                      q.setValue(true);
                    }}
                    disabled={isNtbConversion}
                    className={[
                      "h-8 px-3 rounded-[999px] text-xs font-semibold border transition-colors",
                      q.value === true ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
                      isNtbConversion ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    Yes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </StepCard>
  );
}
