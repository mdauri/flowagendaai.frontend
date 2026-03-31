import { Card } from "@/components/flow/card";
import { Input } from "@/components/flow/input";
import { formatBrazilianPhone } from "@/utils/phone";
import { DateTime } from "luxon";
import type { PublicServiceItem } from "@/types/public-booking";

interface CustomerDataFormProps {
  name: string;
  phone: string;
  notes: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  errors?: {
    name?: string;
    phone?: string;
  };
}

export function CustomerDataForm({
  name,
  phone,
  notes,
  onNameChange,
  onPhoneChange,
  onNotesChange,
  errors,
}: CustomerDataFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-white">
          Nome completo *
        </label>
        <Input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Seu nome"
          inputSize="lg"
        />
        {errors?.name ? (
          <p className="mt-1 text-xs text-danger-500" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white">WhatsApp *</label>
        <Input
          value={phone || "+55 "}
          onChange={(event) => onPhoneChange(formatBrazilianPhone(event.target.value))}
          placeholder="+55 (11) 9xxxx-xxxx"
          inputSize="lg"
        />
        {errors?.phone ? (
          <p className="mt-1 text-xs text-danger-500" role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="customer-notes" className="mb-2 block text-sm font-semibold text-white">Observação (opcional)</label>
        <textarea
          id="customer-notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500"
          rows={4}
          maxLength={200}
          placeholder="Conte para o profissional sobre seu estilo, alergias, etc."
        />
        <div className="mt-1 text-xs text-white/60 text-right" aria-live="polite">
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
    <Card variant="glass" padding="lg" className="space-y-2">
      <p className="text-sm text-white/60">Resumo do agendamento</p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-base font-semibold text-white">{service.name}</p>
        <p className="text-sm text-white/60">{service.durationInMinutes} minutos</p>
        <p className="mt-3 text-sm text-white/80">
          {date.setLocale("pt-BR").toFormat("cccc, d 'de' LLLL")}
        </p>
        <p className="text-sm text-white/70">
          {startDate.toFormat("HH:mm")} – {endDate.toFormat("HH:mm")}
        </p>
        <p className="text-sm text-white/70">Com: {professionalName}</p>
        <p className="text-sm text-white/70">WhatsApp: {customerPhone}</p>
      </div>
    </Card>
  );
}
