import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GeolocationAddressInput } from "./geolocation-address-input";
import { tenantService } from "@/services/tenant-service";
import { renderWithProviders } from "@/test/render";

vi.mock("@/services/tenant-service", () => ({
  tenantService: {
    geocode: vi.fn(),
  },
}));

// Mock geolocation at the global level
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

// Mock GeolocationPositionError for jsdom
class MockGeolocationPositionError {
  static PERMISSION_DENIED = 1;
  static POSITION_UNAVAILABLE = 2;
  static TIMEOUT = 3;
  code = 0;
  message = "";
}

beforeEach(() => {
  vi.clearAllMocks();
  // Mock GeolocationPositionError
  vi.stubGlobal("GeolocationPositionError", MockGeolocationPositionError);
  // Set up geolocation on the existing navigator object
  Object.defineProperty(navigator, "geolocation", {
    value: mockGeolocation,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GeolocationAddressInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
  };

  it("renders text input and detect location button", () => {
    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const input = screen.getByRole("textbox", { name: /Public Address/ });
    expect(input).toBeInTheDocument();

    const button = screen.getByRole("button", {
      name: /Detect my current location/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("displays custom label when provided", () => {
    renderWithProviders(
      <GeolocationAddressInput {...defaultProps} label="My Location" />
    );

    expect(screen.getByText("My Location")).toBeInTheDocument();
  });

  it("calls onChange when input value changes", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GeolocationAddressInput {...defaultProps} onChange={onChange} />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Rua Teste, 123" } });

    expect(onChange).toHaveBeenCalledWith("Rua Teste, 123");
  });

  it("triggers geolocation API call when button is clicked", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    vi.mocked(tenantService.geocode).mockResolvedValue({
      formattedAddress: "Av. Paulista, 1000 - Sao Paulo, SP",
    });

    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(tenantService.geocode).toHaveBeenCalledWith({
        latitude: -23.5505,
        longitude: -46.6333,
      });
    });

    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith(
        "Av. Paulista, 1000 - Sao Paulo, SP"
      );
    });
  });

  it("displays error message on permission denied", async () => {
    const permissionDeniedError = new MockGeolocationPositionError();
    Object.defineProperty(permissionDeniedError, "code", {
      value: MockGeolocationPositionError.PERMISSION_DENIED,
    });
    Object.defineProperty(permissionDeniedError, "message", {
      value: "Permission denied",
    });

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: () => void, error: (err: GeolocationPositionError) => void) => {
        error(permissionDeniedError as unknown as GeolocationPositionError);
      }
    );

    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Location access denied/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /Detect my current location/i })
    ).not.toBeInTheDocument();
  });

  it("displays error message on geocode API failure", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    vi.mocked(tenantService.geocode).mockRejectedValue(
      new Error("Service unavailable")
    );

    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Could not determine your address/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /Detect my current location/i })
    ).toBeInTheDocument();
  });

  it("displays loading state during geocoding", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    vi.mocked(tenantService.geocode).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ formattedAddress: "Test Address" }),
            100
          )
        )
    );

    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Detecting\.\.\./i)).toBeInTheDocument();
    });
  });

  it("manual address input is editable", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GeolocationAddressInput {...defaultProps} onChange={onChange} />
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Manual address here" } });

    expect(onChange).toHaveBeenCalledWith("Manual address here");
  });

  it("shows 'Update location' button text after successful geocoding", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    vi.mocked(tenantService.geocode).mockResolvedValue({
      formattedAddress: "Av. Paulista, 1000",
    });

    renderWithProviders(<GeolocationAddressInput {...defaultProps} />);

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Update my current location/i })
      ).toBeInTheDocument();
    });
  });

  it("calls onError callback with correct error type on permission denied", async () => {
    const onError = vi.fn();
    const permissionDeniedError = new MockGeolocationPositionError();
    Object.defineProperty(permissionDeniedError, "code", {
      value: MockGeolocationPositionError.PERMISSION_DENIED,
    });

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: () => void, error: (err: GeolocationPositionError) => void) => {
        error(permissionDeniedError as unknown as GeolocationPositionError);
      }
    );

    renderWithProviders(
      <GeolocationAddressInput {...defaultProps} onError={onError} />
    );

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("PERMISSION_DENIED");
    });
  });

  it("calls onError callback on geocode failure", async () => {
    const onError = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((success: (pos: GeolocationPosition) => void) => {
      success({
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 10,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    vi.mocked(tenantService.geocode).mockRejectedValue(
      new Error("Service unavailable")
    );

    renderWithProviders(
      <GeolocationAddressInput {...defaultProps} onError={onError} />
    );

    const button = screen.getByRole("button", { name: /Detect my current location/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("REVERSE_GEOCODE_FAILED");
    });
  });
});
