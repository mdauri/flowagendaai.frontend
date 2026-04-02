import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle, Save, XCircle } from "lucide-react";
import { useProfessionalsWithServicesQuery } from "@/hooks/use-professionals-with-services-query";
import { useBulkAssociateMutation } from "@/hooks/use-bulk-associate-mutation";
import { useBulkDissociateMutation } from "@/hooks/use-bulk-dissociate-mutation";
import type { ProfessionalFilterStatus, ProfessionalWithServices } from "@/types/professional-service";
import { ProfessionalList } from "./professional-list";
import { BulkActionBar } from "./bulk-action-bar";
import { SearchFilter } from "./search-filter";
import { Button } from "./flow/button";
import { Card } from "./flow/card";

export function ProfessionalServiceManager() {
  const { id: serviceId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Local state
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProfessionalFilterStatus>("all");

  // React Query
  const { data, isLoading, error, refetch } = useProfessionalsWithServicesQuery();
  const bulkAssociate = useBulkAssociateMutation();
  const bulkDissociate = useBulkDissociateMutation();

  const hasPendingChanges = selectedProfessionalIds.size > 0;
  const isSaving = bulkAssociate.isPending || bulkDissociate.isPending;

  // Filtered professionals
  const filteredProfessionals = useMemo(() => {
    if (!data) return [];

    return data.professionals.filter((professional: ProfessionalWithServices) => {
      // Search filter
      const matchesSearch = professional.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Status filter
      const isAssociated = professional.services.some((s) => s.id === serviceId);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "associated" && isAssociated) ||
        (filterStatus === "not-associated" && !isAssociated) ||
        (filterStatus === "no-services" && professional.services.length === 0);

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, filterStatus, serviceId]);

  // Handlers
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedProfessionalIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleAssociateSelected = async () => {
    await bulkAssociate.mutateAsync({
      professionalIds: Array.from(selectedProfessionalIds),
      serviceId: serviceId!,
    });
    setSelectedProfessionalIds(new Set());
  };

  const handleRemoveSelected = async () => {
    await bulkDissociate.mutateAsync({
      professionalIds: Array.from(selectedProfessionalIds),
      serviceId: serviceId!,
    });
    setSelectedProfessionalIds(new Set());
  };

  const handleClearSelection = () => {
    setSelectedProfessionalIds(new Set());
  };

  // Render states
  if (isLoading) {
    return <ProfessionalListSkeleton />;
  }

  if (error) {
    return (
      <Card variant="surface" padding="lg" className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Failed to load professionals
            </h3>
            <p className="text-sm text-white/55 mt-1">
              Something went wrong. Please try again.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const associatedCount = data?.professionals.filter((p: ProfessionalWithServices) =>
    p.services.some((s) => s.id === serviceId)
  ).length || 0;

  return (
    <div className="professional-service-manager space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/services")}
          className="h-10 w-10 p-0 flex-shrink-0"
          aria-label="Go back to services"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            Profissionais
          </h1>
          <p className="text-sm text-white/55 mt-1">
            {associatedCount} professionals associated
          </p>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedProfessionalIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedProfessionalIds.size}
          onAssociateSelected={handleAssociateSelected}
          onRemoveSelected={handleRemoveSelected}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Search & Filter */}
      <SearchFilter
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
      />

      {/* Professionals List */}
      <ProfessionalList
        professionals={filteredProfessionals}
        selectedIds={selectedProfessionalIds}
        onSelectionChange={handleSelectionChange}
        serviceId={serviceId!}
      />

      {/* Action Footer */}
      <Card variant="surface" padding="md" className="sticky bottom-0 border-t border-white/10">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate("/app/services")}
            className="text-white/70 hover:text-white"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {hasPendingChanges && (
              <span className="text-sm text-white/55 mr-2">
                {selectedProfessionalIds.size} changes pending
              </span>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleAssociateSelected}
              disabled={!hasPendingChanges || isSaving}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Skeleton loading state
function ProfessionalListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded bg-white/5 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
        </div>
      </div>

      <div className="h-14 rounded-2xl bg-white/5 animate-pulse" />

      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5"
          >
            <div className="h-5 w-5 rounded bg-white/5 animate-pulse" />
            <div className="h-12 w-12 rounded-full bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded-full bg-white/5 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
