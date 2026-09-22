"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
  setPrivacyMode: () => {},
});

const PRIVACY_STORAGE_KEY = "story_finance_privacy_mode";

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored !== null) {
        setIsPrivacyMode(stored === "true");
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    setMounted(true);
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PRIVACY_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const setPrivacyMode = (value: boolean) => {
    setIsPrivacyMode(value);
    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, String(value));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        isPrivacyMode: mounted ? isPrivacyMode : false,
        togglePrivacyMode,
        setPrivacyMode,
      }}
    >
      <div
        data-privacy={mounted && isPrivacyMode ? "true" : "false"}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </div>
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
