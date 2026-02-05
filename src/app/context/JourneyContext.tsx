/* src/app/context/JourneyContext.tsx */

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { ALL_STEPS, STEP_COMPONENTS } from "./stepDefinitions";
import type { Step, UserType, JourneyType } from "./stepDefinitions";


// --- 1. Types ---
export interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: string;
}

interface JourneyState {
  userType: UserType;
  journeyType: JourneyType | null;
  currentStepIndex: number;
  journeySteps: Step[];
  CurrentStepComponent: React.ComponentType;
  currentBranchComponent: React.ComponentType | null;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: string) => void;
  setUserType: (type: UserType) => void;
  setJourneyType: (type: JourneyType) => void;
  setNomineeEnabled: (enabled: boolean) => void;
  switchToPhysicalKycFlow: () => void;
  switchToDigitalKycFlow: () => void;
  bottomBarContent: React.ReactNode | null;
  setBottomBarContent: (content: React.ReactNode | null) => void;
  resetJourney: () => void;
  notifications: Notification[];
  addNotification: (title: string, body: string) => void;
  clearNotifications: () => void;
  formData: Record<string, any>;
  prefilledData: Record<string, any>;
  baselineData: Record<string, any>;
  changedFields: string[];
  updateFormData: (data: Record<string, any>) => void;
  isResumeFlow: boolean;
  chatMessages: ChatMessage[];
  sendMessage: (content: string) => void;
  showDashboard: boolean;
  setShowDashboard: (show: boolean) => void;
  error: { title: string; message: string; module?: string } | null;
  setError: (error: { title: string; message: string; module?: string } | null) => void;
  startJourney: (type: JourneyType, prefilledData?: Record<string, any>, startStepId?: string) => void;
}

// --- 2. Journey Logic ---
const getInitialStepsForJourney = (journeyType: JourneyType): Step[] => {
  let stepIds: string[] = [];

  switch (journeyType) {
    case "ntb": // New to Bank (Optimized Full Flow)
      // KYC choice is mandatory; nominee step becomes conditional.
      stepIds = ["welcome", "kycChoice", "ekycHandler", "profileDetails", "reviewApplication", "videoKyc", "complete"];
      break;
    case "ntb-conversion": // NTB flow after auto-conversion (no OTP, no eKYC, no Video KYC)
      stepIds = ["welcome", "kycChoice", "profileDetails", "reviewApplication", "complete"];
      break;
    case "etb-nk": // Existing to Bank - With KYC
      // ETB with KYC: Replace e-KYC step with verification, keep rest unchanged.
      stepIds = ["welcome", "kycChoice", "conversionVerification", "etbKycProfile", "complete"];
      break;
    case "etb-ak": // Existing to Bank - Aadhaar KYC
      // ETB with AKYC: Same as ETB with KYC but uses e-KYC step.
      stepIds = ["welcome", "kycChoice", "ekycHandler", "etbKycProfile", "complete"];
      break;
    case "etb": // Express Flow
      // ETB Auto Conversion: KYC already complete. Only consent to convert Savings → Salary, then done.
      stepIds = ["welcome", "autoConversion", "etbKycProfile", "conversionVerification", "complete"];
      break;
  }

  return stepIds.map(id => ALL_STEPS[id]).filter(Boolean);
};

const getInitialStepsForUserType = (userType: UserType): Step[] => {
  return getInitialStepsForJourney("ntb");
};

// --- 3. Context & Provider ---
const JourneyContext = createContext<JourneyState | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const LOCAL_STORAGE_PREFIX = "hdfcJourney_";

export const JourneyProvider = ({ children }: { children: ReactNode }) => {
  const [userType, _setUserType] = useState<UserType>("ntb");
  const [journeyType, _setJourneyType] = useState<JourneyType | null>(null);
  const [currentStepIndex, _setCurrentStepIndex] = useState(0);
  const [journeySteps, _setJourneySteps] = useState<Step[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [currentBranchComponent, _setCurrentBranchComponent] = useState<React.ComponentType | null>(null);
  const [bottomBarContent, setBottomBarContent] = useState<React.ReactNode | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "initial",
      title: "HDFC Bank",
      body: "Welcome! Start your premium salary account journey now.",
      timestamp: "Just now"
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback((content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    // Simple simulated agent response
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: `I've received your message: "${content}". How else can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMsg]);
    }, 1000);
  }, []);

  const addNotification = useCallback((title: string, body: string) => {
    const newNotif = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: "Just now"
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const [formData, _setFormData] = useState<Record<string, any>>({
    mobileNumber: "9934090013",
    dob: "1990-05-15",
    pan: "ABCDE1234F",
    email: "sachin.bansal72@gmail.com",
    fatherName: "S. K. Bansal",
    motherName: "Anita Bansal",
    maritalStatus: "married",
    permanentAddressLine1: "123, Green Park",
    permanentAddressLine2: "Block C, New Delhi",
    permanentAddressLine3: "Near City Mall",
    permanentAddressCity: "New Delhi",
    permanentAddressState: "Delhi",
    permanentAddressPincode: "110016",
    sameAsPermanentAddress: true,
    incomeRange: "10-15L",
    usesPrimaryEmailForComms: true,
    communicationEmail: "",
    wantsNominee: false,
    nominees: [],

    // Regulatory declarations (mandatory)
    isPep: false,
    isIndianNational: true,
    isTaxResidentIndiaOnly: true,

    // Consents (mandatory where applicable)
    ekycUidaiConsent: false,
    vkycConsent: false,
    vkycPresentInIndia: false,

    // Auto conversion
    autoConvertConsent: null,
    autoConvertStatus: "idle",
  });
  const [prefilledData, setPrefilledData] = useState<Record<string, any>>({});
  const [baselineData, setBaselineData] = useState<Record<string, any>>({});
  const [changedFields, setChangedFields] = useState<string[]>([]);

  const areValuesEqual = useCallback((a: any, b: any) => {
    if (typeof a === "object" || typeof b === "object") {
      try {
        return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
      } catch {
        return false;
      }
    }
    return a === b;
  }, []);

  const updateFormData = useCallback((newData: Record<string, any>) => {
    _setFormData(prev => {
      const updated = { ...prev, ...newData };
      setChangedFields(prevChanged => {
        const next = new Set(prevChanged);
        Object.keys(newData).forEach((key) => {
          if (areValuesEqual(updated[key], baselineData[key])) {
            next.delete(key);
          } else {
            next.add(key);
          }
        });
        const list = Array.from(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${LOCAL_STORAGE_PREFIX}changedFields`, JSON.stringify(list));
        }
        return list;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}formData`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [areValuesEqual, baselineData]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isResumeFlow, setIsResumeFlow] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // --- State-setting functions ---
  const setJourneySteps = useCallback((steps: Step[]) => {
    _setJourneySteps(steps);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}journeySteps`, JSON.stringify(steps));
    }
  }, []);

  const setStepIndex = useCallback((index: number) => {
    _setCurrentStepIndex(index);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}stepIndex`, index.toString());
    }
  }, []);

  // --- THIS IS THE FIX ---
  // We MUST wrap the `component` in a function `() => component`
  // to prevent React from executing it.
  const setBranchComponent = useCallback((component: React.ComponentType | null) => {
    _setCurrentBranchComponent(() => component); // <-- THIS LINE IS THE FIX

    if (typeof window !== 'undefined') {
      const stepId = Object.keys(STEP_COMPONENTS).find(key => STEP_COMPONENTS[key] === component);
      if (stepId) {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}branchStepId`, stepId);
      } else {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}branchStepId`);
      }
    }
  }, []);

  // Nominee is captured inline within Personal Details (no separate step).
  const setNomineeEnabled = useCallback((enabled: boolean) => {
    updateFormData({ wantsNominee: enabled });
  }, [updateFormData]);

  const switchToPhysicalKycFlow = useCallback(() => {
    if (!journeyType) return;
    // Physical KYC ends the journey immediately on the KYC selection step.
    // We truncate the journey to the steps completed so far.
    const steps = ["welcome", "kycChoice", "physicalKyc"]
      .map(id => ALL_STEPS[id])
      .filter(Boolean);
    setJourneySteps(steps);
    setStepIndex(Math.max(0, steps.length - 1));
    setBranchComponent(null);
  }, [journeyType, setJourneySteps, setStepIndex, setBranchComponent]);

  const switchToDigitalKycFlow = useCallback(() => {
    if (!journeyType) return;
    const base = getInitialStepsForJourney(journeyType);
    setJourneySteps(base);
    // After KYC choice, proceed to next logical step (ekycHandler or profileDetails depending on journey)
    const kycIndex = base.findIndex(s => s.id === "kycChoice");
    setStepIndex(kycIndex !== -1 ? kycIndex + 1 : 0);
    setBranchComponent(null);
  }, [journeyType, setJourneySteps, setStepIndex, setBranchComponent]);

  const setUserType = useCallback((type: UserType) => {
    _setUserType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}userType`, type);
    }
    const newSteps = getInitialStepsForUserType(type);
    setJourneySteps(newSteps);
    setStepIndex(0);
    setBranchComponent(null); // Reset branch
  }, [setJourneySteps, setStepIndex, setBranchComponent]);

  const setJourneyType = useCallback((type: JourneyType) => {
    // Only update and reset if the journey type is actually changing
    // or if we haven't selected one yet.
    if (journeyType === type) {
      return;
    }

    _setJourneyType(type);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}journeyType`, type);
    }
    const newSteps = getInitialStepsForJourney(type);
    setJourneySteps(newSteps);
    setStepIndex(0);
    setBranchComponent(null);
  }, [journeyType, setJourneySteps, setStepIndex, setBranchComponent]);

  const resetJourney = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}userType`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}journeyType`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}stepIndex`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}journeySteps`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}branchStepId`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}formData`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}prefilledData`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}baselineData`);
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}changedFields`);
    }
    _setUserType("ntb");
    _setJourneyType("ntb");
    _setFormData({});
    setPrefilledData({});
    setBaselineData({});
    setChangedFields([]);
    const newSteps = getInitialStepsForJourney("ntb");
    _setJourneySteps(newSteps);
    _setCurrentStepIndex(0);
    setBranchComponent(null); // Reset branch
    setBottomBarContent(null);
  }, [setBranchComponent]);

  // --- Inactivity Timer Logic ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(resetJourney, INACTIVITY_TIMEOUT_MS);
  }, [resetJourney]);

  useEffect(() => {
    if (!isInitialized) return;
    const events = ["mousemove", "keydown", "click", "touchstart"];
    const handleActivity = () => resetInactivityTimer();
    events.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isInitialized, resetInactivityTimer]);

  // --- Session Resume Logic ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const isResumeUrl = params.get('resume') === 'true';
        if (isResumeUrl) setIsResumeFlow(true);

        const savedUserType = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}userType`) as UserType | null;
        const savedJourneyType = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}journeyType`) as JourneyType | null;
        const savedStepIndex = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stepIndex`);
        const savedJourneySteps = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}journeySteps`);
        const savedBranchStepId = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}branchStepId`);
        const savedFormData = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}formData`);
        const savedPrefilledData = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}prefilledData`);
        const savedBaselineData = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}baselineData`);
        const savedChangedFields = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}changedFields`);

        if (savedUserType && savedStepIndex !== null && savedJourneySteps) {
          const rawSteps = JSON.parse(savedJourneySteps) as Step[];
          // Migration: remove the old VCIP consent step if present.
          let parsedSteps = rawSteps.filter((s) => s?.id !== "kycDetails" && s?.id !== "nomineeDetails");
          const parsedIndex = parseInt(savedStepIndex, 10);

          if (parsedSteps.length > 0 && parsedIndex < parsedSteps.length) {
            _setUserType(savedUserType);
            if (savedJourneyType) _setJourneyType(savedJourneyType);

            // Migration: ensure ETB matches latest flow.
            let upgradedIndex: number | null = null;
            if (savedJourneyType === "etb") {
              const upgraded = getInitialStepsForJourney("etb");
              const needsUpgrade =
                !parsedSteps.some((step) => step.id === "conversionVerification") ||
                parsedSteps.some((step) => step.id === "reviewApplication") ||
                !parsedSteps.some((step) => step.id === "etbKycProfile");
              if (needsUpgrade) {
                const currentId = parsedSteps[parsedIndex]?.id;
                upgradedIndex = currentId ? upgraded.findIndex((step) => step.id === currentId) : -1;
                parsedSteps = upgraded;
              }
            }
            _setJourneySteps(parsedSteps);
            // Keep localStorage in sync after migration.
            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}journeySteps`, JSON.stringify(parsedSteps));
            if (savedFormData) {
              const parsedForm = JSON.parse(savedFormData);
              _setFormData(parsedForm);
              if (savedBaselineData) {
                setBaselineData(JSON.parse(savedBaselineData));
              } else {
                setBaselineData(parsedForm);
              }
            }
            if (savedPrefilledData) {
              setPrefilledData(JSON.parse(savedPrefilledData));
            } else {
              setPrefilledData({});
            }
            if (savedChangedFields) {
              setChangedFields(JSON.parse(savedChangedFields));
            } else {
              setChangedFields([]);
            }

            // If it's a resume URL, we force them to verify OTP first (index 0)
            if (isResumeUrl) {
              _setCurrentStepIndex(0);
            } else if (typeof upgradedIndex === "number" && upgradedIndex >= 0) {
              _setCurrentStepIndex(upgradedIndex);
            } else {
              _setCurrentStepIndex(Math.min(parsedIndex, Math.max(0, parsedSteps.length - 1)));
            }

            if (savedBranchStepId && STEP_COMPONENTS[savedBranchStepId]) {
              setBranchComponent(STEP_COMPONENTS[savedBranchStepId]);
            }
          } else {
            resetJourney();
          }
        } else {
          // If no saved session, ensure we are in a clean NTB state
          _setJourneyType("ntb");
          _setJourneySteps(getInitialStepsForJourney("ntb"));
          setPrefilledData({});
          setBaselineData({});
          setChangedFields([]);
        }
      } catch (error) {
        resetJourney();
      }
      setIsInitialized(true);
    }
  }, [resetJourney, setBranchComponent]);

  // --- Navigation Functions ---
  const nextStep = useCallback(() => {
    setBranchComponent(null); // Go back to main flow
    setBottomBarContent(null);

    // Check if we are in a resume flow at the first step
    const params = new URLSearchParams(window.location.search);
    const isResumeUrl = params.get('resume') === 'true';
    const savedStepIndex = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}stepIndex`);

    if (isResumeUrl && currentStepIndex === 0 && savedStepIndex) {
      const targetIndex = parseInt(savedStepIndex, 10);
      if (targetIndex > 0 && targetIndex < journeySteps.length) {
        setStepIndex(targetIndex);
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('resume');
        window.history.replaceState({}, '', url);
        return;
      }
    }

    if (currentStepIndex < journeySteps.length - 1) {
      setStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, journeySteps.length, setBranchComponent, setStepIndex]);

  const prevStep = useCallback(() => {
    setBranchComponent(null); // Go back to main flow
    setBottomBarContent(null);
    if (currentStepIndex > 0) {
      setStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setBranchComponent, setStepIndex]);

  const goToStep = useCallback((stepId: string) => {
    const newComponent = STEP_COMPONENTS[stepId];
    if (!newComponent) {
      console.error(`Step "${stepId}" not found!`);
      return;
    }

    const mainJourneyIndex = journeySteps.findIndex(s => s.id === stepId);
    if (mainJourneyIndex !== -1) {
      setBranchComponent(null);
      setStepIndex(mainJourneyIndex);
    } else {
      setBranchComponent(newComponent);
    }
    setBottomBarContent(null);
  }, [journeySteps, setBranchComponent, setStepIndex]);

  const startJourney = useCallback((type: JourneyType, prefilled?: Record<string, any>, startStepId?: string) => {
    _setJourneyType(type);
    const newSteps = getInitialStepsForJourney(type);
    setJourneySteps(newSteps);
    const startIndex = startStepId ? newSteps.findIndex((step) => step.id === startStepId) : -1;
    setStepIndex(startIndex >= 0 ? startIndex : 0);
    setBranchComponent(null);
    const merged = { ...formData, ...(prefilled || {}) };
    _setFormData(merged);
    setBaselineData(merged);
    setChangedFields([]);
    setPrefilledData(prefilled || {});
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}formData`, JSON.stringify(merged));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}baselineData`, JSON.stringify(merged));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}changedFields`, JSON.stringify([]));
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}prefilledData`, JSON.stringify(prefilled || {}));
    }
    setShowDashboard(false);
    setError(null);
    setBottomBarContent(null);
  }, [formData, setJourneySteps, setStepIndex, setBranchComponent]);

  const CurrentStepComponent = journeySteps[currentStepIndex]
    ? STEP_COMPONENTS[journeySteps[currentStepIndex].id]
    : () => null;

  if (!isInitialized) return null;

  return (
    <JourneyContext.Provider
      value={{
        userType,
        journeyType,
        currentStepIndex,
        journeySteps,
        CurrentStepComponent,
        currentBranchComponent,
        nextStep,
        prevStep,
        goToStep,
        setUserType,
        setJourneyType,
        setNomineeEnabled,
        switchToPhysicalKycFlow,
        switchToDigitalKycFlow,
        bottomBarContent,
        setBottomBarContent,
        resetJourney,
        addNotification,
        clearNotifications,
        notifications,
        formData,
        prefilledData,
        baselineData,
        changedFields,
        updateFormData,
        isResumeFlow,
        chatMessages,
        sendMessage,
        showDashboard,
        setShowDashboard,
        error,
        setError,
        startJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

// --- 6. Hook ---
export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
};