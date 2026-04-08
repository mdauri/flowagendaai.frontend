import { AlertCircle } from "lucide-react";
import type { BulkActionBarProps } from "@/types/professional-service";
import { Button } from "./flow/button";

export function BulkActionBar({
  selectedCount,
  onAssociateSelected,
  onRemoveSelected,
  onClearSelection,
  disableAssociate = false,
  disableRemove = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10"
      role="region"
      aria-label="Bulk actions"
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        <span className="font-semibold text-amber-400">
          {selectedCount} {selectedCount === 1 ? "professional" : "professionals"}{" "}
          selected
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-white/70 hover:text-white"
        >
          Clear
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onAssociateSelected}
          className="h-10 px-4"
          disabled={disableAssociate}
        >
          Associate Selected
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveSelected}
          className="h-10 px-4 text-white/70 hover:text-white"
          disabled={disableRemove}
        >
          Remove Selected
        </Button>
      </div>
    </div>
  );
}
