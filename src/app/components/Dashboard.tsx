"use client";

import React from "react";
import { useJourney } from "@/app/context/JourneyContext";
import {
    Home,
    Users,
    Globe,
    Activity,
    Settings,
    Search,
    Download,
    Filter,
    RefreshCcw,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

type JourneyKey = "ntb" | "etb" | "etb-nk" | "etb-ak";

function getJourneyCategory(journey: string): {
    label: "NTB" | "ETB: Auto Conv." | "ETB with KYC" | "ETB with AKYC";
    className: string;
} {
    switch (journey) {
        case "ntb":
            return {
                label: "NTB",
                className: "bg-blue-50 text-[#004C8F] border border-blue-100",
            };
        case "etb":
            return {
                label: "ETB: Auto Conv.",
                className: "bg-slate-50 text-slate-700 border border-slate-200",
            };
        case "etb-nk":
        default:
            return {
                label: "ETB with KYC",
                className: "bg-red-50 text-[#ED232A] border border-red-100",
            };
        case "etb-ak":
            return {
                label: "ETB with AKYC",
                className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
            };
    }
}

export default function Dashboard() {
    const [invitedEmployeeIds, setInvitedEmployeeIds] = React.useState<Record<string, boolean>>({});

    const employees = [
        // Synthetic, realistic-looking employee master data (no real PII)
        { id: "CBS-240013", name: "Aarav Mehta", phone: "9876543210", email: "aarav.mehta@cholabusiness.example", journey: "ntb" as JourneyKey, dob: "1994-03-12", pan: "QWERT1234P", fatherName: "Rakesh Mehta", motherName: "Neeta Mehta", currentAddress: "Flat 12B, HSR Layout, Bengaluru 560102", income: "1450000" },
        { id: "CBS-240019", name: "Diya Sharma", phone: "9811122233", email: "diya.sharma@cholabusiness.example", journey: "etb-nk" as JourneyKey, dob: "1991-09-08", pan: "ASDFG4321K", fatherName: "Suresh Sharma", motherName: "Anita Sharma", currentAddress: "Sector 45, Gurugram 122003", income: "1900000" },
        { id: "CBS-240042", name: "Kabir Singh", phone: "9899001122", email: "kabir.singh@cholabusiness.example", journey: "etb" as JourneyKey, dob: "1989-01-23", pan: "ZXCVB6789L", fatherName: "Harjit Singh", motherName: "Manpreet Kaur", currentAddress: "Andheri East, Mumbai 400069", income: "2400000" },
        { id: "CBS-240042-AK", name: "Riya Verma", phone: "9812345678", email: "riya.verma@cholabusiness.example", journey: "etb-ak" as JourneyKey, dob: "1990-11-21", pan: "QAZWS1234L", fatherName: "M. Verma", motherName: "S. Verma", currentAddress: "Rajaji Nagar, Bengaluru 560010", income: "1850000" },
        { id: "CBS-240058", name: "Ananya Iyer", phone: "9822334455", email: "ananya.iyer@cholabusiness.example", journey: "ntb" as JourneyKey, dob: "1996-07-14", pan: "POIUY1122M", fatherName: "S. Iyer", motherName: "Lakshmi Iyer", currentAddress: "Kondapur, Hyderabad 500084", income: "1200000" },
        { id: "CBS-240071", name: "Rohan Kulkarni", phone: "9765432109", email: "rohan.kulkarni@cholabusiness.example", journey: "ntb" as JourneyKey, dob: "1993-11-02", pan: "LKJHG5566N", fatherName: "V. Kulkarni", motherName: "M. Kulkarni", currentAddress: "Viman Nagar, Pune 411014", income: "1650000" },
        { id: "CBS-240085", name: "Ishita Gupta", phone: "9998887766", email: "ishita.gupta@cholabusiness.example", journey: "etb" as JourneyKey, dob: "1992-05-19", pan: "MNBVC3344Q", fatherName: "A. Gupta", motherName: "S. Gupta", currentAddress: "DLF Phase 3, Gurugram 122002", income: "2100000" },
        { id: "CBS-240096", name: "Vikram Nair", phone: "9887766554", email: "vikram.nair@cholabusiness.example", journey: "etb-nk" as JourneyKey, dob: "1990-12-30", pan: "HJKLA9090R", fatherName: "Prakash Nair", motherName: "Uma Nair", currentAddress: "Indiranagar, Bengaluru 560038", income: "1750000" },
        { id: "CBS-240103", name: "Sara Khan", phone: "9700012345", email: "sara.khan@cholabusiness.example", journey: "ntb" as JourneyKey, dob: "1997-02-06", pan: "TREWS4455S", fatherName: "Imran Khan", motherName: "Farah Khan", currentAddress: "Salt Lake, Kolkata 700091", income: "980000" },
    ];

    // NOTE: We intentionally do NOT persist invited state across reloads.
    // A hard refresh should reset buttons back to "Invite".
    //
    // Some browsers (notably Safari) may restore pages from the back/forward cache (bfcache),
    // which can preserve in-memory React state. Force-reset on bfcache restore so the dashboard
    // always returns to the default "Invite" state when revisiting.
    React.useEffect(() => {
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                setInvitedEmployeeIds({});
            }
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, []);

    const handleInvite = async (emp: (typeof employees)[number]) => {
        if (invitedEmployeeIds[emp.id]) return;
        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    journeyType: emp.journey,
                    employee: { id: emp.id, name: emp.name, email: emp.email, phone: emp.phone },
                    prefilledData: {
                        dob: emp.dob,
                        pan: emp.pan,
                        fatherName: emp.fatherName,
                        motherName: emp.motherName,
                        currentAddress: emp.currentAddress,
                        income: emp.income,
                    },
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || "Unable to send invite.");
            }

            const payload = (await res.json()) as { inviteId: string; journeyUrl: string };

            // Best-effort copy link for HR convenience
            try {
                await navigator.clipboard.writeText(payload.journeyUrl);
            } catch {
                // ignore
            }

            setInvitedEmployeeIds((prev) => ({ ...prev, [emp.id]: true }));

            // Open the employee journey in a new tab after a short delay
            window.setTimeout(() => {
                window.open(payload.journeyUrl, "_blank", "noopener,noreferrer");
            }, 4000);
        } catch (e) {
            // Keep UI unchanged on failure (button remains "Invite")
            void e;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#f8f9fa] text-[#0f172a] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-20 bg-white border-r border-[#e2e8f0] flex flex-col items-center py-6 flex-shrink-0">
                <div className="text-[10px] font-semibold text-[#94a3b8] mb-3 tracking-wider">MAIN</div>
                <div className="space-y-4">
                    <NavItem icon={Home} active />
                    <NavItem icon={Users} />
                    <NavItem icon={Globe} />
                    <NavItem icon={Activity} />
                </div>
                <div className="w-10 h-px bg-[#e2e8f0] my-4" />
                <div className="text-[10px] font-semibold text-[#94a3b8] mb-3 tracking-wider">SETTINGS</div>
                <NavItem icon={Settings} />
                <div className="mt-auto w-9 h-9 bg-[#06b6d4] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    B
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-3 text-sm text-[#94a3b8] mb-6">
                    <Home className="w-4.5 h-4.5" />
                    <span className="text-[#cbd5e1]">/</span>
                    <span>Active Connections</span>
                    <span className="text-[#cbd5e1]">/</span>
                    <span className="text-[#3b82f6] cursor-pointer">Chola Business Services L...</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-[#e2e8f0] mb-6">
                    <TabItem label="Employee Directory" count={254} />
                    <TabItem label="Account Opening Status" active />
                    <TabItem label="Updates" count={177} />
                    <TabItem label="Diagnostics" />
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center bg-white border border-[#e2e8f0] rounded-md px-3 h-10 w-80 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search className="w-4.5 h-4.5 text-[#94a3b8]" />
                        <input type="text" placeholder="Search" className="ml-2 text-sm outline-none w-full" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-[#3b82f6] text-right leading-tight font-medium">
                            Automated email<br />to employees
                        </div>
                        <div className="w-9 h-5 bg-[#e2e8f0] rounded-full relative cursor-pointer group">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-transform group-hover:scale-105" />
                        </div>
                        <button className="h-10 px-4 border border-[#e2e8f0] bg-white text-[#3b82f6] font-medium text-sm rounded-md hover:bg-slate-50 transition-colors">
                            Refresh all
                        </button>
                        <button className="h-10 px-4 bg-[#3b82f6] text-white font-medium text-sm rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
                            <Download className="w-4.5 h-4.5" />
                            Download CSV
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead className="bg-[#fcfdfe]">
                                <tr className="border-b border-[#e2e8f0]">
                                    <HeaderCell label="Employee ID" />
                                    <HeaderCell label="Employee name" />
                                    <HeaderCell label="Phone number" />
                                    <HeaderCell label="Official Email ID" className="w-[180px]" />
                                    <HeaderCell label="Journey Category" />
                                    <HeaderCell label="Bank Account Status" hasFilter className="w-[150px]" />
                                    <HeaderCell label="Reference ID" className="w-[55px] px-3" />
                                    <th className="px-5 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f0]">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4 text-[#0f172a] font-medium">{emp.id}</td>
                                        <td className="px-5 py-4 text-[#0f172a] font-semibold">{emp.name}</td>
                                        <td className="px-5 py-4 text-[#64748b]">{emp.phone}</td>
                                        <td className="px-5 py-4 text-[#64748b] w-[180px]">
                                            <span className="block max-w-[160px] truncate" title={emp.email}>
                                                {emp.email}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {(() => {
                                                const meta = getJourneyCategory(emp.journey);
                                                return (
                                                    <span className={cn("px-2 py-1 rounded-full text-[11px] font-semibold", meta.className)}>
                                                        {meta.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-5 py-4 w-[150px]">
                                            <span className="inline-flex px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 whitespace-nowrap">
                                                {invitedEmployeeIds[emp.id] ? "Invited" : "Not Started"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-[#94a3b8] w-[55px]">—</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <span className="text-[#3b82f6] font-medium text-xs cursor-pointer hover:underline">Refresh now</span>
                                                <button
                                                    onClick={() => handleInvite(emp)}
                                                    disabled={!!invitedEmployeeIds[emp.id]}
                                                    className={cn(
                                                        "h-8 px-4 border border-[#e2e8f0] rounded text-xs font-bold transition-all",
                                                        invitedEmployeeIds[emp.id]
                                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                            : "bg-white text-[#0f172a] hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6]"
                                                    )}
                                                >
                                                    {invitedEmployeeIds[emp.id] ? "Invited" : "Invite"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#fcfdfe] flex justify-between items-center mt-auto">
                        <div className="flex gap-3">
                            <button disabled className="px-4 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#94a3b8] cursor-not-allowed">Previous</button>
                            <button className="px-4 py-2 border border-[#e2e8f0] bg-white rounded-md text-sm text-[#0f172a] hover:bg-slate-50">Next</button>
                        </div>
                        <div className="text-sm text-[#64748b]">Page 1 of 10</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, active }: { icon: any; active?: boolean }) {
    return (
        <div className={cn(
            "w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all",
            active ? "bg-[#eef2ff] text-[#3b82f6]" : "text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
        )}>
            <Icon className="w-5 h-5" />
        </div>
    );
}

function TabItem({ label, count, active }: { label: string; count?: number; active?: boolean }) {
    return (
        <div className={cn(
            "pb-3 text-sm font-semibold cursor-pointer relative flex items-center gap-2 transition-colors",
            active ? "text-[#3b82f6] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-[#3b82f6]" : "text-[#64748b] hover:text-[#0f172a]"
        )}>
            {label}
            {count !== undefined && (
                <span className="bg-[#f1f5f9] text-[#64748b] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {count}
                </span>
            )}
        </div>
    );
}

function HeaderCell({ label, hasFilter, className }: { label: string; hasFilter?: boolean; className?: string }) {
    return (
        <th className={cn("px-5 py-4 text-left font-bold text-[#0f172a] whitespace-nowrap text-[11px] uppercase tracking-wide", className)}>
            <div className="flex items-center gap-2">
                {label}
                {hasFilter && <Filter className="w-3.5 h-3.5" />}
            </div>
        </th>
    );
}
