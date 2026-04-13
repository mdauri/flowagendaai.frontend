import { useCallback, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/flow/button";
import { Input } from "@/components/flow/input";
import { tenantService } from "@/services/tenant-service";

export type GeolocationError =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "REVERSE_GEOCODE_FAILED";

export type GeolocationState =
  | "idle"
  | "detecting"
  | "success"
  | "permission-denied"
  | "error"
  | "not-supported";

export interface GeolocationAddressInputProps {
  value: string;
  onChange: (address: string) => void;
  disabled?: boolean;
  onError?: (error: GeolocationError) => void;
  placeholder?: string;
  label?: string;
}

const FEEDBACK_MESSAGES: Record<GeolocationState, string | null> = {
  idle: null,
  detecting: null,
  success: null,
  "permission-denied":
    "Location access denied. Enable location in your browser settings, or type your address manually.",
  error: "Could not determine your address. Type manually.",
  "not-supported": null,
};

function isGeolocationAvailable(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.geolocation);
}

export function GeolocationAddressInput({
  value,
  onChange,
  disabled,
  onError,
  placeholder = "Type your address or use location detection",
  label = "Public Address",
}: GeolocationAddressInputProps) {
  const [geoState, setGeoState] = useState<GeolocationState>("idle");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleDetectLocation = useCallback(async () => {
    if (!isGeolocationAvailable()) {
      setGeoState("not-supported");
      return;
    }

    setGeoState("detecting");
    setIsGeocoding(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { timeout: 10000, enableHighAccuracy: false }
        );
      });

      const { latitude, longitude } = position.coords;

      const result = await tenantService.geocode({ latitude, longitude });
      onChange(result.formattedAddress);
      setGeoState("success");
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          setGeoState("permission-denied");
          onError?.("PERMISSION_DENIED");
        } else if (err.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
          setGeoState("error");
          onError?.("POSITION_UNAVAILABLE");
        } else {
          setGeoState("error");
          onError?.("TIMEOUT");
        }
      } else {
        setGeoState("error");
        onError?.("REVERSE_GEOCODE_FAILED");
      }
    } finally {
      setIsGeocoding(false);
    }
  }, [onChange, onError]);

  const feedbackMessage = FEEDBACK_MESSAGES[geoState];
  const isDetecting = geoState === "detecting";
  const isPermissionDenied = geoState === "permission-denied";
  const isNotSupported = geoState === "not-supported";
  const hasError = geoState === "error";
  const showButton = !isPermissionDenied && !isNotSupported;

  return (
    <div className="space-y-2">
      <label
        htmlFor="geolocation-address-input"
        className="block text-sm font-medium text-white/70"
      >
        {label}
      </label>

      <Input
        id="geolocation-address-input"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (geoState !== "idle" && geoState !== "success") {
            setGeoState("idle");
          }
        }}
        placeholder={isNotSupported ? "Type your address" : placeholder}
        disabled={disabled || isDetecting}
        maxLength={300}
        aria-describedby={feedbackMessage ? "geolocation-feedback" : undefined}
        aria-invalid={hasError ? "true" : undefined}
      />

      {feedbackMessage && (
        <p
          id="geolocation-feedback"
          role={hasError ? "alert" : "status"}
          aria-live={hasError ? "assertive" : "polite"}
          className="rounded-lg border p-3 text-sm leading-relaxed"
          style={{
            color: hasError ? "#F87171" : "#FCD34D",
            backgroundColor: hasError
              ? "rgba(239, 68, 68, 0.10)"
              : "rgba(245, 158, 11, 0.14)",
            borderColor: hasError
              ? "rgba(248, 113, 113, 0.28)"
              : "rgba(245, 158, 11, 0.32)",
          }}
        >
          {feedbackMessage}
        </p>
      )}

      {showButton && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleDetectLocation}
          disabled={disabled || isGeocoding}
          aria-label={
            geoState === "success"
              ? "Update my current location"
              : "Detect my current location to fill the address"
          }
        >
          {isGeocoding ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Detecting...
            </>
          ) : (
            <>
              <MapPin size={16} aria-hidden="true" />
              {geoState === "success" ? "Update location" : "Use my location"}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
