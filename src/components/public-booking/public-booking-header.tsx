import type { PublicProfessional } from "@/types/public-booking";
import { Card, CardTitle } from "@/components/flow/card";
import { colors } from "@/design-system";

export function PublicBookingHeader({ professional }: { professional: PublicProfessional }) {
  return (
    <Card variant="premium" padding="lg" className="relative overflow-hidden w-full">
      <div className="relative z-10 flex items-center gap-4">
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black shadow-inner ring-1 ring-white/5"
          style={{ backgroundColor: colors.background.glass, color: colors.text.primary }}
        >
          {professional.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: colors.text.muted }}>
            Agendamento Público
          </p>
          <CardTitle className="mt-1 leading-tight">{professional.name}</CardTitle>
          <p className="text-sm font-medium mt-0.5" style={{ color: colors.text.soft }}>
            @{professional.slug}
          </p>
        </div>
      </div>
      <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
        <div 
          className="flex flex-col rounded-2xl border p-4 text-sm tracking-wide"
          style={{ backgroundColor: colors.background.glassSubtle, borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="block text-[10px] uppercase font-bold" style={{ color: colors.text.muted }}>Fuso Horário</span>
          <span className="mt-1 text-sm font-semibold capitalize" style={{ color: colors.text.primary }}>{professional.tenantTimezone}</span>
        </div>
        <div 
          className="flex flex-col rounded-2xl border p-4 text-sm tracking-wide"
          style={{ backgroundColor: colors.background.glassSubtle, borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="block text-[10px] uppercase font-bold" style={{ color: colors.text.muted }}>Link Público</span>
          <span className="mt-1 text-sm font-semibold truncate" style={{ color: colors.text.primary }}>{`/p/${professional.slug}`}</span>
        </div>
      </div>
    </Card>
  );
}
