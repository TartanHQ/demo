"use client";

import React from "react";

interface UserResponseProps {
    children: React.ReactNode;
    isNew?: boolean;
}

export default function UserResponse({ children, isNew = true }: UserResponseProps) {
    return (
        <div className={`flex items-start justify-end mb-4 ${isNew ? 'animate-in slide-in-from-right-4 duration-300' : ''}`}>
            {/* Message Bubble */}
            <div className="relative bg-blue-600 rounded-lg px-3 py-2.5 shadow-sm max-w-md">
                <div className="text-sm text-white leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
