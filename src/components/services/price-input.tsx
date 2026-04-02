import { useId, useState, useEffect, type ChangeEvent } from "react";
import { Input } from "@/components/flow/input";
import { CardDescription } from "@/components/flow/card";
import { colors, typography } from "@/design-system";

interface PriceInputProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
}

/**
 * Format number to BRL currency string (for display)
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse BRL currency string to number
 * Handles: "R$ 1.234,56" → 1234.56
 */
export function parseCurrency(value: string): number | null {
  if (!value) return null;
  
  // Remove "R$" and trim
  const cleaned = value.replace("R$", "").trim();
  
  // Remove thousands separator (.) and replace decimal separator (,) with (.)
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed)) return null;
  
  return parsed;
}

/**
 * Format raw number to BRL string as user types
 * Example: 123456 → "R$ 1.234,56"
 */
function formatAsCurrency(rawValue: string): string {
  // Remove all non-digit characters
  const digits = rawValue.replace(/\D/g, "");
  
  // Convert to number (divide by 100 to account for cents)
  const value = parseInt(digits, 10) / 100;
  
  if (isNaN(value)) return "";
  
  return formatCurrency(value);
}

export function PriceInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  placeholder = "R$ 0,00",
  errorMessage,
}: PriceInputProps) {
  const id = useId();
  
  // Internal state for the formatted display value
  const [displayValue, setDisplayValue] = useState("");
  
  // Update display value when external value changes
  useEffect(() => {
    if (value !== null && value !== undefined) {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Format as currency while typing
    const formatted = formatAsCurrency(inputValue);
    setDisplayValue(formatted);
    
    // Parse and emit the numeric value
    const numericValue = parseCurrency(formatted);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Normalize the value on blur
    if (displayValue) {
      const numericValue = parseCurrency(displayValue);
      
      // Validate: must be positive and within limits
      if (numericValue !== null) {
        if (numericValue <= 0) {
          onChange(null);
          setDisplayValue("");
          return;
        }
        if (numericValue > 99999.99) {
          // Cap at max value
          onChange(99999.99);
          setDisplayValue(formatCurrency(99999.99));
          return;
        }
        onChange(numericValue);
        setDisplayValue(formatCurrency(numericValue));
      }
    }
    
    onBlur?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="sr-only">
        Preço
      </label>
      <Input
        id={id}
        type="text"
        inputSize="md"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-label="Preço em reais (R$)"
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        style={{
          fontFamily: typography.family.sans,
        }}
      />
      {errorMessage ? (
        <CardDescription
          id={`${id}-error`}
          style={{
            color: colors.feedback.danger.text,
            fontFamily: typography.family.sans,
          }}
        >
          {errorMessage}
        </CardDescription>
      ) : (
        <CardDescription
          style={{
            color: colors.text.muted,
            fontFamily: typography.family.sans,
          }}
        >
          Formato: R$ 1.234,56 (valor entre R$ 0,01 e R$ 99.999,99)
        </CardDescription>
      )}
    </div>
  );
}
