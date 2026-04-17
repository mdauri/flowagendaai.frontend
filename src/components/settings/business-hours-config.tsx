import { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/flow/button";
import { tenantService, type BusinessHour } from "@/services/tenant-service";
import { colors, semanticTokens } from "@/design-system";

interface DayConfigRowProps {
  config: BusinessHour;
  onChange: (config: BusinessHour) => void;
  disabled?: boolean;
}

function DayConfigRow({ config, onChange, disabled }: DayConfigRowProps) {
  const handleToggle = () => {
    const nextIsOpen = !config.isOpen;
    onChange({
      ...config,
      isOpen: nextIsOpen,
      // Se estiver abrindo e não tiver horário, coloca o padrão para garantir que o state tenha valor
      startTime: nextIsOpen && !config.startTime ? "08:00" : config.startTime,
      endTime: nextIsOpen && !config.endTime ? "18:00" : config.endTime,
    });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, startTime: e.target.value });
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...config, endTime: e.target.value });
  };

  // Simple translation for display
  const dayLabels: Record<string, string> = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <div className="flex flex-col gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <div className="flex items-center gap-3">
        {/* Custom Switch Implementation */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          style={{
            backgroundColor: config.isOpen
              ? colors.brand.primary
              : "rgba(255,255,255,0.1)",
          }}
          aria-checked={config.isOpen}
          role="switch"
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.isOpen ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-white/90">
          {dayLabels[config.dayName] || config.dayName}
        </span>
      </div>

      <div className="flex items-center gap-2 pl-14 sm:pl-0">
        <input
          type="time"
          value={config.startTime || "08:00"}
          onChange={handleStartTimeChange}
          disabled={disabled || !config.isOpen}
          className={`rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none transition-opacity focus:border-white/20 ${
            !config.isOpen ? "opacity-30" : "opacity-100"
          }`}
        />
        <span
          className={`text-xs text-white/40 ${!config.isOpen ? "opacity-30" : "opacity-100"}`}
        >
          até
        </span>
        <input
          type="time"
          value={config.endTime || "18:00"}
          onChange={handleEndTimeChange}
          disabled={disabled || !config.isOpen}
          className={`rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none transition-opacity focus:border-white/20 ${
            !config.isOpen ? "opacity-30" : "opacity-100"
          }`}
        />
      </div>
    </div>
  );
}

export function BusinessHoursConfig() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchHours = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantService.getBusinessHours();
      setHours(response.businessHours);
    } catch (err) {
      setError("Não foi possível carregar o horário de funcionamento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  const handleDayChange = (index: number, newConfig: BusinessHour) => {
    const newHours = [...hours];
    newHours[index] = newConfig;
    setHours(newHours);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Basic client validation
      for (const h of hours) {
        if (h.isOpen) {
          const start = h.startTime || "08:00";
          const end = h.endTime || "18:00";
          if (start >= end) {
            throw new Error(
              `Horário de término deve ser posterior ao inicial na ${h.dayName}.`,
            );
          }
        }
      }

      await tenantService.updateBusinessHours({
        businessHours: hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          isOpen: h.isOpen,
          startTime: h.startTime || "08:00",
          endTime: h.endTime || "18:00",
        })),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar horários.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Loader2 size={24} className="animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Clock size={20} style={{ color: colors.brand.primary }} />
        <h2 className="text-lg font-bold text-white">
          Horário de Funcionamento
        </h2>
      </div>

      <div className="space-y-4">
        {hours.map((h, index) => (
          <DayConfigRow
            key={h.dayOfWeek}
            config={h}
            onChange={(newConfig) => handleDayChange(index, newConfig)}
            disabled={saving}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving} size="md">
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar Horários"
          )}
        </Button>

        {success && (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.10)] px-3 py-2 text-sm text-[#4ADE80]"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} />
            Atualizado com sucesso.
          </div>
        )}

        {error && (
          <div
            className="flex items-center gap-2 rounded-lg border border-[rgba(248,113,113,0.28)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm text-[#F87171]"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
