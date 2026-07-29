import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/flow/button";
import { CustomerAppointmentsSection } from "@/components/customer-app/customer-appointments-section";
import { InstallAppCard, type InstallState } from "@/components/customer-app/install-app-card";
import { NextAppointmentCard } from "@/components/customer-app/next-appointment-card";
import {
  PushReminderStatusCard,
  type PushState,
} from "@/components/customer-app/push-reminder-status-card";
import { TenantIdentityHeader } from "@/components/customer-app/tenant-identity-header";
import { usePublicCustomerAppConfigQuery } from "@/hooks/use-public-customer-app-config-query";
import { useCustomerAppBookingsQuery } from "@/hooks/use-customer-app-bookings-query";
import { useIsStandalonePwa } from "@/hooks/use-is-standalone-pwa";
import { customerAppService } from "@/services/customer-app-service";
import { clearCustomerAppSession, getCustomerAppSession, setCustomerAppSession } from "@/session/customer-app-session-storage";
import { setLastCustomerAppTenantSlug } from "@/session/customer-app-last-tenant-storage";
import {
  clearStoredCustomerAppPushSubscription,
  getStoredCustomerAppPushSubscription,
  setStoredCustomerAppPushSubscription,
} from "@/session/customer-app-push-storage";
import { Loader2, Bell, Smartphone, CalendarDays, MessageCircle } from "lucide-react";
import { ApiError } from "@/types/api";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

export function CustomerAppHomePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isStandalone = useIsStandalonePwa();
  const configQuery = usePublicCustomerAppConfigQuery(slug);
  const [storedSessionToken, setStoredSessionToken] = useState<string | null>(() =>
    slug ? getCustomerAppSession(slug)?.token ?? null : null,
  );
  const [bootstrapState, setBootstrapState] = useState<"idle" | "loading" | "error">("idle");
  const [installState, setInstallState] = useState<InstallState>("unavailable");
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [pushState, setPushState] = useState<PushState>("unsupported");
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(() =>
    slug ? getStoredCustomerAppPushSubscription(slug)?.subscriptionId ?? null : null,
  );
  const bookingsQuery = useCustomerAppBookingsQuery(slug, storedSessionToken);

  useEffect(() => {
    if (!slug) {
      return;
    }

    setLastCustomerAppTenantSlug(slug);
    setStoredSessionToken(getCustomerAppSession(slug)?.token ?? null);
    setPushSubscriptionId(
      getStoredCustomerAppPushSubscription(slug)?.subscriptionId ?? null,
    );
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setInstallState("available");
    };

    const handleInstalled = () => {
      setInstallPromptEvent(null);
      setInstallState("unavailable");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    const bookingBootstrapToken = searchParams.get("manageToken");

    if (!slug || !bookingBootstrapToken) {
      return;
    }

    let active = true;
    setBootstrapState("loading");

    void customerAppService
      .bootstrapSession(slug, { bookingBootstrapToken })
      .then((session) => {
        if (!active) {
          return;
        }

        setCustomerAppSession(slug, {
          token: session.sessionToken,
          expiresAt: session.expiresAt,
          customerName: session.customer.name,
        });
        setStoredSessionToken(session.sessionToken);
        setBootstrapState("idle");

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("manageToken");
        setSearchParams(nextParams, { replace: true });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setBootstrapState("error");
      });

    return () => {
      active = false;
    };
  }, [searchParams, setSearchParams, slug]);

  useEffect(() => {
    if (!(bookingsQuery.error instanceof ApiError) || bookingsQuery.error.status !== 401 || !slug) {
      return;
    }

    clearCustomerAppSession(slug);
    clearStoredCustomerAppPushSubscription(slug);
    setStoredSessionToken(null);
    setPushSubscriptionId(null);
  }, [bookingsQuery.error, slug]);

  useEffect(() => {
    if (!configQuery.data) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      typeof Notification === "undefined"
    ) {
      setPushState("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      setPushState("denied");
      return;
    }

    if (!configQuery.data.supportsPushHint || !configQuery.data.pushPublicKey) {
      setPushState("unsupported");
      return;
    }

    if (!storedSessionToken) {
      setPushState("idle");
      return;
    }

    let active = true;

    void navigator.serviceWorker.ready
      .then(async (registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!active) {
          return;
        }

        if (subscription && Notification.permission === "granted") {
          setPushState("active");
          return;
        }

        setPushState(Notification.permission === "granted" ? "idle" : "idle");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPushState("error");
        setPushError("Nao foi possivel preparar os lembretes push neste navegador.");
      });

    return () => {
      active = false;
    };
  }, [configQuery.data, storedSessionToken]);

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    setInstallState("installing");
    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    setInstallState("unavailable");
  };

  const handleEnablePush = async () => {
    if (!slug || !storedSessionToken || !configQuery.data?.pushPublicKey) {
      return;
    }

    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      typeof Notification === "undefined"
    ) {
      setPushState("unsupported");
      return;
    }

    setPushState("loading");
    setPushError(null);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      const browserSubscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(configQuery.data.pushPublicKey),
        }));
      const json = browserSubscription.toJSON();

      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("Subscription incompleta no navegador.");
      }

      const response = await customerAppService.registerPushSubscription(slug, storedSessionToken, {
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
      });

      setStoredCustomerAppPushSubscription(slug, {
        subscriptionId: response.subscriptionId,
        endpoint: response.endpoint,
      });
      setPushSubscriptionId(response.subscriptionId);
      setPushState("active");
    } catch {
      setPushState("error");
      setPushError("Nao foi possivel ativar os lembretes push neste aparelho.");
    }
  };

  const handleDisablePush = async () => {
    if (!slug || !storedSessionToken) {
      return;
    }

    setPushState("loading");
    setPushError(null);

    try {
      if (pushSubscriptionId) {
        await customerAppService.deactivatePushSubscription(
          slug,
          storedSessionToken,
          pushSubscriptionId,
        );
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      clearStoredCustomerAppPushSubscription(slug);
      setPushSubscriptionId(null);
      setPushState("idle");
    } catch {
      setPushState("error");
      setPushError("Nao foi possivel desativar os lembretes push agora.");
    }
  };

  if (configQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
        <div className="flex items-center gap-2 text-sm text-text-soft">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Carregando app do cliente...
        </div>
      </div>
    );
  }

  if (configQuery.isError || !configQuery.data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg-base) px-4">
        <div className="max-w-md rounded-2xl border border-[rgba(248,113,113,0.28)] bg-[var(--theme-surface-glass)] p-6 text-center">
          <h1 className="text-xl font-bold text-[var(--theme-text-primary)]">Nao foi possivel abrir o app</h1>
          <p className="mt-2 text-sm text-text-soft">
            Tente novamente em instantes.
          </p>
        </div>
      </div>
    );
  }

  const { tenant, whatsappUrl } = configQuery.data;
  const bookings =
    storedSessionToken && bookingsQuery.isSuccess
      ? bookingsQuery.data.bookings
      : [];
  const nextBooking = bookings[0] ?? null;
  const appointmentsSection = (
    <CustomerAppointmentsSection
      tenantSlug={tenant.slug}
      timezone={tenant.timezone}
      hasSession={Boolean(storedSessionToken)}
      bootstrapState={bootstrapState}
      isLoading={bookingsQuery.isLoading}
      isError={bookingsQuery.isError}
      isSuccess={bookingsQuery.isSuccess}
      bookings={bookings}
    />
  );
  const remindersCard = (
    <PushReminderStatusCard
      state={pushState}
      hasSession={Boolean(storedSessionToken)}
      error={pushError}
      onEnable={() => void handleEnablePush()}
      onDisable={() => void handleDisablePush()}
    />
  );
  const whatsappAction = whatsappUrl ? (
    <Button
      as="a"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      variant="ghost"
      size="md"
    >
      <MessageCircle size={16} aria-hidden="true" />
      Falar no WhatsApp
    </Button>
  ) : null;

  return (
    <div
      className="min-h-screen bg-(--bg-base) px-4 py-5"
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className={`mx-auto flex max-w-xl flex-col ${isStandalone ? "gap-4" : "gap-6"}`}>
        {isStandalone ? (
          <>
            <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
              <TenantIdentityHeader
                name={tenant.name}
                logoUrl={tenant.logoUrl}
                compact
              />
            </section>

            {nextBooking ? (
              <NextAppointmentCard
                booking={nextBooking}
                tenantSlug={tenant.slug}
                timezone={tenant.timezone}
              />
            ) : storedSessionToken && bookingsQuery.isSuccess ? (
              <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
                <CalendarDays size={22} className="text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black text-[var(--theme-text-primary)]">
                  Você ainda não tem compromissos agendados.
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-soft">
                  Agende seu próximo horário em poucos passos.
                </p>
                <Button
                  as={Link}
                  to={`/c/${tenant.slug}/catalog`}
                  size="md"
                  className="mt-5 w-full"
                >
                  Agendar horário
                </Button>
              </section>
            ) : !storedSessionToken ? (
              <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-5">
                <CalendarDays size={22} className="text-primary" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-black text-[var(--theme-text-primary)]">
                  Seus compromissos neste aparelho
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-soft">
                  Seus compromissos aparecem aqui depois que você agenda ou abre um
                  link de lembrete neste aparelho.
                </p>
                <Button
                  as={Link}
                  to={`/c/${tenant.slug}/catalog`}
                  size="md"
                  className="mt-5 w-full"
                >
                  Agendar horário
                </Button>
              </section>
            ) : null}

            {appointmentsSection}
            {remindersCard}
            {whatsappAction}
          </>
        ) : (
          <>
            <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 shadow-[0_18px_45px_rgba(52,42,31,0.10)] backdrop-blur-sm">
              <TenantIdentityHeader
                name={tenant.name}
                logoUrl={tenant.logoUrl}
                description={tenant.description}
              />
              <div className="mt-6 flex flex-col gap-3">
                <Button as={Link} to={`/c/${tenant.slug}/catalog`} size="md">
                  Agendar agora
                </Button>
                {whatsappAction}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
                  <CalendarDays size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                    Agendar
                  </p>
                  <p className="mt-1 text-sm text-text-soft">
                    Agende seu horário em poucos passos.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
                  <Smartphone size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                    Instalar
                  </p>
                  <p className="mt-1 text-sm text-text-soft">
                    Volte mais rápido aos seus compromissos.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
                  <Bell size={18} className="text-primary" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">
                    Lembretes
                  </p>
                  <p className="mt-1 text-sm text-text-soft">
                    Receba avisos antes do seu horário.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <InstallAppCard
                  state={installState}
                  onInstall={() => void handleInstall()}
                />
                {remindersCard}
              </div>
            </section>
            {appointmentsSection}
          </>
        )}
      </div>
    </div>
  );
}
