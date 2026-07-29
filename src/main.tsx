import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";
import {
  CUSTOMER_APP_SCOPE_ROOT,
  isCustomerAppPath,
} from "@/lib/customer-app-pwa";
import { readThemeFromStorage } from "@/theme/theme";
import "@/app/globals.css";

const initialTheme = readThemeFromStorage(window.localStorage);
document.documentElement.setAttribute("data-theme", initialTheme);
document.documentElement.style.colorScheme = initialTheme === "dark" ? "dark" : "light";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const pathname = window.location.pathname;

    if (!(isCustomerAppPath(pathname) || pathname === CUSTOMER_APP_SCOPE_ROOT)) {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations
          .filter((registration) => registration.active?.scriptURL.endsWith("/customer-app-sw.js"))
          .forEach((registration) => {
            void registration.unregister();
          });
      });
      return;
    }

    void navigator.serviceWorker.register("/customer-app-sw.js", {
      scope: `${CUSTOMER_APP_SCOPE_ROOT}/`,
    });
  });
}
