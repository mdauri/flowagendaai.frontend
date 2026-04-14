import { Button } from "@/components/flow/button";
import { Card, CardTitle, CardDescription } from "@/components/flow/card";
import { MultiDayBadge } from "@/components/slots/multi-day-badge";
import { AffectedDaysList } from "@/components/slots/affected-days-list";
import { generatePublicBookingICS } from "@/lib/ics";
import { DateTime } from "luxon";
import { colors, semanticTokens } from "@/design-system";
import type { CreatePublicBookingResponse, DaySegment } from "@/types/public-booking";
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
  const isMultiDay = booking.daysAffected && booking.daysAffected.length > 0;
  const daysAffected = booking.daysAffected as DaySegment[] | undefined;

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
      <div
         className="flex flex-col items-center gap-4 rounded-[2rem] border p-8 text-center"
         style={{
            backgroundColor: semanticTokens.feedback.success.background,
            borderColor: semanticTokens.feedback.success.border
         }}
      >
        <div
           className="flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-sm"
           style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: semanticTokens.feedback.success.text }}
        >✓</div>
        <div>
           <h2 className="text-2xl font-black" style={{ color: colors.text.primary }}>Agendamento confirmado!</h2>
           <p className="mt-2 text-sm font-medium" style={{ color: semanticTokens.feedback.success.text }}>Recebemos a confirmação do seu horário.</p>
           {isMultiDay && (
             <div className="mt-2">
               <MultiDayBadge daysCount={booking.daysAffected!.length} variant="full" />
             </div>
           )}
        </div>
      </div>

      <Card variant="surface" padding="lg" className="space-y-4">
        <CardDescription>Serviço</CardDescription>
        <CardTitle className="text-xl">{booking.serviceName}</CardTitle>
        <div className="mt-4 pt-4 border-t space-y-1.5 text-sm font-medium flex flex-col" style={{ color: colors.text.soft, borderColor: semanticTokens.border.default }}>
          <p>Com: <span style={{ color: colors.text.primary }}>{booking.professionalName}</span></p>
          <p>{startDate.setLocale("pt-BR").toFormat("cccc, d 'de' LLLL")}</p>
          <p>{startDate.toFormat("HH:mm")} – {endDate.toFormat("HH:mm")}</p>
          {isMultiDay && (
            <p>
              ({endDate.setLocale("pt-BR").toFormat("cccc, d 'de' LLLL")})
            </p>
          )}
          <p>WhatsApp: <span style={{ color: colors.text.primary }}>{booking.customerPhone}</span></p>
        </div>

        {isMultiDay && daysAffected && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: semanticTokens.border.default }}>
            <AffectedDaysList days={daysAffected} timezone={timezone} />
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row pt-2">
        <Button className="w-full" variant="secondary" onClick={handleAddToCalendar} size="md">
           Adicionar ao calendário
        </Button>
        <Button className="w-full" variant="primary" onClick={onNewBooking} size="md">
          Novo agendamento
        </Button>
      </div>
      <div className="flex justify-center">
        <Button className="w-full" variant="ghost" onClick={handleShare} size="md">
          {copied ? "Link copiado" : "Compartilhar"}
        </Button>
      </div>
    </div>
  );
}
