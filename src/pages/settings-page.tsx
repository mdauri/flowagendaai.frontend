import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { GeolocationAddressInput } from "@/components/settings/geolocation-address-input";
import { CoverImageUpload } from "@/components/settings/cover-image-upload";
import { LogoUpload } from "@/components/settings/logo-upload";
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
        <Loader2 size={24} className="animate-spin text-white/55" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1
          className="text-2xl font-black text-white"
          style={{ letterSpacing: "-0.025em" }}
        >
          Configuracoes do Tenant
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Gerencie as informacoes publicas do seu tenant.
        </p>
      </div>

      {/* Tenant Profile Section */}
      <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="text-lg font-bold text-white">Perfil Publico</h2>

        {/* Tenant Name */}
        <div className="space-y-2">
          <label
            htmlFor="tenant-name"
            className="block text-sm font-medium text-white/70"
          >
            Nome do Tenant
          </label>
          <Input
            id="tenant-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do seu tenant"
            disabled={saveState === "saving"}
            maxLength={200}
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/70">
            Logo do Tenant
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
          <label className="block text-sm font-medium text-white/70">
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

      {/* Save Button and Feedback */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saveState === "saving"}
          size="md"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar"
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
