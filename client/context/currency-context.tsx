"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { getSymbolFromCode } from "@/lib/currencies";

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (code: string) => void;
  loading: boolean;
  refreshCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [loading, setLoading] = useState(true);

  // Helper to fetch latest from backend
  const fetchSettings = async () => {
    try {
      // Agar user logged in nahi hai to error aa sakta hai, usse handle karein
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/users/profile");
      if (res.data.currency) {
        updateState(res.data.currency);
      }
    } catch (error) {
      console.error("Failed to fetch currency settings", error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = (code: string) => {
    setCurrencyState(code);
    setSymbol(getSymbolFromCode(code));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Ye function Settings page use karega update karne ke baad
  const setCurrency = (code: string) => {
    updateState(code);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol,
        setCurrency,
        loading,
        refreshCurrency: fetchSettings,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// Custom Hook for easy access
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
