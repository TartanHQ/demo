"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function StepAccountAuth() {
  const { nextStep } = useJourney();
  const [authMethod, setAuthMethod] = useState<"debit" | "netbanking" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Prefilled demo data
  const [debitCardNumber, setDebitCardNumber] = useState("1234567890123456");
  const [cvv, setCvv] = useState("123");
  const [netbankingUserId, setNetbankingUserId] = useState("user123");
  const [netbankingPassword, setNetbankingPassword] = useState("password123");

  useEffect(() => {
    trackEvent('page_viewed', { page: 'accountAuth' });
  }, []);

  const handleDebitCardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    trackEvent('account_auth_initiated', { method: 'debit_card' });

    // Simulate API call
    setTimeout(() => {
      trackEvent('account_auth_completed', { method: 'debit_card' });
      setIsLoading(false);
      nextStep();
    }, 1500);
  };

  const handleNetbankingAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    trackEvent('account_auth_initiated', { method: 'netbanking' });

    // Simulate API call
    setTimeout(() => {
      trackEvent('account_auth_completed', { method: 'netbanking' });
      setIsLoading(false);
      nextStep();
    }, 1500);
  };

  return (
    <Card className="w-full max-w-2xl border-none md:border md:shadow-professional md:rounded-xl mx-auto bg-card min-h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-text-darkest text-2xl font-bold">Authenticate Your Account</CardTitle>
        <CardDescription className="text-base">
          Please authenticate using one of the following methods to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        {!authMethod ? (
          <>
            <Button
              variant="outline"
              className="w-full h-20 text-lg flex justify-start items-center p-6"
              onClick={() => setAuthMethod("debit")}
            >
              <CreditCard className="w-6 h-6 mr-4" />
              <div className="text-left">
                <p>Debit Card</p>
                <p className="text-sm font-normal text-text-gray-1">Authenticate using your debit card</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-20 text-lg flex justify-start items-center p-6"
              onClick={() => setAuthMethod("netbanking")}
            >
              <Lock className="w-6 h-6 mr-4" />
              <div className="text-left">
                <p>Net Banking</p>
                <p className="text-sm font-normal text-text-gray-1">Authenticate using your net banking credentials</p>
              </div>
            </Button>
          </>
        ) : authMethod === "debit" ? (
          <form onSubmit={handleDebitCardAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="debitCard">Debit Card Number</Label>
              <Input
                id="debitCard"
                type="text"
                value={debitCardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setDebitCardNumber(value);
                }}
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength={19}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                maxLength={3}
                placeholder="XXX"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                  setCvv(value);
                }}
                required
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAuthMethod(null)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary-cta"
                className="flex-1"
                disabled={isLoading || !debitCardNumber}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleNetbankingAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="netbankingUserId">Net Banking User ID</Label>
              <Input
                id="netbankingUserId"
                type="text"
                value={netbankingUserId}
                onChange={(e) => setNetbankingUserId(e.target.value)}
                placeholder="Enter your user ID"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="netbankingPassword">Password</Label>
              <Input
                id="netbankingPassword"
                type="password"
                placeholder="Enter your password"
                value={netbankingPassword}
                onChange={(e) => setNetbankingPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setAuthMethod(null)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary-cta"
                className="flex-1"
                disabled={isLoading || !netbankingUserId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Authenticate"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
