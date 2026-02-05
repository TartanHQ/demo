"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Smartphone, MessageSquare, Minimize2, Bell, Send, Wifi, Battery, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileMockDrawer() {
  const { notifications, journeySteps, currentStepIndex, addNotification, clearNotifications } = useJourney();
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeNudge, setActiveNudge] = useState<string | null>(null);
  const [lastNotifCount, setLastNotifCount] = useState(notifications.length);

  useEffect(() => {
    if (notifications.length > lastNotifCount) {
      const latest = notifications[0];
      setActiveNudge(latest.title);
      const timer = setTimeout(() => setActiveNudge(null), 5000);
      setLastNotifCount(notifications.length);
      return () => clearTimeout(timer);
    }
  }, [notifications, lastNotifCount]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[60] rounded-full h-16 w-16 shadow-2xl bg-[#0047CC] hover:bg-[#0037AA] text-white"
        variant="default"
      >
        <Smartphone className="h-8 w-8" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white">
            {notifications.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:block fixed right-0 top-0 h-full w-[420px] bg-slate-50/80 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-[60] transition-all duration-700 ease-in-out border-l border-white/40",
        isMinimized ? "translate-x-[360px]" : "translate-x-0"
      )}
    >
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

        {/* Header/Control Bar */}
        <div className="flex items-center justify-between p-8 relative z-10">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-premium-sm group-hover:scale-110 transition-all border border-slate-100">
              <Smartphone className="h-6 w-6 text-slate-900" />
            </div>
            {!isMinimized && (
              <div className="text-left">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Preview Node</p>
                <p className="text-lg font-extrabold text-slate-800 tracking-tight">Active Device</p>
              </div>
            )}
          </button>

          {!isMinimized && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-12 w-12 p-0 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {!isMinimized && (
          <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10 relative z-10 scrollbar-hide">
            {/* Real Phone Mockup */}
            <div className="mx-auto w-[300px] bg-slate-950 rounded-[4rem] p-4 shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative border-[6px] border-slate-900">
              {/* Inner Screen */}
              <div className="bg-[#f8fafc] rounded-[3.2rem] h-[620px] overflow-hidden relative flex flex-col ring-1 ring-white/10">

                {/* Dynamic Island / Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full ml-12" />
                </div>

                {/* Status Bar */}
                <div className="h-12 flex justify-between items-center px-10 pt-4 relative z-20">
                  <span className="text-xs font-extrabold text-slate-800">9:41</span>
                  <div className="flex items-center gap-2 opacity-80">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Lock Screen Notification (Push) */}
                <AnimatePresence>
                  {activeNudge && (
                    <motion.div
                      initial={{ y: -100, opacity: 0, scale: 0.9 }}
                      animate={{ y: 16, opacity: 1, scale: 1 }}
                      exit={{ y: -100, opacity: 0, scale: 0.9 }}
                      className="absolute top-0 left-4 right-4 z-[40] bg-white/95 backdrop-blur-xl p-5 rounded-[28px] shadow-2xl border border-white flex items-center gap-5 ring-1 ring-slate-200/50"
                    >
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                        <img src="https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/297c88c7-24a3-41c1-9257-268e3981881a?" className="w-7 invert" alt="HDFC" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">HDFC Bank</p>
                        <p className="text-xs font-extrabold text-slate-800 truncate leading-tight">{notifications[0].body}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Screen Content - Messages List */}
                <div className="flex-1 overflow-y-auto p-5 pt-14 space-y-4 scrollbar-hide bg-slate-100/30">
                  <div className="text-center py-6">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.3em] bg-white px-4 py-1.5 rounded-full shadow-sm ring-1 ring-slate-100">Today</span>
                  </div>

                  {notifications.map((notif, idx) => {
                    const hasLink = notif.body.includes('http');
                    const textParts = notif.body.split(/https?:\/\/\S+/);

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ scale: 0.9, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-5 rounded-[24px] shadow-premium-sm border border-white hover:shadow-premium transition-shadow group relative"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                              <MessageSquare className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-800 tracking-tight uppercase">{notif.title}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                          {textParts[0]}
                          {hasLink && (
                            <button
                              onClick={() => {
                                window.location.href = '/?resume=true';
                              }}
                              className="text-blue-600 font-extrabold underline hover:text-blue-700 ml-1"
                            >
                              Link
                            </button>
                          )}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Home bar */}
                <div className="h-12 flex items-center justify-center pb-4">
                  <div className="w-24 h-1.5 bg-slate-300 rounded-full" />
                </div>
              </div>
            </div>

            {/* Nudge Management */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white shadow-premium overflow-hidden transition-all hover:shadow-premium-lg">
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-amber-400" />
                  <span className="text-xs font-extrabold uppercase tracking-[0.2em]">Nudge Actions</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearNotifications}
                  className="h-10 px-4 text-[10px] font-extrabold text-slate-400 hover:text-white uppercase tracking-widest hover:bg-white/10 rounded-xl"
                >
                  Clear all
                </Button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => addNotification("HDFC Bank", "SMS: Please complete your HDFC Bank journey. Click to resume: https://hdfc-bank.com/?resume=true")}
                    className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-100 transition-all active:scale-95 group"
                  >
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">SMS</span>
                  </button>
                  <button
                    onClick={() => addNotification("HDFC Bank", "WhatsApp: Your account is waiting. Click to resume: https://wa.me/hdfc?resume=true")}
                    className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-100 transition-all active:scale-95 group"
                  >
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">WA</span>
                  </button>
                  <button
                    onClick={() => addNotification("HDFC Bank", "Email: Final reminder to complete your KYC. https://hdfc-bank.com/resume?true")}
                    className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all active:scale-95 group"
                  >
                    <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">Mail</span>
                  </button>
                </div>

                <Button
                  onClick={() => {
                    addNotification("HDFC Bank", "Omnichannel Nudge sent successfully.");
                  }}
                  className="w-full h-16 rounded-[24px] bg-slate-900 hover:bg-black text-white text-sm font-extrabold uppercase tracking-widest gap-3 shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" /> Nudge Everywhere
                </Button>
              </div>
            </div>

            {/* Current Step Info */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white shadow-premium overflow-hidden transition-all hover:shadow-premium-lg">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                <p className="text-[10px] font-extrabold text-blue-200 uppercase tracking-[0.3em] mb-2 leading-none">Session Status</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-extrabold tracking-tight">{journeySteps[currentStepIndex]?.title}</p>
                  <div className="w-4 h-4 rounded-full bg-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="p-10 space-y-6 font-bold text-slate-500 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                  <span>Real-time session active</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                  <span>Cross-device sync enabled</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">HDFC Bank Secure Node v2.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
