"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UiDeviceContextValue = {
  hasHydrated: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

const UiDeviceContext = createContext<UiDeviceContextValue>({
  hasHydrated: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

function readDeviceState() {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  return {
    isMobile: window.matchMedia("(max-width: 767px)").matches,
    isTablet: window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches,
    isDesktop: window.matchMedia("(min-width: 1024px)").matches,
  };
}

export function UiDeviceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [deviceState, setDeviceState] = useState(() => ({
    hasHydrated: false,
    ...readDeviceState(),
  }));

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      setDeviceState({
        hasHydrated: true,
        isMobile: mobileQuery.matches,
        isTablet: tabletQuery.matches,
        isDesktop: desktopQuery.matches,
      });
    };

    update();

    mobileQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);

    return () => {
      mobileQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  const value = useMemo(() => deviceState, [deviceState]);

  return <UiDeviceContext.Provider value={value}>{children}</UiDeviceContext.Provider>;
}

export function useUiDevice() {
  return useContext(UiDeviceContext);
}
