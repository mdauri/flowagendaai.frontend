import { Check } from "lucide-react";
import type { ProfessionalItemProps } from "@/types/professional-service";
import { getAvatarColor, getInitials } from "@/lib/avatar-color";
import { Checkbox } from "@/components/flow/checkbox";

export function ProfessionalItem({
  professional,
  isSelected,
  onToggle,
  serviceId,
  style,
}: ProfessionalItemProps) {
  const isAssociated = professional.services.some((s) => s.id === serviceId);
  const hasNoServices = professional.services.length === 0;
  const avatarColor = getAvatarColor(professional.id);
  const initials = getInitials(professional.name);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
      style={style}
      role="listitem"
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="h-5 w-5 flex-shrink-0"
        aria-label={`Select ${professional.name}`}
      />

      {/* Avatar */}
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
        style={{ backgroundColor: avatarColor }}
        aria-hidden="true"
      >
        {professional.photoUrl ? (
          <img
            src={professional.photoUrl}
            alt={professional.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">
          {professional.name}
        </div>
        {professional.role && (
          <div className="text-sm text-white/70 truncate">
            {professional.role}
          </div>
        )}
        <div className="text-xs text-white/55 mt-1">
          {professional.serviceCount}{" "}
          {professional.serviceCount === 1 ? "service" : "services"}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {hasNoServices ? (
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            No services
          </div>
        ) : isAssociated ? (
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <Check className="h-4 w-4" />
            Associated
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/55 border border-white/10">
            Not assigned
          </div>
        )}
      </div>
    </div>
  );
}
