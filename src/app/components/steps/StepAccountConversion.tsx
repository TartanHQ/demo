"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Globe, Eye, EyeOff, Info, BadgeCheck, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import AgentMessage from "@/app/components/chat/AgentMessage";
import UserResponse from "@/app/components/chat/UserResponse";

export default function StepAccountConversion() {
    const { nextStep, currentStepIndex, journeySteps } = useJourney();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("debit-card");
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Form States
    const [last4Digits, setLast4Digits] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [pin, setPin] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [netBankingPassword, setNetBankingPassword] = useState("");

    const myIndex = journeySteps.findIndex(s => s.id === "account-conversion");
    const isHistory = myIndex !== -1 && myIndex < currentStepIndex;
    const isActive = myIndex === currentStepIndex;

    useEffect(() => {
        if (isActive) trackEvent('page_viewed', { page: 'account_conversion_verification' });
    }, [isActive]);

    const handleVerify = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsRedirecting(true);
            setTimeout(() => {
                nextStep();
            }, 1200);
        }, 1500);
    };

    if (isHistory) {
        return (
            <div className="space-y-6">
                <AgentMessage isNew={false}>
                    Account verified successfully! I've linked your existing HDFC portfolio to your new Priority Salary benefits.
                </AgentMessage>
                <UserResponse isNew={false}>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-sm">Account Linkage Verified</span>
                            <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Linked</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">Via {activeTab === "debit-card" ? "Debit Card" : "Net Banking"}</p>
                    </div>
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                        <BadgeCheck className="w-3 h-3" />
                    </span>
                </UserResponse>
            </div>
        );
    }

    if (!isActive) return null;

    return (
        <div className="space-y-6 w-full animate-in slide-in-from-bottom-8 duration-700">
            <AgentMessage>
                Let's secure your connection! 🛡️ Please verify your existing HDFC account to unlock direct conversion benefits and skip redundant documentation.
            </AgentMessage>

            <div className="pl-14 space-y-10">
                <div className="bg-white rounded-[40px] shadow-premium-lg border border-slate-50 overflow-hidden">
                    {/* HDFC Verification Header */}
                    <div className="bg-slate-900 px-10 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">HDFC Secure Login</h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Expires in <span className="text-blue-400">04:59</span></p>
                        </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-12">
                        {/* Tab Switcher */}
                        <div className="flex gap-8 border-b border-slate-50">
                            <button
                                onClick={() => setActiveTab("debit-card")}
                                className={cn(
                                    "pb-4 font-black text-sm uppercase tracking-widest transition-all relative",
                                    activeTab === "debit-card" ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
                                )}
                            >
                                Debit Card
                                {activeTab === "debit-card" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab("net-banking")}
                                className={cn(
                                    "pb-4 font-black text-sm uppercase tracking-widest transition-all relative",
                                    activeTab === "net-banking" ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
                                )}
                            >
                                Net Banking
                                {activeTab === "net-banking" && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full" />}
                            </button>
                        </div>

                        {/* Note */}
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-black text-blue-700 uppercase leading-relaxed max-w-lg">
                                This is a secure verification step. No funds will be debited. Your credentials are encrypted and never stored.
                            </p>
                        </div>

                        {/* Forms */}
                        <div className="min-h-[200px]">
                            {activeTab === "debit-card" ? (
                                <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Last 4 Digits</Label>
                                            <div className="flex gap-2">
                                                <div className="h-14 flex-1 bg-slate-50 rounded-xl border border-transparent flex items-center justify-center text-slate-300 font-black tracking-widest">XXXX</div>
                                                <Input
                                                    maxLength={4}
                                                    className="h-14 flex-1 font-black text-xl text-center bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                                                    placeholder="1234"
                                                    value={last4Digits}
                                                    onChange={(e) => setLast4Digits(e.target.value.replace(/\D/g, ''))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</Label>
                                            <Input
                                                placeholder="MM / YY"
                                                className="h-14 font-black text-xl bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                                                value={expiryDate}
                                                maxLength={5}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                                    setExpiryDate(v);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-w-xs">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">ATM PIN</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                maxLength={4}
                                                className="h-14 font-black text-2xl tracking-[0.5em] bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                                                placeholder="••••"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-md">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Customer ID</Label>
                                        <Input
                                            className="h-14 font-black text-xl bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                                            placeholder="Enter ID"
                                            value={customerId}
                                            onChange={(e) => setCustomerId(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Password (IPIN)</Label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                className="h-14 font-black text-xl bg-slate-50/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all"
                                                placeholder="••••••••"
                                                value={netBankingPassword}
                                                onChange={(e) => setNetBankingPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Encrypted ISO-8583 Channel
                            </p>
                        </div>
                        <Button
                            onClick={handleVerify}
                            disabled={isLoading || isRedirecting}
                            className="h-14 w-full md:w-auto px-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black shadow-xl shadow-slate-900/20 text-lg transition-all hover:scale-105 active:scale-95"
                        >
                            {isLoading || isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <div className="flex items-center gap-2">
                                    Secure Verify <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
