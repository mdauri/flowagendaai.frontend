import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LogoUpload } from "./logo-upload";
import { tenantLogoImageService } from "@/services/tenant-logo-image-service";

vi.mock("@/services/tenant-logo-image-service", () => ({
  tenantLogoImageService: {
    getUploadUrl: vi.fn(),
    confirmUpload: vi.fn(),
    removeLogo: vi.fn(),
  },
}));

// Mock fetch for S3 upload
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("LogoUpload", () => {
  const defaultProps = {
    onUploadComplete: vi.fn(),
    onRemove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("Empty state", () => {
    it("renders upload button and format hint when no logo", () => {
      render(<LogoUpload {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Upload logo" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/JPG, PNG, or WebP\. Max 2MB\. Recommended: 512x512px\./i),
      ).toBeInTheDocument();
    });

    it("renders circular placeholder", () => {
      render(<LogoUpload {...defaultProps} />);

      const placeholder = screen.getByLabelText("No logo configured");
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass("rounded-full");
    });
  });

  describe("Success state", () => {
    it("renders logo image, replace button, and remove link when logoUrl provided", () => {
      render(
        <LogoUpload
          {...defaultProps}
          logoUrl="https://example.com/logo.png"
        />
      );

      const logoImage = screen.getByAltText("Current tenant logo");
      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute("src", "https://example.com/logo.png");
      expect(logoImage).toHaveClass("rounded-full");

      expect(
        screen.getByRole("button", { name: "Replace logo" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Remove logo" }),
      ).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("shows spinner and 'Uploading...' text during upload, button is disabled", async () => {
      // Mock the service to never resolve so we can observe loading state
      vi.mocked(tenantLogoImageService.getUploadUrl).mockImplementation(
        () => new Promise(() => {}),
      );

      render(<LogoUpload {...defaultProps} />);

      // Create a valid file and trigger upload
      const file = new File(["content"], "logo.png", { type: "image/png" });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file] } });

      await waitFor(() => {
        const button = screen.getByRole("button", { name: "Upload logo" });
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent("Uploading...");
      });
    });
  });

  describe("Disabled state", () => {
    it("all buttons are disabled when disabled prop is true", () => {
      render(
        <LogoUpload
          {...defaultProps}
          logoUrl="https://example.com/logo.png"
          disabled
        />
      );

      expect(
        screen.getByRole("button", { name: "Replace logo" }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: "Remove logo" }),
      ).toBeDisabled();
    });

    it("upload button is disabled when disabled prop is true and no logo", () => {
      render(<LogoUpload {...defaultProps} disabled />);

      expect(
        screen.getByRole("button", { name: "Upload logo" }),
      ).toBeDisabled();
    });
  });

  describe("File validation", () => {
    it("rejects non-JPG/PNG/WebP with error message", () => {
      render(<LogoUpload {...defaultProps} />);

      const file = new File(["content"], "logo.gif", {
        type: "image/gif",
      });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file] } });

      expect(
        screen.getByText(
          "Invalid file type. Only JPG, PNG, and WebP are allowed.",
        ),
      ).toBeInTheDocument();
    });

    it("rejects files larger than 2MB with error message", () => {
      render(<LogoUpload {...defaultProps} />);

      // Create a file larger than 2MB (3MB)
      const file = new File([new ArrayBuffer(3 * 1024 * 1024)], "large.png", {
        type: "image/png",
      });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file] } });

      expect(
        screen.getByText("File size exceeds 2MB limit."),
      ).toBeInTheDocument();
    });
  });

  describe("Upload flow", () => {
    it("calls onUploadComplete with logoUrl on successful upload", async () => {
      const onUploadComplete = vi.fn();
      vi.mocked(tenantLogoImageService.getUploadUrl).mockResolvedValue({
        uploadUrl: "https://s3.example.com/upload",
        objectKey: "tenant-1/tenants/tenant-1/logo/uuid.png",
      });
      mockFetch.mockResolvedValue({ ok: true });
      vi.mocked(tenantLogoImageService.confirmUpload).mockResolvedValue({
        logoUrl: "https://example.com/new-logo.png",
      });

      render(<LogoUpload {...defaultProps} onUploadComplete={onUploadComplete} />);

      const file = new File(["content"], "logo.png", { type: "image/png" });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(tenantLogoImageService.getUploadUrl).toHaveBeenCalledWith({
          filename: "logo.png",
          contentType: "image/png",
        });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "https://s3.example.com/upload",
          expect.objectContaining({
            method: "PUT",
            body: file,
          }),
        );
      });

      await waitFor(() => {
        expect(tenantLogoImageService.confirmUpload).toHaveBeenCalledWith({
          objectKey: "tenant-1/tenants/tenant-1/logo/uuid.png",
        });
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalledWith(
          "https://example.com/new-logo.png",
        );
      });
    });
  });

  describe("Remove flow", () => {
    it("calls onRemove when remove button is clicked", () => {
      const onRemove = vi.fn();
      render(
        <LogoUpload
          {...defaultProps}
          logoUrl="https://example.com/logo.png"
          onRemove={onRemove}
        />
      );

      const removeButton = screen.getByRole("button", { name: "Remove logo" });
      fireEvent.click(removeButton);

      expect(onRemove).toHaveBeenCalled();
    });
  });

  describe("Error banner", () => {
    it("shows error banner when upload fails", async () => {
      vi.mocked(tenantLogoImageService.getUploadUrl).mockRejectedValue(
        new Error("Network error"),
      );

      render(<LogoUpload {...defaultProps} />);

      const file = new File(["content"], "logo.png", { type: "image/png" });
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file] } });

      await waitFor(() => {
        const errorBanner = screen.getByRole("alert");
        expect(errorBanner).toBeInTheDocument();
        expect(errorBanner).toHaveAttribute("aria-live", "assertive");
        expect(errorBanner).toHaveTextContent("Network error");
      });
    });
  });

  describe("Accessibility", () => {
    it("upload button has correct aria-label", () => {
      render(<LogoUpload {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Upload logo" }),
      ).toBeInTheDocument();
    });

    it("remove button has correct aria-label", () => {
      render(
        <LogoUpload
          {...defaultProps}
          logoUrl="https://example.com/logo.png"
        />
      );

      expect(
        screen.getByRole("button", { name: "Remove logo" }),
      ).toBeInTheDocument();
    });

    it("logo image has appropriate alt text", () => {
      render(
        <LogoUpload
          {...defaultProps}
          logoUrl="https://example.com/logo.png"
        />
      );

      expect(screen.getByAltText("Current tenant logo")).toBeInTheDocument();
    });

    it("placeholder has appropriate alt text when no logo", () => {
      render(<LogoUpload {...defaultProps} />);

      expect(screen.getByLabelText("No logo configured")).toBeInTheDocument();
    });
  });
});
