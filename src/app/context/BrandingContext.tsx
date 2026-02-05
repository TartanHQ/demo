"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type BankTheme = "hdfc" | "icici" | "axis" | "custom";

export interface BankConfig {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    logo: string;
    borderRadius: number; // in pixels
    fontFamily: "Open Sans";
    glassOpacity: number; // 0 to 1
    modules: {
        showBenefits: boolean;
        showSecurity: boolean;
        headerSize: "regular" | "large";
        inputStyle: "filled" | "outline";
    };
    preset: "glassy" | "neobrutalist" | "minimal";
}

const DEFAULT_CONFIGS: Record<Exclude<BankTheme, "custom">, BankConfig> = {
    hdfc: {
        name: "HDFC Bank",
        primary: "#004C8F",
        secondary: "#ED232A",
        accent: "#f5f5f5",
        logo: "hdfc",
        borderRadius: 8,
        fontFamily: "Open Sans",
        glassOpacity: 0.4,
        modules: {
            showBenefits: true,
            showSecurity: true,
            headerSize: "large",
            inputStyle: "filled",
        },
        preset: "glassy"
    },
    icici: {
        name: "ICICI Bank",
        primary: "#f27121",
        secondary: "#9b1c1c",
        accent: "#fffaf0",
        logo: "I",
        borderRadius: 24,
        fontFamily: "Open Sans",
        glassOpacity: 0.5,
        modules: {
            showBenefits: true,
            showSecurity: true,
            headerSize: "regular",
            inputStyle: "filled",
        },
        preset: "minimal"
    },
    axis: {
        name: "Axis Bank",
        primary: "#971237",
        secondary: "#f5f5f5",
        accent: "#fff5f7",
        logo: "A",
        borderRadius: 12,
        fontFamily: "Open Sans",
        glassOpacity: 0.3,
        modules: {
            showBenefits: false,
            showSecurity: true,
            headerSize: "regular",
            inputStyle: "filled",
        },
        preset: "glassy"
    },
};

interface BrandingContextType {
    theme: BankTheme;
    config: BankConfig;
    setTheme: (theme: BankTheme) => void;
    updateConfig: (updates: Partial<BankConfig>) => void;
    toggleTheme: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<BankTheme>("hdfc");
    const [config, setConfig] = useState<BankConfig>(DEFAULT_CONFIGS.hdfc);

    const setTheme = (newTheme: BankTheme) => {
        setThemeState(newTheme);
        if (newTheme !== "custom") {
            setConfig(DEFAULT_CONFIGS[newTheme]);
        }
    };

    const updateConfig = (updates: Partial<BankConfig>) => {
        setThemeState("custom");
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const toggleTheme = () => {
        const themes: BankTheme[] = ["hdfc", "icici", "axis"];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    // Global style application
    useEffect(() => {
        const root = document.documentElement;

        // Primary (HDFC: #004C8F)
        root.style.setProperty('--primary-bank', config.primary);

        // Darker hover state (HDFC guidance: a bit darker)
        const primaryDark =
            theme === "hdfc"
                ? "#003366"
                : config.primary; // safe fallback if theme changes
        root.style.setProperty('--primary-bank-dark', primaryDark);

        // Accent/secondary (HDFC: #ED232A)
        root.style.setProperty('--secondary-bank', config.secondary);

        // 4px / 8px radius system (buttons/inputs vs cards)
        root.style.setProperty('--radius-bank', `${config.borderRadius}px`);
        root.style.setProperty('--font-bank', config.fontFamily);
    }, [config, theme]);

    return (
        <BrandingContext.Provider value={{ theme, config, setTheme, updateConfig, toggleTheme }}>
            <div style={{ fontFamily: config.fontFamily }}>
                {children}
            </div>
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
}
