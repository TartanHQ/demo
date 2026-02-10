/* src/app/context/stepDefinitions.ts */

import StepWelcome from "@/app/components/steps/StepWelcome";
import StepJourneySelection from "@/app/components/steps/StepJourneySelection";
import StepCombinedDetails from "@/app/components/steps/StepCombinedDetails";
import StepKycChoice from "@/app/components/steps/StepKycChoice";
import StepContactDetails from "@/app/components/steps/StepContactDetails";
import StepKycDetails from "@/app/components/steps/StepKycDetails";
import StepComplete from "@/app/components/steps/StepComplete";
import StepVideoKyc from "@/app/components/steps/StepVideoKyc";
import StepEkycHandler from "@/app/components/steps/StepEkycHandler";
import StepPhysicalKyc from "@/app/components/steps/StepPhysicalKyc";
import StepAccountConversion from "@/app/components/steps/StepAccountConversion";
import StepProfessionalDetailsExpress from "@/app/components/steps/StepProfessionalDetailsExpress";
import StepReviewApplication from "@/app/components/steps/StepReviewApplication";
import StepIncomeDetails from "@/app/components/steps/StepIncomeDetails";
import StepNomineeDetails from "@/app/components/steps/StepNomineeDetails";
import StepAutoConversion from "@/app/components/steps/StepAutoConversion";
import StepConversionVerification from "@/app/components/steps/StepConversionVerification";
import StepEtbIncomeDeclarations from "@/app/components/steps/StepEtbIncomeDeclarations";
import StepEtbWelcome from "@/app/components/steps/StepEtbWelcome";
import StepEtbNkWelcome from "@/app/components/steps/StepEtbNkWelcome";
import StepNtbConversionWelcome from "@/app/components/steps/StepNtbConversionWelcome";
import StepEtbNkKycChoice from "@/app/components/steps/StepEtbNkKycChoice";
import StepNtbConversionKycChoice from "@/app/components/steps/StepNtbConversionKycChoice";
import StepEtbComplete from "@/app/components/steps/StepEtbComplete";
import StepEtbNkComplete from "@/app/components/steps/StepEtbNkComplete";
import StepNtbConversionComplete from "@/app/components/steps/StepNtbConversionComplete";
import StepEtbNkPhysicalKyc from "@/app/components/steps/StepEtbNkPhysicalKyc";
import StepNtbConversionPhysicalKyc from "@/app/components/steps/StepNtbConversionPhysicalKyc";
import StepEtbNkEkycHandler from "@/app/components/steps/StepEtbNkEkycHandler";
import StepEtbNkIncomeDeclarations from "@/app/components/steps/StepEtbNkIncomeDeclarations";
import StepEtbNkConversionVerification from "@/app/components/steps/StepEtbNkConversionVerification";
import StepNtbConversionProfileDetails from "@/app/components/steps/StepNtbConversionProfileDetails";
import StepNtbConversionReviewApplication from "@/app/components/steps/StepNtbConversionReviewApplication";

export type UserType = "ntb" | "etb-nk" | "etb";
export type JourneyType = "ntb" | "ntb-conversion" | "etb-nk" | "etb";

export interface Step {
  id: string;
  title: string;
}

export const makeJourneyStepId = (journeyType: JourneyType, baseId: string) =>
  `${journeyType}:${baseId}`;

const BASE_STEP_TITLES: Record<string, string> = {
  welcome: "Verification",
  kycChoice: "Select KYC",
  ekycHandler: "e-KYC Verification",
  physicalKyc: "Physical KYC",
  profileDetails: "YOUR",
  autoConversion: "Account Conversion",
  conversionVerification: "Verification",
  incomeDetails: "Income & Account",
  etbIncomeDeclarations: "Income & Declarations",
  nomineeDetails: "Nominee Details",
  reviewApplication: "Final Verification",
  kycDetails: "VKYC Consent",
  videoKyc: "Video KYC",
  accountConversion: "Verify Details",
  professionalDetailsExpress: "YOUR",
  complete: "Submitted",
};

const addJourneySteps = (journeyType: JourneyType, stepIds: string[]) => {
  const entries: Record<string, Step> = {};
  stepIds.forEach((baseId) => {
    entries[makeJourneyStepId(journeyType, baseId)] = {
      id: makeJourneyStepId(journeyType, baseId),
      title: BASE_STEP_TITLES[baseId] || baseId,
    };
  });
  return entries;
};

export const ALL_STEPS: Record<string, Step> = {
  journeySelection: { id: "journeySelection", title: "Select Journey" },
  ...addJourneySteps("ntb", [
    "welcome",
    "ekycHandler",
    "profileDetails",
    "nomineeDetails",
    "incomeDetails",
    "reviewApplication",
    "complete",
  ]),
  ...addJourneySteps("ntb-conversion", [
    "welcome",
    "profileDetails",
    "kycChoice",
    "ekycHandler",
    "physicalKyc",
    "reviewApplication",
    "complete",
  ]),
  ...addJourneySteps("etb-nk", [
    "welcome",
    "kycChoice",
    "ekycHandler",
    "physicalKyc",
    "etbIncomeDeclarations",
    "conversionVerification",
    "complete",
  ]),
  ...addJourneySteps("etb", [
    "welcome",
    "autoConversion",
    "complete",
  ]),
  contactDetails: { id: "contactDetails", title: "YOUR" },
  kycDetails: { id: "kycDetails", title: "VKYC Consent" },
  videoKyc: { id: "videoKyc", title: "Video KYC" },
  accountConversion: { id: "accountConversion", title: "Verify Details" },
  professionalDetailsExpress: { id: "professionalDetailsExpress", title: "YOUR" },
};

export const STEP_COMPONENTS: Record<string, React.ComponentType> = {
  journeySelection: StepJourneySelection,
  contactDetails: StepContactDetails,
  kycDetails: StepKycDetails,
  videoKyc: StepVideoKyc,
  accountConversion: StepAccountConversion,
  professionalDetailsExpress: StepProfessionalDetailsExpress,

  [makeJourneyStepId("ntb", "welcome")]: StepWelcome,
  [makeJourneyStepId("ntb", "ekycHandler")]: StepEkycHandler,
  [makeJourneyStepId("ntb", "profileDetails")]: StepCombinedDetails,
  [makeJourneyStepId("ntb", "nomineeDetails")]: StepNomineeDetails,
  [makeJourneyStepId("ntb", "incomeDetails")]: StepIncomeDetails,
  [makeJourneyStepId("ntb", "reviewApplication")]: StepReviewApplication,
  [makeJourneyStepId("ntb", "complete")]: StepComplete,

  [makeJourneyStepId("ntb-conversion", "welcome")]: StepNtbConversionWelcome,
  [makeJourneyStepId("ntb-conversion", "profileDetails")]:
    StepNtbConversionProfileDetails,
  [makeJourneyStepId("ntb-conversion", "kycChoice")]:
    StepNtbConversionKycChoice,
  [makeJourneyStepId("ntb-conversion", "ekycHandler")]: StepEkycHandler,
  [makeJourneyStepId("ntb-conversion", "physicalKyc")]:
    StepNtbConversionPhysicalKyc,
  [makeJourneyStepId("ntb-conversion", "reviewApplication")]:
    StepNtbConversionReviewApplication,
  [makeJourneyStepId("ntb-conversion", "complete")]:
    StepNtbConversionComplete,

  [makeJourneyStepId("etb-nk", "welcome")]: StepEtbNkWelcome,
  [makeJourneyStepId("etb-nk", "kycChoice")]: StepEtbNkKycChoice,
  [makeJourneyStepId("etb-nk", "ekycHandler")]: StepEtbNkEkycHandler,
  [makeJourneyStepId("etb-nk", "physicalKyc")]: StepEtbNkPhysicalKyc,
  [makeJourneyStepId("etb-nk", "etbIncomeDeclarations")]:
    StepEtbNkIncomeDeclarations,
  [makeJourneyStepId("etb-nk", "conversionVerification")]:
    StepEtbNkConversionVerification,
  [makeJourneyStepId("etb-nk", "complete")]: StepEtbNkComplete,

  [makeJourneyStepId("etb", "welcome")]: StepEtbWelcome,
  [makeJourneyStepId("etb", "autoConversion")]: StepAutoConversion,
  [makeJourneyStepId("etb", "etbIncomeDeclarations")]:
    StepEtbIncomeDeclarations,
  [makeJourneyStepId("etb", "conversionVerification")]:
    StepConversionVerification,
  [makeJourneyStepId("etb", "complete")]: StepEtbComplete,
};