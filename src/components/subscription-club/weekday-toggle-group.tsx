import { Checkbox } from "@/components/flow/checkbox";

const weekdays = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
];

interface WeekdayToggleGroupProps {
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export function WeekdayToggleGroup({
  value,
  onChange,
  disabled = false,
}: WeekdayToggleGroupProps) {
  function toggle(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((item) => item !== day));
      return;
    }

    onChange([...value, day].sort((left, right) => left - right));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {weekdays.map((day) => (
        <label
          key={day.value}
          className="flex items-center gap-2 rounded-full border border-[var(--theme-border-subtle)] bg-black/10 px-3 py-2 text-sm font-semibold text-[var(--theme-text-primary)]"
        >
          <Checkbox
            checked={value.includes(day.value)}
            onCheckedChange={() => toggle(day.value)}
            disabled={disabled}
          />
          {day.label}
        </label>
      ))}
    </div>
  );
}
