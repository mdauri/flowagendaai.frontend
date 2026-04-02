import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import type { SearchFilterProps, ProfessionalFilterStatus } from "@/types/professional-service";
import { Input } from "./flow/input";
import { Button } from "./flow/button";
import { Select } from "./flow/select";
import { useDebounce } from "@/hooks/use-debounce";

const filterOptions = [
  { label: "All professionals", value: "all" },
  { label: "Associated only", value: "associated" },
  { label: "Not associated only", value: "not-associated" },
  { label: "No services assigned", value: "no-services" },
];

export function SearchFilter({
  onSearchChange,
  onFilterChange,
}: SearchFilterProps) {
  const [inputValue, setInputValue] = useState("");
  const [filterValue, setFilterValue] = useState<ProfessionalFilterStatus>("all");
  const debouncedValue = useDebounce(inputValue, 300);

  useEffect(() => {
    onSearchChange(debouncedValue);
  }, [debouncedValue, onSearchChange]);

  const handleFilterChange = (value: string) => {
    setFilterValue(value as ProfessionalFilterStatus);
    onFilterChange(value as ProfessionalFilterStatus);
  };

  const handleClear = () => {
    setInputValue("");
    setFilterValue("all");
    onSearchChange("");
    onFilterChange("all");
  };

  const hasActiveFilters = inputValue !== "" || filterValue !== "all";

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/55 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search professionals..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10 h-11 text-base bg-white/5 border-white/10"
          aria-label="Search professionals"
        />
      </div>

      <div className="w-[180px]">
        <Select
          value={filterValue}
          options={filterOptions}
          onValueChange={handleFilterChange}
          aria-label="Filter professionals"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-11 w-11 p-0"
          aria-label="Clear filters"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
