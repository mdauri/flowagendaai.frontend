import type { Professional } from "./professional";
import type { Service } from "./service";

/**
 * Professional with service associations
 */
export interface ProfessionalWithServices extends Professional {
  services: Service[];
  serviceCount: number;
  role?: string | null;
  photoUrl?: string | null;
}

/**
 * Input for associating a service with a professional
 */
export interface AssociateServiceInput {
  serviceId: string;
}

/**
 * Input for bulk associate/dissociate operations
 */
export interface BulkServiceAssociationInput {
  serviceIds: string[];
}

/**
 * Result of a bulk operation
 */
export interface BulkOperationResult {
  total: number;
  successes: number;
  failures: number;
  succeeded: boolean;
  partialSuccess: boolean;
}

/**
 * Filter status for professionals list
 */
export type ProfessionalFilterStatus =
  | "all"
  | "associated"
  | "not-associated"
  | "no-services";

/**
 * Professional Service Manager state
 */
export interface ProfessionalServiceManagerState {
  selectedProfessionalIds: Set<string>;
  searchQuery: string;
  filterStatus: ProfessionalFilterStatus;
  hasPendingChanges: boolean;
  isSaving: boolean;
}

/**
 * Component props for ProfessionalServiceManager
 */
export interface ProfessionalServiceManagerProps {
  serviceId: string;
  serviceName: string;
}

/**
 * Component props for ProfessionalList
 */
export interface ProfessionalListProps {
  professionals: ProfessionalWithServices[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string, selected: boolean) => void;
  serviceId: string;
}

/**
 * Component props for ProfessionalItem
 */
export interface ProfessionalItemProps {
  professional: ProfessionalWithServices;
  isSelected: boolean;
  onToggle: (selected: boolean) => void;
  serviceId: string;
  style?: React.CSSProperties;
}

/**
 * Component props for BulkActionBar
 */
export interface BulkActionBarProps {
  selectedCount: number;
  onAssociateSelected: () => void;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
}

/**
 * Component props for SearchFilter
 */
export interface SearchFilterProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ProfessionalFilterStatus) => void;
}

/**
 * Error class for professional service operations
 */
export class ProfessionalServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ProfessionalServiceError";
  }
}
