import { useEffect, useState } from "react";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function readStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const displayModeStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    (window.navigator as NavigatorWithStandalone).standalone === true;

  return displayModeStandalone || iosStandalone;
}

export function useIsStandalonePwa() {
  const [isStandalone, setIsStandalone] = useState(readStandaloneMode);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const syncDisplayMode = () => setIsStandalone(readStandaloneMode());

    syncDisplayMode();
    mediaQuery.addEventListener("change", syncDisplayMode);

    return () => {
      mediaQuery.removeEventListener("change", syncDisplayMode);
    };
  }, []);

  return isStandalone;
}
