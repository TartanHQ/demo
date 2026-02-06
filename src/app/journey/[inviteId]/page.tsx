"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AgentLayout from "@/app/components/layout/AgentLayout";
import JourneyStepWrapper from "@/app/components/JourneyStepWrapper";
import { STEP_COMPONENTS } from "@/app/context/stepDefinitions";
import { useJourney } from "@/app/context/JourneyContext";
import StepError from "@/app/components/steps/StepError";
import { AnimatePresence } from "framer-motion";
import { parseInviteToken } from "@/lib/inviteToken";

type InviteApiResponse = {
  id: string;
  journeyType: "ntb" | "ntb-conversion" | "etb-nk" | "etb";
  employee: { id: string; name: string; email: string; phone?: string };
  prefilledData: Record<string, unknown>;
  status: "sent" | "opened" | "started" | "completed";
};

export default function JourneyInvitePage() {
  const router = useRouter();
  const params = useParams<{ inviteId: string }>();
  const inviteId = useMemo(() => params.inviteId, [params.inviteId]);

  const {
    journeySteps,
    currentStepIndex,
    currentBranchComponent,
    startJourney,
  } = useJourney();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ title: string; message: string } | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inviteId || startedRef.current) return;

    const controller = new AbortController();

    async function boot() {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Stateless token (Vercel-safe): decode locally and start journey without API.
        const tokenPayload = parseInviteToken(inviteId);
        if (tokenPayload) {
          startedRef.current = true;
          startJourney(tokenPayload.journeyType, {
            inviteId: tokenPayload.id,
            employeeId: tokenPayload.employee.id,
            name: tokenPayload.employee.name,
            email: tokenPayload.employee.email,
            mobileNumber: tokenPayload.employee.phone,
            ...(tokenPayload.prefilledData || {}),
          });
          return;
        }

        // Backward-compatible path: legacy UUID invite stored in API memory (local dev only).
        const res = await fetch(`/api/invites/${encodeURIComponent(inviteId)}`, {
          method: "GET",
          signal: controller.signal,
          headers: { "Accept": "application/json" },
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error || "Unable to load invite details.");
        }

        const invite = (await res.json()) as InviteApiResponse;

        // Initialize journey with prefilled data
        startedRef.current = true;
        startJourney(invite.journeyType, {
          inviteId: invite.id,
          employeeId: invite.employee.id,
          name: invite.employee.name,
          email: invite.employee.email,
          mobileNumber: invite.employee.phone,
          ...(invite.prefilledData || {}),
        });

        // Best-effort mark as started (non-blocking)
        fetch(`/api/invites/${encodeURIComponent(inviteId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "started" }),
        }).catch(() => {});
      } catch (e) {
        if (controller.signal.aborted) return;
        const message = e instanceof Error ? e.message : "Unable to start the journey.";
        setLoadError({
          title: "We couldn't open this journey link",
          message,
        });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void boot();

    return () => controller.abort();
  }, [inviteId, startJourney]);

  const BranchComponent = currentBranchComponent;

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <AgentLayout>
          <div className="max-w-7xl mx-auto py-4 lg:py-8">
            <StepError
              title={loadError.title}
              message={loadError.message}
              onBackToHome={() => router.push("/")}
            />
          </div>
        </AgentLayout>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <AgentLayout>
          <div className="max-w-7xl mx-auto py-10 lg:py-16">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10 text-center">
              <p className="text-slate-600 font-semibold">Preparing your secure account opening journey…</p>
            </div>
          </div>
        </AgentLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AgentLayout>
        <div className="max-w-7xl mx-auto py-4 lg:py-8">
          <AnimatePresence mode="wait">
            <JourneyStepWrapper
              key={BranchComponent ? "branch" : journeySteps[currentStepIndex]?.id || "current"}
            >
              {BranchComponent ? (
                <BranchComponent />
              ) : (
                journeySteps[currentStepIndex]
                  ? React.createElement(STEP_COMPONENTS[journeySteps[currentStepIndex].id])
                  : null
              )}
            </JourneyStepWrapper>
          </AnimatePresence>
        </div>
      </AgentLayout>
    </div>
  );
}

