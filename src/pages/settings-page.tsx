import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { GeolocationAddressInput } from "@/components/settings/geolocation-address-input";
import { CoverImageUpload } from "@/components/settings/cover-image-upload";
import { LogoUpload } from "@/components/settings/logo-upload";
import { BusinessHoursConfig } from "@/components/settings/business-hours-config";
import { tenantService } from "@/services/tenant-service";
import { tenantCoverImageService } from "@/services/tenant-cover-image-service";
import { tenantLogoImageService } from "@/services/tenant-logo-image-service";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type SaveState = "idle" | "saving" | "success" | "error";

export function SettingsPage() {
  const auth = useAuth();
  const tenant = auth.tenant;

  const [name, setName] = useState(tenant?.name ?? "");
  const [publicAddress, setPublicAddress] = useState(tenant?.publicAddress ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    tenant?.coverImageUrl ?? null
  );
  const [coverThumbUrl, setCoverThumbUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    tenant?.logoUrl ?? null
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [coverRemoveError, setCoverRemoveError] = useState<string | null>(null);
  const [logoRemoveError, setLogoRemoveError] = useState<string | null>(null);

  const handleCoverUploadComplete = useCallback(
    (url: string, thumbUrl: string) => {
      setCoverImageUrl(url);
      setCoverThumbUrl(thumbUrl);
    },
    []
  );

  const handleCoverRemove = useCallback(async () => {
    setCoverRemoveError(null);
    try {
      await tenantCoverImageService.removeCoverImage();
      setCoverImageUrl(null);
      setCoverThumbUrl(null);
    } catch {
      setCoverRemoveError(
        "Nao foi possivel remover a imagem de capa. Tente novamente."
      );
    }
  }, []);

  const handleLogoUploadComplete = useCallback((url: string) => {
    setLogoUrl(url);
  }, []);

  const handleLogoRemove = useCallback(async () => {
    setLogoRemoveError(null);
    try {
      await tenantLogoImageService.removeLogo();
      setLogoUrl(null);
    } catch {
      setLogoRemoveError(
        "Nao foi possivel remover a logo. Tente novamente."
      );
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setSaveError(null);

    try {
      await tenantService.updateTenant({
        name: name.trim(),
        publicAddress: publicAddress.trim() || null,
        coverImageUrl,
        logoUrl,
      });

      setSaveState("success");
      // Reset success state after 3 seconds
      setTimeout(() => setSaveState("idle"), 3000);

      // Refetch current user to update auth context
      auth.refetchCurrentUser();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save settings.";
      setSaveError(message);
      setSaveState("error");
    }
  }, [name, publicAddress, coverImageUrl, logoUrl, auth]);

  if (auth.isBootstrapping || !tenant) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-text-soft" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl min-w-0 space-y-6">
      <div>
        <h1
          className="text-2xl font-black text-[var(--theme-text-primary)]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Configuracoes
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Informacoes exibidas no catalogo.
        </p>
      </div>

      {/* Tenant Profile Section */}
      <section className="space-y-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-surface-glass)] p-4 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-[var(--theme-text-primary)]">Perfil Publico</h2>

        {/* Tenant Name */}
        <div className="space-y-2">
          <label
            htmlFor="tenant-name"
            className="block text-sm font-medium text-text-soft"
          >
            Nome do estabelecimento
          </label>
          <Input
            id="tenant-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do seu negocio"
            disabled={saveState === "saving"}
            maxLength={200}
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-soft">
            Logo
          </label>
          <LogoUpload
            logoUrl={logoUrl}
            onUploadComplete={handleLogoUploadComplete}
            onRemove={handleLogoRemove}
            disabled={saveState === "saving"}
          />
          {logoRemoveError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
              style={{ color: "#F87171" }}
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={14} aria-hidden="true" />
              {logoRemoveError}
            </div>
          )}
        </div>

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-soft">
            Imagem de Capa
          </label>
          <CoverImageUpload
            coverImageUrl={coverImageUrl}
            coverThumbnailUrl={coverThumbUrl}
            onUploadComplete={handleCoverUploadComplete}
            onRemove={handleCoverRemove}
            disabled={saveState === "saving"}
          />
          {coverRemoveError && (
            <div
              className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
              style={{ color: "#F87171" }}
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle size={14} aria-hidden="true" />
              {coverRemoveError}
            </div>
          )}
        </div>

        {/* Public Address */}
        <GeolocationAddressInput
          value={publicAddress}
          onChange={setPublicAddress}
          disabled={saveState === "saving"}
        />
      </section>

      {/* Business Hours Section */}
      <BusinessHoursConfig />

      {/* Save Button and Feedback */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={handleSave}
          disabled={saveState === "saving"}
          size="md"
          className="w-full sm:w-auto"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar perfil"
          )}
        </Button>

        {saveState === "success" && (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm"
            style={{ color: "#4ADE80" }}
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Configuracoes salvas com sucesso.
          </div>
        )}

        {saveState === "error" && saveError && (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm"
            style={{ color: "#F87171" }}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={16} aria-hidden="true" />
            {saveError}
          </div>
        )}
      </div>
    </div>
  );
}
