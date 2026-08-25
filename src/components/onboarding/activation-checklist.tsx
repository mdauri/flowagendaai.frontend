import * as React from "react";
import { Check, ChevronRight, CircleHelp, ExternalLink, Play, RotateCcw, X } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/flow/card";
import { Button } from "@/components/flow/button";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { useActivationQuery } from "@/hooks/use-activation-query";
import { useSetOnboardingVisibilityMutation } from "@/hooks/use-set-onboarding-visibility-mutation";
import { onboardingService } from "@/services/onboarding-service";
import { getOnboardingVideoManifest } from "@/services/onboarding-video-manifest";
import type { ActivationItem } from "@/types/onboarding";

interface ActivationChecklistProps { onNavigate: (href: string) => void; }

const activationHelpByItemId: Record<string, string> = {
  company_data: "/ajuda/primeiros-passos/configurar-empresa",
  business_hours: "/ajuda/primeiros-passos/configurar-horarios",
  first_professional: "/ajuda/primeiros-passos/primeiro-profissional",
  first_service: "/ajuda/primeiros-passos/primeiro-servico",
  appearance: "/ajuda/pagina-publica/personalizar-pagina",
  notifications: "/ajuda/notificacoes/configurar-lembretes",
  test_booking: "/ajuda/primeiros-passos/agendamento-de-teste",
  publish: "/ajuda/primeiros-passos/publicar-agenda",
};

export function ActivationChecklist({ onNavigate }: ActivationChecklistProps) {
  const query = useActivationQuery();
  const [videoItem, setVideoItem] = React.useState<ActivationItem | null>(null);
  const [testBusy, setTestBusy] = React.useState(false);
  const [publishBusy, setPublishBusy] = React.useState(false);
  const [testError, setTestError] = React.useState<string | null>(null);
  const [videoVersions, setVideoVersions] = React.useState<Record<string, string>>({});
  const [confirmDismiss, setConfirmDismiss] = React.useState(false);
  const [visibilityError, setVisibilityError] = React.useState<string | null>(null);
  const videoTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const dismissTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const visibilityMutation = useSetOnboardingVisibilityMutation();

  React.useEffect(() => {
    let active = true;
    void getOnboardingVideoManifest().then((manifest) => {
      if (active && manifest) setVideoVersions(manifest.videos);
    });
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    if (!videoItem) {
      videoTriggerRef.current?.focus();
      return;
    }
    document.getElementById("activation-video-close")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVideoItem(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [videoItem]);

  React.useEffect(() => {
    if (confirmDismiss) {
      document.getElementById("activation-dismiss-cancel")?.focus();
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setConfirmDismiss(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    } else {
      dismissTriggerRef.current?.focus();
    }
    return undefined;
  }, [confirmDismiss]);

  function closeVideo() {
    setVideoItem(null);
  }

  async function dismiss() {
    setVisibilityError(null);
    try {
      await visibilityMutation.mutateAsync("DISMISSED");
      setConfirmDismiss(false);
    } catch (error) {
      setVisibilityError(error instanceof Error ? error.message : "Não foi possível ocultar o checklist.");
    }
  }

  if (query.isLoading) return <Card aria-label="Carregando checklist de ativacao" className="animate-pulse"><div className="h-24 rounded-xl bg-white/5" /></Card>;
  if (query.isError || !query.data) return <div className="grid gap-3"><FeedbackBanner tone="danger" title="Nao foi possivel carregar a ativacao" description="Tente novamente para ver os proximos passos do seu tenant." /><Button variant="secondary" size="sm" className="w-fit" onClick={() => query.refetch()}><RotateCcw size={14} /> Tentar novamente</Button></div>;

  const status = query.data;
  if (status.visibility === "DISMISSED") return null;

  const hideAction = (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Ocultar configuração inicial"
      title="Ocultar configuração inicial"
      onClick={(event) => { dismissTriggerRef.current = event.currentTarget; setVisibilityError(null); setConfirmDismiss(true); }}
      disabled={visibilityMutation.isPending}
      className="h-10 w-10 shrink-0 p-0"
    >
      <X size={18} aria-hidden="true" />
    </Button>
  );

  if (status.isComplete) return <Card variant="premium" padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-testid="activation-compact"><div><CardTitle className="text-lg">Ativacao concluida</CardTitle><CardDescription className="mt-1">Sua agenda esta pronta para receber agendamentos.</CardDescription></div><div className="flex flex-wrap items-center gap-2">{hideAction}{status.publicUrl ? <Button as="a" href={status.publicUrl} target="_blank" rel="noreferrer" variant="secondary" size="sm"><ExternalLink size={14} /> Ver pagina publica</Button> : null}</div></Card>;

  async function startTest() {
    setTestBusy(true); setTestError(null);
    try {
      const session = await onboardingService.createTestSession();
      window.location.assign(`${session.bookingUrl}?onboardingTest=${encodeURIComponent(session.token)}`);
    } catch (error) { setTestError(error instanceof Error ? error.message : "Nao foi possivel iniciar o teste."); } finally { setTestBusy(false); }
  }

  async function publishNow() {
    setPublishBusy(true); setTestError(null);
    try {
      const result = await onboardingService.publish();
      await query.refetch();
      window.open(result.publicUrl, "_blank", "noopener,noreferrer");
    } catch (error) { setTestError(error instanceof Error ? error.message : "Nao foi possivel publicar agora."); } finally { setPublishBusy(false); }
  }

  return <Card variant="premium" padding="md" data-testid="activation-checklist">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Ativacao da agenda</p><CardTitle className="mt-2 text-xl">Voce esta a {status.remainingSteps} passos de comecar a receber agendamentos.</CardTitle><CardDescription className="mt-2">Conclua cada etapa quando a configuracao real estiver pronta.</CardDescription></div><div className="flex items-center justify-between gap-2 sm:justify-end">{hideAction}<span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-text-soft">{8 - status.remainingSteps}/8</span></div></div>
    {visibilityError ? <p role="alert" className="mt-3 text-sm text-red-300">{visibilityError}</p> : null}
    {testError ? <p role="alert" className="mt-3 text-sm text-red-300">{testError}</p> : null}
    <ol className="mt-5 grid gap-2" aria-label="Etapas de ativacao">{status.items.map((item) => { const completed = item.status === "COMPLETED"; const helpHref = activationHelpByItemId[item.id]; return <li key={item.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 bg-black/10 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${completed ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-text-soft"}`} aria-hidden="true">{completed ? <Check size={15} /> : <CircleHelp size={15} />}</span><div className="min-w-0"><p className="font-semibold text-text-primary">{item.label}</p><p className="text-sm text-text-soft">{completed ? "Concluida" : item.reason}</p></div></div><div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{!completed ? <><Button variant="ghost" size="sm" onClick={() => { videoTriggerRef.current = document.activeElement as HTMLButtonElement; setVideoItem(item); }}><Play size={14} /> Ver como fazer</Button>{item.id === "test_booking" ? <Button size="sm" onClick={() => void startTest()} disabled={testBusy}>{testBusy ? "Abrindo..." : "Configurar agora"}</Button> : item.id === "publish" ? <Button size="sm" onClick={() => void publishNow()} disabled={publishBusy}>{publishBusy ? "Publicando..." : "Publicar link"}</Button> : <Button size="sm" onClick={() => onNavigate(item.href)}>Configurar agora <ChevronRight size={14} /></Button>}</> : null}{helpHref ? <a className="inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold text-secondary underline-offset-4 hover:underline" href={helpHref}>Ver ajuda</a> : null}</div></li>; })}</ol>
    {confirmDismiss ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="activation-dismiss-title" aria-describedby="activation-dismiss-description"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl"><h2 id="activation-dismiss-title" className="text-xl font-black text-text-primary">Ocultar checklist?</h2><p id="activation-dismiss-description" className="mt-2 text-sm leading-6 text-text-soft">Ainda existem etapas de configuração pendentes. Você poderá reabrir este checklist depois.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button id="activation-dismiss-cancel" variant="secondary" size="sm" onClick={() => setConfirmDismiss(false)} disabled={visibilityMutation.isPending}>Continuar mostrando</Button><Button variant="primary" size="sm" onClick={() => void dismiss()} disabled={visibilityMutation.isPending}>{visibilityMutation.isPending ? "Ocultando..." : "Ocultar checklist"}</Button></div></div></div> : null}
    {videoItem ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="activation-video-title" onClick={(event) => { if (event.target === event.currentTarget) closeVideo(); }}><div className="w-full max-w-xl rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="activation-video-title" className="text-xl font-black text-text-primary">Como configurar: {videoItem.label}</h2><p className="mt-1 text-sm text-text-soft">Video curto e focado em uma unica tarefa.</p></div><Button id="activation-video-close" variant="ghost" size="sm" aria-label="Fechar video" onClick={closeVideo}>Fechar</Button></div><video className="mt-5 aspect-video w-full rounded-xl bg-black/30" controls preload="metadata" aria-label={`Video: ${videoItem.label}`} src={`/onboarding-videos/${videoItem.videoKey}.webm${videoVersions[videoItem.videoKey] ? `?v=${videoVersions[videoItem.videoKey]}` : ""}`}><track kind="captions" /></video><p className="mt-2 text-xs text-text-soft">Se o video ainda nao estiver publicado, use o texto da etapa e configure agora.</p><Button className="mt-5 w-full" onClick={() => { closeVideo(); onNavigate(videoItem.href); }}>Configurar agora</Button></div></div> : null}
  </Card>;
}
