import { colors } from "@/design-system";

const MAX_SERVICE_DURATION = 960;

export interface DurationHelperProps {
  durationInMinutes: number;
  averageWorkingHoursPerDay?: number;
  className?: string;
}

export function DurationHelper({
  durationInMinutes,
  averageWorkingHoursPerDay = 10,
  className,
}: DurationHelperProps) {
  if (durationInMinutes <= MAX_SERVICE_DURATION) {
    return null;
  }

  const estimatedDays = Math.ceil(durationInMinutes / (averageWorkingHoursPerDay * 60));

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 ${className ?? ""}`}
      role="note"
    >
      <span aria-hidden="true" className="text-base">
        &#9432;
      </span>
      <p className="text-sm leading-5" style={{ color: colors.text.soft }}>
        Servico multi-dia: estima {estimatedDays} {estimatedDays === 1 ? "dia" : "dias"} (baseado em
        expediente medio {averageWorkingHoursPerDay}h/dia)
      </p>
    </div>
  );
}
