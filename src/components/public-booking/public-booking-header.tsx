import type { PublicProfessional } from "@/types/public-booking";

export function PublicBookingHeader({ professional }: { professional: PublicProfessional }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#171923] via-[#1f1f3d] to-[#2a2a5a] p-6 text-white shadow-[0_25px_60px_rgba(15,23,42,0.6)]">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-xl font-black text-white/80">
          {professional.name.charAt(0)}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Agendamento Público</p>
          <h1 className="mt-1 text-3xl font-black leading-tight">{professional.name}</h1>
          <p className="text-sm text-white/70">@{professional.slug}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm uppercase tracking-wide text-white/70">
          <span className="block text-xs text-white/40">Timezone</span>
          <span className="text-base font-semibold text-white">{professional.tenantTimezone}</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm uppercase tracking-wide text-white/70">
          <span className="block text-xs text-white/40">Link</span>
          <span className="text-base font-semibold text-white">{`/p/${professional.slug}`}</span>
        </div>
      </div>
    </section>
  );
}
