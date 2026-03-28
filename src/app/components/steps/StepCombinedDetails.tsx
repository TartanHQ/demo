"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Mail, MapPin, ShieldCheck, User } from "lucide-react";
import StepCard from "@/app/components/layout/StepCard";
import { Checkbox } from "@/components/ui/checkbox";
import { type AddressFields, formatAddress, getCityStateForPincode } from "@/app/components/steps/personalDetailsNomineeShared";

const COUNTRY_OF_BIRTH_DEFAULT = "India";

const BIRTH_STATE_OPTIONS: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
  "Andaman & Nicobar Islands",
  "Lakshadweep",
  "Dadra & Nagar Haveli and Daman & Diu",
];

const RESIDENCE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "owned", label: "Owned" },
  { value: "rented", label: "Rented" },
  { value: "ancestral_family", label: "Ancestral/Family" },
  { value: "company_provided", label: "Company Provided" },
];

export default function StepCombinedDetails() {
  const { nextStep, formData, updateFormData, setBottomBarContent, journeySteps, currentStepIndex, journeyType } =
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
  // Prefill marital status from journey state so conditional spouse fields appear correctly.
  const [maritalStatus, setMaritalStatus] = useState(formData.maritalStatus || "");
  const [spouseName, setSpouseName] = useState(formData.spouseName || "");
  const [stateOfBirth, setStateOfBirth] = useState(formData.stateOfBirth || "");
  const [cityOfBirth, setCityOfBirth] = useState(formData.cityOfBirth || "");
  const [typeOfResidence, setTypeOfResidence] = useState(formData.typeOfResidence || "");
  const [isPep, setIsPep] = useState<boolean>(!!formData.isPep);
  const [isIndianNational, setIsIndianNational] = useState<boolean>(formData.isIndianNational !== false);
  const [isTaxResidentIndiaOnly, setIsTaxResidentIndiaOnly] = useState<boolean>(formData.isTaxResidentIndiaOnly !== false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [permanentAddress, setPermanentAddress] = useState<AddressFields>({
    line1: formData.permanentAddressLine1 || formData.currentAddress || "",
    line2: formData.permanentAddressLine2 || "",
    line3: formData.permanentAddressLine3 || "",
    nearestLandmark: formData.permanentAddressNearestLandmark || "",
    city: formData.permanentAddressCity || "",
    state: formData.permanentAddressState || "",
    pincode: formData.permanentAddressPincode || "",
  });
  const [communicationAddress, setCommunicationAddress] = useState<AddressFields>({
    line1: formData.communicationAddressLine1 || formData.communicationAddress || "",
    line2: formData.communicationAddressLine2 || "",
    line3: formData.communicationAddressLine3 || "",
    nearestLandmark: formData.communicationAddressNearestLandmark || "",
    city: formData.communicationAddressCity || "",
    state: formData.communicationAddressState || "",
    pincode: formData.communicationAddressPincode || "",
  });
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState<boolean>(
    formData.sameAsPermanentAddress ?? formData.sameAsCurrentAddress ?? true
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

  useEffect(() => {
    if (!sameAsPermanentAddress) return;
    if (isNtb) {
      setCommunicationAddress({ ...permanentAddressFieldsForComm });
    } else {
      setCommunicationAddress({ ...permanentAddress });
    }
  }, [sameAsPermanentAddress, permanentAddress, isNtb, permanentAddressFieldsForComm]);

  const isAddressComplete = (address: AddressFields) =>
    !!address.line1 &&
    !!address.line2 &&
    !!address.city &&
    !!address.state &&
    !!address.pincode;

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
    (!isNtb || maritalStatus !== "married" || !!spouseName) &&
    (!isNtb || !!stateOfBirth) &&
    (!isNtb || !!cityOfBirth) &&
    (!isNtb || !!typeOfResidence) &&
    usesPrimaryEmailForComms !== null &&
    (usesPrimaryEmailForComms || !!communicationEmail) &&
    isPermanentAddressValid &&
    (sameAsPermanentAddress || isAddressComplete(communicationAddress));

  const buildPersonalDetailsBaseline = useCallback(() => {
    const resolvedCommunicationAddress = sameAsPermanentAddress ? permanentAddressFieldsForComm : communicationAddress;

    return {
      usesPrimaryEmailForComms,
      communicationEmail: usesPrimaryEmailForComms ? "" : communicationEmail,
      fatherName,
      motherName,
      maritalStatus,
      spouseName,
      countryOfBirth: COUNTRY_OF_BIRTH_DEFAULT,
      stateOfBirth,
      cityOfBirth,
      typeOfResidence,
      sameAsPermanentAddress,
      currentAddress: permanentAddressText,
      communicationAddressLine1: resolvedCommunicationAddress.line1,
      communicationAddressLine2: resolvedCommunicationAddress.line2,
      communicationAddressLine3: resolvedCommunicationAddress.line3,
      communicationAddressNearestLandmark: resolvedCommunicationAddress.nearestLandmark,
      communicationAddressCity: resolvedCommunicationAddress.city,
      communicationAddressState: resolvedCommunicationAddress.state,
      communicationAddressPincode: resolvedCommunicationAddress.pincode,
      isPep,
      isIndianNational,
      isTaxResidentIndiaOnly,
    };
  }, [
    communicationAddress,
    communicationEmail,
    fatherName,
    isIndianNational,
    isPep,
    isTaxResidentIndiaOnly,
    spouseName,
    maritalStatus,
    motherName,
    permanentAddressFieldsForComm,
    permanentAddressText,
    sameAsPermanentAddress,
    stateOfBirth,
    cityOfBirth,
    typeOfResidence,
    usesPrimaryEmailForComms,
  ]);

  useEffect(() => {
    if (formData.personalDetailsBaseline) return;
    updateFormData({ personalDetailsBaseline: buildPersonalDetailsBaseline() });
  }, [buildPersonalDetailsBaseline, formData.personalDetailsBaseline, updateFormData]);

  const handleContinue = useCallback(() => {
    setShowErrors(true);
    if (!isFormValid) return;

    setIsLoading(true);
    const resolvedCommunicationAddress = sameAsPermanentAddress ? permanentAddressFieldsForComm : communicationAddress;
    const nextData: Record<string, any> = {
      email: displayEmail,
      usesPrimaryEmailForComms,
      communicationEmail: usesPrimaryEmailForComms ? "" : communicationEmail,
      fatherName,
      motherName,
      maritalStatus,
      spouseName,
      countryOfBirth: COUNTRY_OF_BIRTH_DEFAULT,
      stateOfBirth,
      cityOfBirth,
      typeOfResidence,
      communicationAddressLine1: resolvedCommunicationAddress.line1,
      communicationAddressLine2: resolvedCommunicationAddress.line2,
      communicationAddressLine3: resolvedCommunicationAddress.line3,
      communicationAddressNearestLandmark: resolvedCommunicationAddress.nearestLandmark,
      communicationAddressCity: resolvedCommunicationAddress.city,
      communicationAddressState: resolvedCommunicationAddress.state,
      communicationAddressPincode: resolvedCommunicationAddress.pincode,
      sameAsPermanentAddress,
      sameAsCurrentAddress: sameAsPermanentAddress,
      currentAddress: permanentAddressText,
      communicationAddress: formatAddress(resolvedCommunicationAddress),
      isPep,
      isIndianNational,
      isTaxResidentIndiaOnly,
    };
    if (!isNtb) {
      nextData.permanentAddressLine1 = permanentAddress.line1;
      nextData.permanentAddressLine2 = permanentAddress.line2;
      nextData.permanentAddressLine3 = permanentAddress.line3;
      nextData.permanentAddressNearestLandmark = permanentAddress.nearestLandmark;
      nextData.permanentAddressCity = permanentAddress.city;
      nextData.permanentAddressState = permanentAddress.state;
      nextData.permanentAddressPincode = permanentAddress.pincode;
    } else {
      nextData.permanentAddressNearestLandmark = "";
    }
    updateFormData(nextData);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 1000);
  }, [
    communicationAddress,
    communicationEmail,
    displayEmail,
    email,
    fatherName,
    isFormValid,
    isIndianNational,
    isPep,
    isTaxResidentIndiaOnly,
    spouseName,
    maritalStatus,
    motherName,
    nextStep,
    permanentAddress,
    permanentAddressFieldsForComm,
    permanentAddressText,
    sameAsPermanentAddress,
    stateOfBirth,
    cityOfBirth,
    typeOfResidence,
    updateFormData,
    usesPrimaryEmailForComms,
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
            </span>
          )}
        </Button>
      </div>
    );
  }, [handleContinue, isLoading, isFormValid, setBottomBarContent]);

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
        {/* Contact & Family — from ~360px: row1 Marital|Spouse, row2 Father|Mother; md preserves email|marital column + father|mother */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-2 gap-5">
          <div className="min-[360px]:col-span-2 min-[360px]:row-start-1 md:col-span-1 md:row-start-1 md:col-start-1">
            <label className="form-label flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address *
            </label>
            {usesPrimaryEmailForComms === false ? (
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
            ) : (
              <>
                <Input
                  type="email"
                  value={displayEmail}
                  readOnly
                  className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="helper-text">This is prefilled from your invite.</p>
              </>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700">Statement & Notification Email *</p>
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
            </div>
          </div>

          <div className="min-[360px]:contents md:!flex md:flex-col md:gap-4 md:col-start-2 md:row-start-1">
            <div className="min-[360px]:col-start-1 min-[360px]:row-start-2 md:col-start-auto md:row-start-auto">
              <label className="form-label flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Marital Status *
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
            {isNtb && maritalStatus === "married" && (
              <div className="min-[360px]:col-start-2 min-[360px]:row-start-2 md:col-start-auto md:row-start-auto md:w-full">
                <label className="form-label flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Spouse Name *
                </label>
                <Input
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  className={`enterprise-input ${showErrors && !spouseName ? "error" : ""}`}
                  placeholder="Full name"
                />
                {showErrors && !spouseName && (
                  <p className="error-text">
                    <AlertCircle className="w-4 h-4" />
                    Please enter spouse name.
                  </p>
                )}
              </div>
            )}
          </div>

          <div
            className={
              isNtb && maritalStatus === "married"
                ? "min-[360px]:col-start-1 min-[360px]:row-start-3 md:col-start-1 md:row-start-2 md:col-span-1"
                : "min-[360px]:col-start-2 min-[360px]:row-start-2 md:col-start-1 md:row-start-2 md:col-span-1"
            }
          >
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Father’s Name *
            </label>
            <Input
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className={`enterprise-input ${showErrors && !fatherName ? "error" : ""} bg-gray-100 text-gray-500 cursor-not-allowed`}
              placeholder="Full name"
              readOnly
              disabled
            />
            {showErrors && !fatherName && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please enter your father’s name.
              </p>
            )}
          </div>

          <div
            className={
              isNtb && maritalStatus === "married"
                ? "min-[360px]:col-start-2 min-[360px]:row-start-3 md:col-start-2 md:row-start-2 md:col-span-1"
                : "min-[360px]:col-span-2 min-[360px]:row-start-3 md:col-start-2 md:row-start-2 md:col-span-1"
            }
          >
            <label className="form-label flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Mother’s Name *
            </label>
            <Input
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className={`enterprise-input ${showErrors && !motherName ? "error" : ""} bg-gray-100 text-gray-500 cursor-not-allowed`}
              placeholder="Full name"
              readOnly
              disabled
            />
            {showErrors && !motherName && (
              <p className="error-text">
                <AlertCircle className="w-4 h-4" />
                Please enter your mother’s name.
              </p>
            )}
          </div>
        </div>

        {/* Birth & Residence (NTB Mandatory) */}
        {isNtb && (
          <div className="rounded-[var(--radius-lg)] border border-gray-200 bg-white p-4 md:p-5 space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-900">Birth & Residence Details</p>
              <p className="text-xs text-gray-600 mt-1">Add the details required for account processing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Country of Birth
                </label>
                <Input value={COUNTRY_OF_BIRTH_DEFAULT} readOnly disabled className="enterprise-input bg-gray-100 text-gray-500 cursor-not-allowed" />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  State of Birth *
                </label>
                <Select value={stateOfBirth} onValueChange={(val) => { setStateOfBirth(val); setCityOfBirth(""); }}>
                  <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !stateOfBirth ? "error" : ""}`}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                    {BIRTH_STATE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showErrors && !stateOfBirth && (
                  <p className="error-text">
                    <AlertCircle className="w-4 h-4" />
                    Please select state of birth.
                  </p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  City of Birth *
                </label>
                <Input
                  value={cityOfBirth}
                  onChange={(e) => setCityOfBirth(e.target.value)}
                  disabled={!stateOfBirth}
                  className={`enterprise-input ${showErrors && !cityOfBirth ? "error" : ""} ${!stateOfBirth ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                  placeholder={stateOfBirth ? "Enter city of birth" : "Select state first"}
                />
                {showErrors && !cityOfBirth && (
                  <p className="error-text">
                    <AlertCircle className="w-4 h-4" />
                    Please enter city of birth.
                  </p>
                )}
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  Type of Residence *
                </label>
                <Select value={typeOfResidence} onValueChange={(val) => setTypeOfResidence(val)}>
                  <SelectTrigger className={`enterprise-input flex items-center justify-between ${showErrors && !typeOfResidence ? "error" : ""}`}>
                    <SelectValue placeholder="Select residence type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--radius-lg)] border-slate-200 shadow-xl p-2 bg-white">
                    {RESIDENCE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="rounded-[var(--radius)] focus:bg-slate-50 text-sm font-semibold py-2 px-3">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showErrors && !typeOfResidence && (
                  <p className="error-text">
                    <AlertCircle className="w-4 h-4" />
                    Please select type of residence.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
              <label className="form-label">Address *</label>
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
                <label className="form-label">Line 1 *</label>
                <Input
                  value={permanentAddress.line1}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, line1: e.target.value }))}
                  className={`enterprise-input ${showErrors && !permanentAddress.line1 ? "error" : ""}`}
                  placeholder="House/Flat, Building"
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Line 2 *</label>
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
                  className="enterprise-input"
                  placeholder="Area, colony (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Nearest landmark</label>
                <Input
                  value={permanentAddress.nearestLandmark}
                  onChange={(e) => setPermanentAddress((prev) => ({ ...prev, nearestLandmark: e.target.value }))}
                  className="enterprise-input"
                  placeholder="e.g. Near metro station, temple"
                />
              </div>
              <div>
                <label className="form-label">Pincode *</label>
                <Input
                  value={permanentAddress.pincode}
                    onChange={(e) => {
                      const nextPincode = e.target.value;
                      const lookup = getCityStateForPincode(nextPincode);
                      setPermanentAddress((prev) => ({
                        ...prev,
                        pincode: nextPincode,
                        city: lookup?.city || prev.city,
                        state: lookup?.state || prev.state,
                      }));
                    }}
                  className={`enterprise-input ${showErrors && !permanentAddress.pincode ? "error" : ""}`}
                  placeholder="6-digit PIN"
                />
              </div>
                <div>
                  <label className="form-label">City *</label>
                  <Input
                    value={permanentAddress.city}
                    onChange={(e) => setPermanentAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className={`enterprise-input ${showErrors && !permanentAddress.city ? "error" : ""}`}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <Input
                    value={permanentAddress.state}
                    onChange={(e) => setPermanentAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className={`enterprise-input ${showErrors && !permanentAddress.state ? "error" : ""}`}
                    placeholder="State"
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
                  <label className="form-label">Line 1 *</label>
                  <Input
                    value={communicationAddress.line1}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, line1: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.line1 ? "error" : ""}`}
                    placeholder="House/Flat, Building"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Line 2 *</label>
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
                    className="enterprise-input"
                    placeholder="Area, colony (optional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Nearest landmark</label>
                  <Input
                    value={communicationAddress.nearestLandmark}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, nearestLandmark: e.target.value }))}
                    className="enterprise-input"
                    placeholder="e.g. Near metro station, temple"
                  />
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <Input
                    value={communicationAddress.pincode}
                    onChange={(e) => {
                      const nextPincode = e.target.value;
                      const lookup = getCityStateForPincode(nextPincode);
                      setCommunicationAddress((prev) => ({
                        ...prev,
                        pincode: nextPincode,
                        city: lookup?.city || prev.city,
                        state: lookup?.state || prev.state,
                      }));
                    }}
                    className={`enterprise-input ${showErrors && !communicationAddress.pincode ? "error" : ""}`}
                    placeholder="6-digit PIN"
                  />
                </div>
                <div>
                  <label className="form-label">City *</label>
                  <Input
                    value={communicationAddress.city}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.city ? "error" : ""}`}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <Input
                    value={communicationAddress.state}
                    onChange={(e) => setCommunicationAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className={`enterprise-input ${showErrors && !communicationAddress.state ? "error" : ""}`}
                    placeholder="State"
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
