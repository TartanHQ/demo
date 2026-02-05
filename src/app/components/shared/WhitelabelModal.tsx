"use client";

import React, { useState } from "react";
import { useBranding, BankConfig } from "@/app/context/BrandingContext";
import {
    X,
    Palette,
    Type,
    Square,
    Layers,
    Settings2,
    RotateCcw,
    Check,
    Globe
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

interface WhitelabelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WhitelabelModal({ isOpen, onClose }: WhitelabelModalProps) {
    const { config, updateConfig, setTheme, theme } = useBranding();

    if (!isOpen) return null;

    const fontOptions = ["Inter", "Roboto", "Outfit", "Playfair Display"] as const;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Design System Studio</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Live Whitelabel Configurator</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-200/50 flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Section: Core Branding */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <header className="flex items-center gap-2 text-[#0047CC]">
                                <Palette className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Color Palette</h3>
                            </header>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Primary Bank Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.primary}
                                            onChange={(e) => updateConfig({ primary: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.primary}
                                            onChange={(e) => updateConfig({ primary: e.target.value })}
                                            className="flex-1 h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600">Secondary Accent</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={config.secondary}
                                            onChange={(e) => updateConfig({ secondary: e.target.value })}
                                            className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.secondary}
                                            onChange={(e) => updateConfig({ secondary: e.target.value })}
                                            className="flex-1 h-12 px-4 rounded-xl border border-slate-200 font-mono text-sm uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Section: Component Layout & Effects */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <header className="flex items-center gap-2 text-orange-600">
                                <Square className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Visual Geometry</h3>
                            </header>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-600">Border Radius (Global)</label>
                                        <span className="text-xs font-black text-slate-400">{config.borderRadius}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="40"
                                        value={config.borderRadius}
                                        onChange={(e) => updateConfig({ borderRadius: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-600">Glass Reflection Opacity</label>
                                        <span className="text-xs font-black text-slate-400">{Math.round(config.glassOpacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="90"
                                        step="5"
                                        value={config.glassOpacity * 100}
                                        onChange={(e) => updateConfig({ glassOpacity: parseInt(e.target.value) / 100 })}
                                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Modular UI Controls */}
                        <div className="space-y-4">
                            <header className="flex items-center gap-2 text-indigo-600">
                                <Globe className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Module Management</h3>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Benefits Sidebar</span>
                                        <div
                                            onClick={() => updateConfig({ modules: { ...config.modules, showBenefits: !config.modules.showBenefits } })}
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                config.modules.showBenefits ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                                                config.modules.showBenefits ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Toggle step-specific help sidebars.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Security Badges</span>
                                        <div
                                            onClick={() => updateConfig({ modules: { ...config.modules, showSecurity: !config.modules.showSecurity } })}
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                config.modules.showSecurity ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                                                config.modules.showSecurity ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Display RBI & trust visuals.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-700">Header Scaling</span>
                                    <div className="flex p-1 bg-white rounded-xl border border-slate-100">
                                        {["regular", "large"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateConfig({ modules: { ...config.modules, headerSize: s as any } })}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                    config.modules.headerSize === s ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-700">Input Feel</span>
                                    <div className="flex p-1 bg-white rounded-xl border border-slate-100">
                                        {["filled", "outline"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateConfig({ modules: { ...config.modules, inputStyle: s as any } })}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                    config.modules.inputStyle === s ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Modular UI Controls */}
                        <div className="space-y-4">
                            <header className="flex items-center gap-2 text-indigo-600">
                                <Globe className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Module Management</h3>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Benefits Sidebar</span>
                                        <div
                                            onClick={() => updateConfig({ modules: { ...config.modules, showBenefits: !config.modules.showBenefits } })}
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                config.modules.showBenefits ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                                                config.modules.showBenefits ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Toggle step-specific help sidebars.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">Security Badges</span>
                                        <div
                                            onClick={() => updateConfig({ modules: { ...config.modules, showSecurity: !config.modules.showSecurity } })}
                                            className={cn(
                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                config.modules.showSecurity ? "bg-blue-600" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all",
                                                config.modules.showSecurity ? "translate-x-5" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium">Display RBI & trust visuals.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-700">Header Scaling</span>
                                    <div className="flex p-1 bg-white rounded-xl border border-slate-100">
                                        {["regular", "large"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateConfig({ modules: { ...config.modules, headerSize: s as any } })}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                    config.modules.headerSize === s ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                                    <span className="text-xs font-bold text-slate-700">Input Feel</span>
                                    <div className="flex p-1 bg-white rounded-xl border border-slate-100">
                                        {["filled", "outline"].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => updateConfig({ modules: { ...config.modules, inputStyle: s as any } })}
                                                className={cn(
                                                    "flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                                                    config.modules.inputStyle === s ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <header className="flex items-center gap-2 text-slate-400 mb-2">
                                <Type className="w-3.5 h-3.5" />
                                <h4 className="text-[9px] font-bold uppercase tracking-widest">Typography Notice</h4>
                            </header>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Design System is strictly locked to <span className="font-black text-slate-900 underline decoration-2 underline-offset-2">Inter</span> for maximum legibility and SaaS-grade aesthetics. Italics are disabled to ensure a clean, authoritative look.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <button
                        onClick={() => setTheme('hdfc')}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                        style={{ direction: 'ltr' }}
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset Defaults
                    </button>
                    <Button
                        onClick={onClose}
                        className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all active:scale-95"
                    >
                        Apply & Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
