import { Button } from "@/components/flow/button";
import { generatePublicBookingICS } from "@/lib/ics";
import { DateTime } from "luxon";
import type { CreatePublicBookingResponse } from "@/types/public-booking";
import { useState } from "react";

interface BookingSuccessProps {
  booking: CreatePublicBookingResponse;
  timezone: string;
  shareUrl: string;
  onNewBooking: () => void;
}

export function BookingSuccess({ booking, timezone, shareUrl, onNewBooking }: BookingSuccessProps) {
  const [copied, setCopied] = useState(false);
  const startDate = DateTime.fromISO(booking.start, { zone: "utc" }).setZone(timezone);
  const endDate = DateTime.fromISO(booking.end, { zone: "utc" }).setZone(timezone);

  const handleAddToCalendar = () => {
    const blob = generatePublicBookingICS({
      id: booking.id,
      start: booking.start,
      end: booking.end,
      summary: `Agendamento com ${booking.professionalName}`,
      description: `Serviço: ${booking.serviceName}`,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agendamento.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Agendamento confirmado", url: shareUrl });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-success-500/40 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500/20 text-3xl text-success-500">✓</div>
        <h2 className="text-2xl font-black text-white">Agendamento confirmado!</h2>
        <p className="text-sm text-white/70">Recebemos a confirmação do seu horário.</p>
      </div>
      <div className="space-y-1 rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-white/60">Serviço</p>
        <p className="text-lg font-semibold text-white">{booking.serviceName}</p>
        <p className="text-sm text-white/70">{booking.professionalName}</p>
        <p className="text-sm text-white/70">
          {startDate.setLocale("pt-BR").toFormat("cccc, d 'de' LLLL")}
        </p>
        <p className="text-sm text-white/70">
          {startDate.toFormat("HH:mm")} – {endDate.toFormat("HH:mm")}
        </p>
        <p className="text-sm text-white/70">WhatsApp: {booking.customerPhone}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full" variant="secondary" onClick={handleAddToCalendar} size="md">
          Adicionar ao calendário
        </Button>
        <Button className="w-full" variant="primary" onClick={onNewBooking} size="md">
          Fazer novo agendamento
        </Button>
      </div>
      <Button className="w-full" variant="ghost" onClick={handleShare} size="md">
        {copied ? "Link copiado" : "Compartilhar"}
      </Button>
    </div>
  );
}
