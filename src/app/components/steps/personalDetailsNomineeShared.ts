/** Shared types + helpers for nominee address sync (StepCombinedDetails + StepIncomeAndNominee). */

export type AddressFields = {
  line1: string;
  line2: string;
  line3: string;
  nearestLandmark: string;
  city: string;
  state: string;
  pincode: string;
};

export type NomineeAddressSource = "none" | "communication" | "permanent" | "custom";

export type Nominee = {
  name: string;
  nameLocked: boolean;
  relation: string;
  dob: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressNearestLandmark: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  addressSource: NomineeAddressSource;
  guardianFullName: string;
  guardianDob: string;
  guardianAddressLine1: string;
  guardianAddressLine2: string;
  guardianAddressLine3: string;
  guardianAddressNearestLandmark: string;
  guardianAddressCity: string;
  guardianAddressState: string;
  guardianAddressPincode: string;
};

export const createEmptyNominee = (): Nominee => ({
  name: "",
  nameLocked: false,
  relation: "",
  dob: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  addressNearestLandmark: "",
  addressCity: "",
  addressState: "",
  addressPincode: "",
  addressSource: "communication",
  guardianFullName: "",
  guardianDob: "",
  guardianAddressLine1: "",
  guardianAddressLine2: "",
  guardianAddressLine3: "",
  guardianAddressNearestLandmark: "",
  guardianAddressCity: "",
  guardianAddressState: "",
  guardianAddressPincode: "",
});

export const PINCODE_LOOKUP: Record<string, { city: string; state: string }> = {
  "560102": { city: "Bengaluru", state: "Karnataka" },
  "122003": { city: "Gurugram", state: "Haryana" },
  "122002": { city: "Gurugram", state: "Haryana" },
  "122001": { city: "Gurugram", state: "Haryana" },
  "400069": { city: "Mumbai", state: "Maharashtra" },
  "500084": { city: "Hyderabad", state: "Telangana" },
  "411014": { city: "Pune", state: "Maharashtra" },
  "560038": { city: "Bengaluru", state: "Karnataka" },
  "700091": { city: "Kolkata", state: "West Bengal" },
};

export const getCityStateForPincode = (pincode: string) => {
  const normalized = pincode.trim();
  if (normalized.length !== 6) return null;
  return PINCODE_LOOKUP[normalized] || null;
};

export const formatAddress = (address: AddressFields) => {
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

export const formatNomineeAddressDisplay = (n: {
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressNearestLandmark: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
}) =>
  [
    n.addressLine1,
    n.addressLine2,
    n.addressLine3,
    n.addressNearestLandmark,
    n.addressCity,
    n.addressState,
    n.addressPincode,
  ]
    .filter(Boolean)
    .join(", ");

export const mapAddressFieldsToNominee = (address: AddressFields) => ({
  addressLine1: address.line1,
  addressLine2: address.line2,
  addressLine3: address.line3,
  addressNearestLandmark: address.nearestLandmark,
  addressCity: address.city,
  addressState: address.state,
  addressPincode: address.pincode,
});

export function normalizeNomineeAddressSource(
  raw: NomineeAddressSource | undefined,
  sameAsPermanent: boolean
): NomineeAddressSource {
  if (raw === "permanent") {
    return sameAsPermanent ? "communication" : "custom";
  }
  if (raw === "none") {
    return "communication";
  }
  if (raw === "communication" || raw === "custom") {
    return raw;
  }
  return "communication";
}

export function buildInitialNomineesFromFormData(formData: Record<string, any>): Nominee[] {
  if (Array.isArray(formData.nominees) && formData.nominees.length > 0) {
    return formData.nominees.map((nominee: any) => ({
      ...createEmptyNominee(),
      ...nominee,
      nameLocked: !!nominee?.name,
      guardianAddressLine1: nominee.guardianAddressLine1 || nominee.guardianAddress || "",
      guardianAddressLine2: nominee.guardianAddressLine2 || "",
      guardianAddressLine3: nominee.guardianAddressLine3 || "",
      guardianAddressNearestLandmark: nominee.guardianAddressNearestLandmark || "",
      guardianAddressCity: nominee.guardianAddressCity || "",
      guardianAddressState: nominee.guardianAddressState || "",
      guardianAddressPincode: nominee.guardianAddressPincode || "",
      addressSource: normalizeNomineeAddressSource(
        nominee.addressSource || (nominee.sameAsCommunicationAddress ? "communication" : undefined),
        formData.sameAsPermanentAddress !== false
      ),
    }));
  }
  if (formData.nomineeName || formData.nomineeRelation || formData.nomineeDob || formData.nomineeAddress) {
    return [
      {
        ...createEmptyNominee(),
        name: formData.nomineeName || "",
        nameLocked: !!formData.nomineeName,
        relation: formData.nomineeRelation || "",
        dob: formData.nomineeDob || "",
        addressLine1: formData.nomineeAddressLine1 || formData.nomineeAddress || "",
        addressLine2: formData.nomineeAddressLine2 || "",
        addressLine3: formData.nomineeAddressLine3 || "",
        addressNearestLandmark: formData.nomineeAddressNearestLandmark || "",
        addressCity: formData.nomineeAddressCity || "",
        addressState: formData.nomineeAddressState || "",
        addressPincode: formData.nomineeAddressPincode || "",
        addressSource: normalizeNomineeAddressSource(
          formData.nomineeAddressSource ||
            (formData.nomineeSameAsCommunicationAddress ? "communication" : undefined),
          formData.sameAsPermanentAddress !== false
        ),
      },
    ];
  }
  return [createEmptyNominee()];
}
