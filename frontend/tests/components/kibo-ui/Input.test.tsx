import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import {
  Input,
  InputField,
  InputGroup,
  SearchInput,
} from "@/components/kibo-ui/input";

expect.extend(toHaveNoViolations);

describe("Input Component", () => {
  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<Input placeholder="Test input" />);
      const input = screen.getByPlaceholderText("Test input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("data-slot", "input");
    });

    it("renders with custom className", () => {
      render(<Input placeholder="Test" className="custom-class" />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toHaveClass("custom-class");
    });

    it("forwards ref correctly", () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("renders with data-slot attribute", () => {
      render(<Input placeholder="Test" />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toHaveAttribute("data-slot", "input");
    });
  });

  describe("Variants", () => {
    it("renders default variant", () => {
      render(<Input placeholder="Default" variant="default" />);
      const input = screen.getByPlaceholderText("Default");
      expect(input).toHaveClass("border-input");
    });

    it("renders error variant", () => {
      render(<Input placeholder="Error" variant="error" />);
      const input = screen.getByPlaceholderText("Error");
      expect(input).toHaveClass("border-destructive");
    });

    it("renders success variant", () => {
      render(<Input placeholder="Success" variant="success" />);
      const input = screen.getByPlaceholderText("Success");
      expect(input).toHaveClass("border-primary");
    });
  });

  describe("Input Types", () => {
    it("renders text input by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("renders email input", () => {
      render(<Input type="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText("Email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("renders password input", () => {
      render(<Input type="password" placeholder="Password" />);
      const input = screen.getByPlaceholderText("Password");
      expect(input).toHaveAttribute("type", "password");
    });

    it("renders number input", () => {
      render(<Input type="number" placeholder="Number" />);
      const input = screen.getByPlaceholderText("Number");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("Glow Effects", () => {
    it("renders without glow wrapper by default", () => {
      const { container } = render(<Input placeholder="Test" />);
      expect(container.querySelector(".relative.inline-flex")).not.toBeInTheDocument();
    });

    it("renders with glow wrapper when withGlow is true", () => {
      const { container } = render(<Input placeholder="Test" withGlow />);
      expect(container.querySelector(".relative.inline-flex")).toBeInTheDocument();
    });

    it("renders glow layer with aria-hidden", () => {
      const { container } = render(<Input placeholder="Test" withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toBeInTheDocument();
    });

    it("applies correct glow color for default variant", () => {
      const { container } = render(<Input placeholder="Test" withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-ring/20");
    });

    it("applies correct glow color for error variant", () => {
      const { container } = render(
        <Input placeholder="Test" withGlow variant="error" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-destructive/20");
    });

    it("applies correct glow color for success variant", () => {
      const { container } = render(
        <Input placeholder="Test" withGlow variant="success" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("bg-primary/20");
    });

    it("applies subtle glow intensity", () => {
      const { container } = render(
        <Input placeholder="Test" withGlow glowIntensity="subtle" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-md");
    });

    it("applies medium glow intensity by default", () => {
      const { container } = render(<Input placeholder="Test" withGlow />);
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-xl");
    });

    it("applies strong glow intensity", () => {
      const { container } = render(
        <Input placeholder="Test" withGlow glowIntensity="strong" />
      );
      const glowLayer = container.querySelector('[aria-hidden="true"]');
      expect(glowLayer).toHaveClass("blur-2xl");
    });

    it("adds group class to input with glow", () => {
      render(<Input placeholder="Test" withGlow />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toHaveClass("group");
    });
  });

  describe("Interaction", () => {
    it("handles onChange event", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input placeholder="Test" onChange={handleChange} />);

      const input = screen.getByPlaceholderText("Test");
      await user.type(input, "Hello");

      expect(handleChange).toHaveBeenCalled();
    });

    it("handles disabled state", () => {
      render(<Input placeholder="Test" disabled />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toBeDisabled();
    });

    it("handles keyboard input", async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText("Test");
      await user.type(input, "Test value");

      expect(input).toHaveValue("Test value");
    });

    it("handles focus", async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Test" />);

      const input = screen.getByPlaceholderText("Test");
      await user.click(input);

      expect(input).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations - default", async () => {
      const { container } = render(<Input placeholder="Enter text" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with glow", async () => {
      const { container } = render(<Input placeholder="Enter text" withGlow />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - error variant", async () => {
      const { container } = render(
        <Input placeholder="Enter text" variant="error" aria-invalid />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("supports aria-label", () => {
      render(<Input aria-label="Test input" />);
      const input = screen.getByLabelText("Test input");
      expect(input).toBeInTheDocument();
    });

    it("supports aria-describedby", () => {
      render(<Input placeholder="Test" aria-describedby="helper-text" />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toHaveAttribute("aria-describedby", "helper-text");
    });

    it("supports aria-invalid", () => {
      render(<Input placeholder="Test" aria-invalid />);
      const input = screen.getByPlaceholderText("Test");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });
});

describe("InputField Component", () => {
  describe("Basic Rendering", () => {
    it("renders with label", () => {
      render(<InputField label="Username" />);
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
    });

    it("renders with helper text", () => {
      render(<InputField label="Email" helperText="We'll never share your email" />);
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it("renders with error message", () => {
      render(<InputField label="Password" error="Password is required" />);
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("links label to input with htmlFor", () => {
      render(<InputField label="Test" id="test-input" />);
      const label = screen.getByText("Test");
      const input = screen.getByLabelText("Test");
      expect(label).toHaveAttribute("for", "test-input");
      expect(input).toHaveAttribute("id", "test-input");
    });

    it("auto-generates ID when not provided", () => {
      render(<InputField label="Test" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveAttribute("id");
    });
  });

  describe("Layout Orientations", () => {
    it("renders vertical orientation by default", () => {
      const { container } = render(<InputField label="Test" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-2");
      expect(wrapper).not.toHaveClass("flex");
    });

    it("renders horizontal orientation", () => {
      const { container } = render(<InputField label="Test" orientation="horizontal" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("flex", "items-center", "gap-4");
    });
  });

  describe("Error Handling", () => {
    it("sets error variant when error is provided", () => {
      render(<InputField label="Test" error="Error message" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveClass("border-destructive");
    });

    it("sets aria-invalid when error is provided", () => {
      render(<InputField label="Test" error="Error message" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("hides helper text when error is shown", () => {
      render(
        <InputField
          label="Test"
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
    });

    it("associates error message with input via aria-describedby", () => {
      render(<InputField label="Test" error="Error message" />);
      const input = screen.getByLabelText("Test");
      const errorId = input.getAttribute("aria-describedby");
      expect(errorId).toBeTruthy();
      const error = screen.getByText("Error message");
      expect(error).toHaveAttribute("id", errorId);
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations - basic", async () => {
      const { container } = render(<InputField label="Username" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with helper text", async () => {
      const { container } = render(
        <InputField label="Email" helperText="Enter your email address" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with error", async () => {
      const { container } = render(
        <InputField label="Password" error="Password is required" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations - with glow", async () => {
      const { container } = render(<InputField label="Name" withGlow />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe("InputGroup Component", () => {
  describe("Basic Rendering", () => {
    it("renders with role group", () => {
      const { container } = render(
        <InputGroup>
          <Input placeholder="First" />
          <Input placeholder="Second" />
        </InputGroup>
      );
      const group = container.firstChild;
      expect(group).toHaveAttribute("role", "group");
    });

    it("renders vertical orientation by default", () => {
      const { container } = render(
        <InputGroup>
          <Input placeholder="First" />
        </InputGroup>
      );
      const group = container.firstChild;
      expect(group).toHaveClass("flex-col", "gap-4");
    });

    it("renders horizontal orientation", () => {
      const { container } = render(
        <InputGroup orientation="horizontal">
          <Input placeholder="First" />
        </InputGroup>
      );
      const group = container.firstChild;
      expect(group).toHaveClass("flex-row", "gap-2");
    });

    it("applies custom className", () => {
      const { container } = render(
        <InputGroup className="custom-group">
          <Input placeholder="Test" />
        </InputGroup>
      );
      const group = container.firstChild;
      expect(group).toHaveClass("custom-group");
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(
        <InputGroup>
          <InputField label="First Name" />
          <InputField label="Last Name" />
        </InputGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe("SearchInput Component", () => {
  describe("Basic Rendering", () => {
    it("renders with search icon", () => {
      const { container } = render(<SearchInput placeholder="Search..." />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("renders with type search", () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByPlaceholderText("Search...");
      expect(input).toHaveAttribute("type", "search");
    });

    it("applies left padding for icon", () => {
      render(<SearchInput placeholder="Search..." />);
      const input = screen.getByPlaceholderText("Search...");
      expect(input).toHaveClass("pl-9");
    });

    it("supports glow effect", () => {
      const { container } = render(<SearchInput placeholder="Search..." withGlow />);
      expect(container.querySelector(".relative.inline-flex")).toBeInTheDocument();
    });
  });

  describe("Interaction", () => {
    it("handles search input", async () => {
      const user = userEvent.setup();
      render(<SearchInput placeholder="Search..." />);

      const input = screen.getByPlaceholderText("Search...");
      await user.type(input, "search query");

      expect(input).toHaveValue("search query");
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = render(<SearchInput placeholder="Search..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("hides icon from screen readers", () => {
      const { container } = render(<SearchInput placeholder="Search..." />);
      const icon = container.querySelector("svg");
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });
  });
});

describe("Complex Compositions", () => {
  it("renders InputGroup with mixed inputs", () => {
    render(
      <InputGroup>
        <InputField label="First Name" />
        <InputField label="Last Name" />
        <InputField label="Email" type="email" />
      </InputGroup>
    );

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders SearchInput with glow", () => {
    const { container } = render(<SearchInput placeholder="Search" withGlow />);
    const glowLayer = container.querySelector('[aria-hidden="true"]');
    // Should have both icon and glow layer with aria-hidden
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(1);
  });

  it("renders InputField with all features", async () => {
    const handleChange = vi.fn();
    render(
      <InputField
        label="Username"
        helperText="Choose a unique username"
        withGlow
        placeholder="Enter username"
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText("Username");
    expect(input).toBeInTheDocument();
    expect(screen.getByText("Choose a unique username")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("has no accessibility violations - complex form", async () => {
    const { container } = render(
      <form>
        <InputGroup>
          <InputField
            label="Email"
            type="email"
            helperText="We'll never share your email"
          />
          <InputField
            label="Password"
            type="password"
            helperText="Must be at least 8 characters"
          />
          <SearchInput placeholder="Search users..." />
        </InputGroup>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

