import { Card, CardTitle, CardDescription } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { formatBrazilianPhone } from "@/utils/phone";
import { DateTime } from "luxon";
import { colors, radius, semanticTokens, typography } from "@/design-system";
import type { PublicServiceItem } from "@/types/public-booking";

interface CustomerDataFormProps {
  name: string;
  phone: string;
  email: string;
  notes: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  errors?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export function CustomerDataForm({
  name,
  phone,
  email,
  notes,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onNotesChange,
  errors,
}: CustomerDataFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: colors.text.soft }}>
          Nome completo *
        </label>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Seu nome"
          inputSize="lg"
        />
        {errors?.name ? (
          <p className="mt-1 text-xs" style={{ color: semanticTokens.feedback.danger.text }} role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: colors.text.soft }}>WhatsApp *</label>
        <Input
          value={phone || "+55 "}
          onChange={(event) => onPhoneChange(formatBrazilianPhone(event.target.value))}
          placeholder="+55 (11) 9xxxx-xxxx"
          inputSize="lg"
        />
        {errors?.phone ? (
          <p className="mt-1 text-xs" style={{ color: semanticTokens.feedback.danger.text }} role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium" style={{ color: colors.text.soft }}>
          E-mail para notificacoes (opcional)
        </label>
        <Input
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="voce@exemplo.com"
          inputSize="lg"
          type="email"
        />
        {errors?.email ? (
          <p className="mt-1 text-xs" style={{ color: semanticTokens.feedback.danger.text }} role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="customer-notes" className="mb-2 block text-sm font-medium" style={{ color: colors.text.soft }}>Observação (opcional)</label>
        <textarea
          id="customer-notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className="w-full text-sm outline-none transition-all focus-visible:[border-color:var(--control-focus-border)] focus-visible:[box-shadow:var(--control-focus-ring)] placeholder:text-white/30"
          rows={4}
          maxLength={200}
          placeholder="Conte para o profissional sobre seu estilo, alergias, etc."
          style={{
             borderRadius: radius.xl,
             backgroundColor: semanticTokens.surface.glass,
             borderColor: semanticTokens.border.subtle,
             borderWidth: 1,
             padding: "1rem",
             color: colors.text.primary,
             fontFamily: typography.family.sans,
             backdropFilter: `blur(${semanticTokens.blur.panel})`,
             "--control-focus-border": semanticTokens.interaction.focus.border,
             "--control-focus-ring": semanticTokens.interaction.focus.ring
          } as React.CSSProperties}
        />
        <div className="mt-1 text-xs text-right" style={{ color: colors.text.muted }} aria-live="polite">
          {notes.length}/200
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  service: PublicServiceItem;
  date: DateTime;
  slotStart: string;
  slotEnd: string;
  professionalName: string;
  timezone: string;
  customerPhone: string;
}

export function SummaryCard({
  service,
  date,
  slotStart,
  slotEnd,
  professionalName,
  timezone,
  customerPhone,
}: SummaryCardProps) {
  const startDate = DateTime.fromISO(slotStart, { zone: "utc" }).setZone(timezone);
  const endDate = DateTime.fromISO(slotEnd, { zone: "utc" }).setZone(timezone);

  return (
    <Card variant="surface" padding="lg" className="space-y-4">
      <CardDescription>Resumo do agendamento</CardDescription>
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: semanticTokens.border.subtle, backgroundColor: semanticTokens.surface.glassSubtle }}
      >
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <p className="mt-1 text-sm font-medium" style={{ color: colors.text.muted }}>{service.durationInMinutes} minutos</p>

        {service.description && (
          <p
            className="mt-2 text-sm"
            style={{ color: colors.text.soft, whiteSpace: "pre-wrap" }}
          >
            {service.description}
          </p>
        )}

        <div className="mt-4 pt-4 border-t" style={{ borderColor: semanticTokens.border.default }}>
          <p className="font-semibold" style={{ color: colors.text.primary }}>
            {date.setLocale("pt-BR").toFormat("cccc, d 'de' LLLL")}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold" style={{ color: colors.brand.primary }}>
              {startDate.toFormat("HH:mm")}
            </span>
            <span className="text-sm font-medium" style={{ color: colors.text.soft }}>
              – {endDate.toFormat("HH:mm")}
            </span>
          </p>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium" style={{ color: colors.text.soft }}>
            Com: <span style={{ color: colors.text.primary }}>{professionalName}</span>
          </p>
          <p className="text-sm font-medium" style={{ color: colors.text.soft }}>
            WhatsApp: <span style={{ color: colors.text.primary }}>{customerPhone}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
