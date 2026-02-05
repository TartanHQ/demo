"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, ArrowRight, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const RELATIONSHIPS = [
  { code: 1, value: "Mother" },
  { code: 2, value: "Father" },
  { code: 3, value: "Spouse" },
  { code: 4, value: "Son" },
  { code: 5, value: "Daughter" },
  { code: 6, value: "Other" },
];

export default function StepNomineeInfo() {
  const { nextStep } = useJourney();
  const [maritalStatus] = useState<string>("1"); // From previous step - Single
  const [nomineeName, setNomineeName] = useState(maritalStatus === "1" ? "Jane Doe" : "Spouse Name");
  const [nomineeRelationship, setNomineeRelationship] = useState<string>(maritalStatus === "1" ? "1" : "3");

  useEffect(() => {
    trackEvent('page_viewed', { page: 'nomineeInfo' });
  }, []);

  const handleContinue = () => {
    trackEvent('form_submitted_nominee_info', {
      hasNominee: true,
      relationship: nomineeRelationship
    });
    nextStep();
  };

  return (
    <Card className="w-full max-w-4xl border-none md:border md:shadow-premium md:rounded-3xl mx-auto bg-card/60 backdrop-blur-xl overflow-hidden min-h-[500px] flex flex-col">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-400 to-primary/50" />
      <CardHeader className="space-y-4 pb-8 pt-10 px-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center ring-1 ring-primary/20">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-gradient">Contact Details</CardTitle>
            <CardDescription className="text-lg">
              Nominate a family member for your account security.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-10 pb-10 space-y-10 flex-1">
        <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100/50 flex items-start gap-4">
          <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            Based on your profile, we've pre-filled
            <span className="text-primary font-bold mx-1">Jane Doe (Mother)</span>
            as your nominee. You can keep this or update it to any other family member.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="nomineeName" className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Heart className="w-3 h-3" /> Nominee Full Name *
            </Label>
            <Input
              id="nomineeName"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              placeholder="Enter nominee name"
              required
              className="h-14 bg-white border-none shadow-premium-sm focus:ring-2 focus:ring-primary/20 rounded-2xl px-5 text-lg font-medium"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="nomineeRelationship" className="text-sm font-semibold text-muted-foreground">Relationship *</Label>
            <Select
              value={nomineeRelationship}
              onValueChange={setNomineeRelationship}
            >
              <SelectTrigger id="nomineeRelationship" className="h-14 bg-white border-none shadow-premium-sm focus:ring-2 focus:ring-primary/20 rounded-2xl px-5 text-lg font-medium">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-premium">
                {RELATIONSHIPS.map(item => (
                  <SelectItem key={item.code} value={String(item.code)} className="rounded-xl">
                    {item.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-10 pb-12 pt-0">
        <Button
          variant="primary-cta"
          className="w-full md:w-64 mx-auto h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-full hover:scale-[1.02] transition-all active:scale-[0.98] gap-3"
          onClick={handleContinue}
          disabled={!nomineeName || !nomineeRelationship}
        >
          Proceed to Offers <ArrowRight className="w-5 h-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
