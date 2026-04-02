import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkActionBar } from "./bulk-action-bar";

describe("BulkActionBar", () => {
  const defaultProps = {
    selectedCount: 2,
    onAssociateSelected: vi.fn(),
    onRemoveSelected: vi.fn(),
    onClearSelection: vi.fn(),
  };

  it("should not render when no professionals selected", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        onAssociateSelected={vi.fn()}
        onRemoveSelected={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render with correct selection count", () => {
    render(<BulkActionBar {...defaultProps} />);
    expect(screen.getByText(/2 professionals selected/)).toBeInTheDocument();
  });

  it("should render with singular 'professional' when count is 1", () => {
    render(
      <BulkActionBar
        {...defaultProps}
        selectedCount={1}
      />
    );
    expect(screen.getByText(/1 professional selected/)).toBeInTheDocument();
  });

  it("should call onClearSelection when Clear button clicked", async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn();
    render(<BulkActionBar {...defaultProps} onClearSelection={onClearSelection} />);

    await user.click(screen.getByText("Clear"));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("should call onAssociateSelected when Associate Selected button clicked", async () => {
    const user = userEvent.setup();
    const onAssociateSelected = vi.fn();
    render(<BulkActionBar {...defaultProps} onAssociateSelected={onAssociateSelected} />);

    await user.click(screen.getByText("Associate Selected"));
    expect(onAssociateSelected).toHaveBeenCalledTimes(1);
  });

  it("should call onRemoveSelected when Remove Selected button clicked", async () => {
    const user = userEvent.setup();
    const onRemoveSelected = vi.fn();
    render(<BulkActionBar {...defaultProps} onRemoveSelected={onRemoveSelected} />);

    await user.click(screen.getByText("Remove Selected"));
    expect(onRemoveSelected).toHaveBeenCalledTimes(1);
  });

  it("should have proper accessibility attributes", () => {
    render(<BulkActionBar {...defaultProps} />);
    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-label", "Bulk actions");
  });
});
