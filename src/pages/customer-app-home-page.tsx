import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/flow/button";
import { usePublicCustomerAppConfigQuery } from "@/hooks/use-public-customer-app-config-query";
import { useCustomerAppBookingsQuery } from "@/hooks/use-customer-app-bookings-query";
import { customerAppService } from "@/services/customer-app-service";
import { clearCustomerAppSession, getCustomerAppSession, setCustomerAppSession } from "@/session/customer-app-session-storage";
import {
  clearStoredCustomerAppPushSubscription,
  getStoredCustomerAppPushSubscription,
  setStoredCustomerAppPushSubscription,
} from "@/session/customer-app-push-storage";
import { Loader2, Bell, Smartphone, CalendarDays, MessageCircle } from "lucide-react";
import { DateTime } from "luxon";
import { ApiError } from "@/types/api";

type InstallState = "unavailable" | "available" | "installed" | "installing";
type PushState = "unsupported" | "idle" | "loading" | "active" | "denied" | "error";

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

    setStoredSessionToken(getCustomerAppSession(slug)?.token ?? null);
    setPushSubscriptionId(
      getStoredCustomerAppPushSubscription(slug)?.subscriptionId ?? null,
    );
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const standaloneMedia =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;
    const syncInstalledState = () => {
      const standalone =
        Boolean(standaloneMedia?.matches) ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstallState((current) => (standalone ? "installed" : current === "installed" ? "unavailable" : current));
    };

    syncInstalledState();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setInstallState(standaloneMedia?.matches ? "installed" : "available");
    };

    const handleInstalled = () => {
      setInstallPromptEvent(null);
      setInstallState("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standaloneMedia?.addEventListener("change", syncInstalledState);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standaloneMedia?.removeEventListener("change", syncInstalledState);
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
    setInstallState(choice.outcome === "accepted" ? "installed" : "unavailable");
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

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-6">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 shadow-[0_18px_45px_rgba(52,42,31,0.10)] backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">App do cliente</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--theme-text-primary)]">
            {tenant.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-soft">
            {tenant.description?.trim() || "Agende mais rapido, acompanhe seus compromissos e ative lembretes neste aparelho."}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
              <CalendarDays size={18} className="text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">Agendar</p>
              <p className="mt-1 text-sm text-text-soft">Continue usando o fluxo atual sem perder a nova entrada do app.</p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
              <Smartphone size={18} className="text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">Instalar</p>
              <p className="mt-1 text-sm text-text-soft">Depois do agendamento, instale o app para voltar mais rapido.</p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
              <Bell size={18} className="text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-[var(--theme-text-primary)]">Lembretes</p>
              <p className="mt-1 text-sm text-text-soft">Ative lembretes no aparelho quando estiver pronto.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button as={Link} to={`/c/${tenant.slug}/catalog`} size="md">
              Agendar agora
            </Button>
            {whatsappUrl ? (
              <Button as="a" href={whatsappUrl} target="_blank" rel="noreferrer" variant="ghost" size="md">
                <MessageCircle size={16} aria-hidden="true" />
                Falar no WhatsApp
              </Button>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--theme-text-primary)]">Instalar neste aparelho</p>
                  <p className="mt-1 text-sm text-text-soft">
                    {installState === "installed"
                      ? "O app ja esta instalado neste aparelho."
                      : "Use o atalho do PWA para voltar direto aos seus compromissos."}
                  </p>
                </div>
                <Smartphone size={18} className="mt-1 text-primary" aria-hidden="true" />
              </div>
              <div className="mt-4">
                {installState === "available" ? (
                  <Button type="button" size="md" variant="secondary" onClick={() => void handleInstall()}>
                    Instalar app
                  </Button>
                ) : installState === "installing" ? (
                  <div className="flex items-center gap-2 text-sm text-text-soft">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Abrindo prompt de instalacao...
                  </div>
                ) : (
                  <p className="text-sm text-text-soft">
                    {installState === "installed"
                      ? "Instalacao concluida."
                      : "Se o navegador nao mostrar o prompt, use o menu Compartilhar ou Instalar do proprio browser."}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--theme-text-primary)]">Lembretes push</p>
                  <p className="mt-1 text-sm text-text-soft">
                    {storedSessionToken
                      ? "Ative lembretes neste aparelho para receber avisos antes do compromisso."
                      : "Ative push depois que este aparelho estiver vinculado a um agendamento."}
                  </p>
                </div>
                <Bell size={18} className="mt-1 text-primary" aria-hidden="true" />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {pushState === "loading" ? (
                  <div className="flex items-center gap-2 text-sm text-text-soft">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Atualizando notificacoes...
                  </div>
                ) : null}

                {pushState === "unsupported" ? (
                  <p className="text-sm text-text-soft">
                    Este navegador nao oferece push web para esta experiencia agora.
                  </p>
                ) : null}

                {pushState === "denied" ? (
                  <p className="text-sm text-[color:var(--theme-feedback-danger-text)]">
                    A permissao foi negada neste navegador. Reative nas configuracoes do site para voltar a receber push.
                  </p>
                ) : null}

                {pushState === "error" && pushError ? (
                  <p className="text-sm text-[color:var(--theme-feedback-danger-text)]">{pushError}</p>
                ) : null}

                {pushState === "active" ? (
                  <>
                    <p className="text-sm text-[var(--theme-text-primary)]">
                      Lembretes push ativos neste aparelho.
                    </p>
                    <Button type="button" size="md" variant="ghost" onClick={() => void handleDisablePush()}>
                      Desativar lembretes neste aparelho
                    </Button>
                  </>
                ) : null}

                {(pushState === "idle" || pushState === "error") && storedSessionToken ? (
                  <Button
                    type="button"
                    size="md"
                    variant="secondary"
                    onClick={() => void handleEnablePush()}
                  >
                    Ativar lembretes neste aparelho
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Meus compromissos</h2>
          {bootstrapState === "loading" ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Vinculando este aparelho aos seus compromissos...
            </div>
          ) : null}

          {bootstrapState === "error" ? (
            <p className="mt-2 text-sm leading-6 text-[color:var(--theme-feedback-danger-text)]">
              Nao foi possivel ativar seus compromissos por este link. Tente novamente a partir do link recebido.
            </p>
          ) : null}

          {!storedSessionToken ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--theme-border-subtle)] px-4 py-5 text-sm text-text-soft">
              Seus compromissos vao aparecer aqui depois que voce agendar ou abrir um link de lembrete neste aparelho.
            </div>
          ) : null}

          {storedSessionToken && bookingsQuery.isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-text-soft">
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Carregando seus compromissos...
            </div>
          ) : null}

          {storedSessionToken && bookingsQuery.isSuccess && bookingsQuery.data.bookings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--theme-border-subtle)] px-4 py-5 text-sm text-text-soft">
              Nenhum compromisso futuro encontrado neste tenant.
            </div>
          ) : null}

          {storedSessionToken && bookingsQuery.isSuccess && bookingsQuery.data.bookings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {bookingsQuery.data.bookings.map((booking) => {
                const start = DateTime.fromISO(booking.start, { zone: "utc" }).setZone(
                  tenant.timezone,
                );
                const end = DateTime.fromISO(booking.end, { zone: "utc" }).setZone(
                  tenant.timezone,
                );

                return (
                  <Link
                    key={booking.id}
                    to={`/c/${tenant.slug}/bookings/${booking.id}`}
                    className="block rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-elevated)] p-4"
                  >
                    <p className="text-sm font-semibold text-[var(--theme-text-primary)]">
                      {booking.serviceName || "Compromisso"}
                    </p>
                    <p className="mt-1 text-sm text-text-soft">
                      {booking.professionalName || "Profissional nao informado"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--theme-text-primary)]">
                      {start.setLocale("pt-BR").toFormat("dd/LL/yyyy 'as' HH:mm")} -{" "}
                      {end.toFormat("HH:mm")}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
