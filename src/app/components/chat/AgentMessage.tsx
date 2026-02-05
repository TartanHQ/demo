"use client";

import React from "react";
import { Bot } from "lucide-react";

interface AgentMessageProps {
    children: React.ReactNode;
    isNew?: boolean;
}

export default function AgentMessage({ children, isNew = true }: AgentMessageProps) {
    return (
        <div className={`flex items-start gap-2 mb-4 ${isNew ? 'animate-in slide-in-from-left-4 duration-300' : ''}`}>
            {/* Agent Avatar */}
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-white" />
            </div>

            {/* Message Bubble */}
            <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2.5 shadow-sm border border-slate-100 max-w-2xl">
                <div className="text-sm text-slate-700 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
