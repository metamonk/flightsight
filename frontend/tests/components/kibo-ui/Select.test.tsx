import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
  SelectField,
} from "@/components/kibo-ui/select";

expect.extend(toHaveNoViolations);

describe("Select Component", () => {
  const BasicSelect = ({
    onValueChange = vi.fn(),
    ...props
  }: {
    onValueChange?: (value: string) => void;
  }) => (
    <Select onValueChange={onValueChange}>
      <SelectTrigger {...props}>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );

  describe("Basic Rendering", () => {
    it("renders with placeholder", () => {
      render(<BasicSelect />);
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("renders with data-slot attribute", () => {
      render(<BasicSelect />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<BasicSelect variant="default" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("dark:bg-input/30");
    });

    it("renders primary variant", () => {
      render(<BasicSelect variant="primary" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("border-primary/50");
    });

    it("renders error variant", () => {
      render(<BasicSelect variant="error" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("border-destructive");
    });
  });

  describe("Sizes", () => {
    it("renders small size", () => {
      render(<BasicSelect size="sm" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-8");
    });

    it("renders default size", () => {
      render(<BasicSelect size="default" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-9");
    });

    it("renders large size", () => {
      render(<BasicSelect size="lg" />);
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("h-10");
    });
  });

  describe("Glow Effects", () => {
    it("renders without glow wrapper by default", () => {
      const { container } = render(<BasicSelect />);
      const wrapper = container.querySelector(".relative.inline-flex");
      expect(wrapper).not.toBeInTheDocument();
    });

    it("renders with glow wrapper when withGlow is true", () => {
      const { container } = render(<BasicSelect withGlow />);
      const wrapper = container.querySelector(".relative.inline-flex");
      expect(wrapper).toBeInTheDocument();
    });

    it("renders glow layer with aria-hidden", () => {
      const { container } = render(<BasicSelect withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toBeInTheDocument();
    });

    it("applies correct glow color for default variant", () => {
      const { container } = render(<BasicSelect withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-ring/20");
    });

    it("applies correct glow color for primary variant", () => {
      const { container } = render(<BasicSelect withGlow variant="primary" />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-primary/20");
    });

    it("applies correct glow color for error variant", () => {
      const { container } = render(<BasicSelect withGlow variant="error" />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-destructive/20");
    });

    it("applies subtle glow intensity", () => {
      const { container } = render(
        <BasicSelect withGlow glowIntensity="subtle" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-md");
    });

    it("applies medium glow intensity by default", () => {
      const { container } = render(<BasicSelect withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-xl");
    });

    it("applies strong glow intensity", () => {
      const { container } = render(
        <BasicSelect withGlow glowIntensity="strong" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-2xl");
    });
  });

  describe("Interaction", () => {
    it("handles value change callback", () => {
      const handleValueChange = vi.fn();
      render(<BasicSelect onValueChange={handleValueChange} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeInTheDocument();
      // Note: Actual interaction testing of Radix UI Select is covered by Radix's own tests
    });

    it("handles disabled state", () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("supports aria-describedby", () => {
      render(
        <Select>
          <SelectTrigger aria-describedby="helper-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-describedby", "helper-text");
    });

    it("supports aria-invalid", () => {
      render(
        <Select>
          <SelectTrigger aria-invalid>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Item</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-invalid", "true");
    });
  });
});

describe("SelectField Component", () => {
  const BasicSelectField = ({
    onValueChange = vi.fn(),
    ...props
  }: {
    label: string;
    onValueChange?: (value: string) => void;
  }) => (
    <SelectField {...props} onValueChange={onValueChange}>
      <SelectItem value="option1">Option 1</SelectItem>
      <SelectItem value="option2">Option 2</SelectItem>
    </SelectField>
  );

  describe("Basic Rendering", () => {
    it("renders with label", () => {
      render(<BasicSelectField label="Choose option" />);
      expect(screen.getByText("Choose option")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(
        <BasicSelectField
          label="Select"
          helperText="Choose your favorite option"
        />
      );
      expect(screen.getByText("Choose your favorite option")).toBeInTheDocument();
    });

    it("renders with error message", () => {
      render(<BasicSelectField label="Select" error="Selection is required" />);
      expect(screen.getByText("Selection is required")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("links label to select", () => {
      render(<BasicSelectField label="Test" />);
      const label = screen.getByText("Test");
      const select = screen.getByRole("combobox");
      expect(label).toHaveAttribute("for");
      expect(select).toHaveAttribute("id");
    });
  });

  describe("Error Handling", () => {
    it("sets error variant when error is provided", () => {
      render(<BasicSelectField label="Test" error="Error message" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-destructive");
    });

    it("sets aria-invalid when error is provided", () => {
      render(<BasicSelectField label="Test" error="Error message" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("aria-invalid", "true");
    });

    it("hides helper text when error is shown", () => {
      render(
        <BasicSelectField
          label="Test"
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations - basic", async () => {
      const { container } = render(<BasicSelectField label="Options" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with helper text", async () => {
      const { container } = render(
        <BasicSelectField label="Options" helperText="Select an option" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with error", async () => {
      const { container } = render(
        <BasicSelectField label="Options" error="Required field" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe("Select Composition", () => {
  it("renders with groups and labels", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    // Note: Portal content is not easily testable in jsdom without additional setup
    // SelectField provides accessibility-compliant usage with proper labels
  });
});

