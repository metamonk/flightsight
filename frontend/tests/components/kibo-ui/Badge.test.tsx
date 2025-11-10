import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Badge,
  BadgePulse,
  BadgeDot,
  BadgeGroup,
} from "@/components/kibo-ui/badge";

describe("Badge Component", () => {
  describe("Badge", () => {
    it("renders with default variant", () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText("Test Badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("data-slot", "badge");
    });

    it("renders with different variants", () => {
      const { rerender } = render(<Badge variant="default">Default</Badge>);
      expect(screen.getByText("Default")).toBeInTheDocument();

      rerender(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText("Secondary")).toBeInTheDocument();

      rerender(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText("Destructive")).toBeInTheDocument();

      rerender(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText("Outline")).toBeInTheDocument();

      rerender(<Badge variant="success">Success</Badge>);
      expect(screen.getByText("Success")).toBeInTheDocument();

      rerender(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText("Warning")).toBeInTheDocument();

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText("Info")).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-class");
    });

    it("renders as child component with asChild prop", () => {
      render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      const link = screen.getByRole("link", { name: "Link Badge" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });

    it("supports ARIA attributes", () => {
      render(<Badge aria-label="Status badge">5</Badge>);
      const badge = screen.getByLabelText("Status badge");
      expect(badge).toBeInTheDocument();
    });

    it("renders with children including icons", () => {
      render(
        <Badge>
          <svg data-testid="test-icon" />
          With Icon
        </Badge>
      );
      expect(screen.getByText("With Icon")).toBeInTheDocument();
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });
  });

  describe("BadgePulse", () => {
    it("renders with pulse animation wrapper", () => {
      render(<BadgePulse>Pulsing</BadgePulse>);
      const badge = screen.getByText("Pulsing");
      expect(badge).toBeInTheDocument();
      
      // Check that pulse wrapper exists
      const pulseWrapper = badge.parentElement;
      expect(pulseWrapper).toBeInTheDocument();
      expect(pulseWrapper?.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("renders with different variants and correct pulse colors", () => {
      const { rerender } = render(<BadgePulse variant="success">Success</BadgePulse>);
      let badge = screen.getByText("Success");
      let pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveClass("bg-green-500/30");

      rerender(<BadgePulse variant="warning">Warning</BadgePulse>);
      badge = screen.getByText("Warning");
      pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveClass("bg-yellow-500/30");

      rerender(<BadgePulse variant="destructive">Error</BadgePulse>);
      badge = screen.getByText("Error");
      pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveClass("bg-destructive/30");

      rerender(<BadgePulse variant="info">Info</BadgePulse>);
      badge = screen.getByText("Info");
      pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveClass("bg-blue-500/30");
    });

    it("has animate-pulse class on pulse layer", () => {
      render(<BadgePulse>Animated</BadgePulse>);
      const badge = screen.getByText("Animated");
      const pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveClass("animate-pulse");
    });

    it("accepts custom className", () => {
      render(<BadgePulse className="custom-pulse">Custom</BadgePulse>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-pulse");
    });

    it("supports ARIA attributes", () => {
      render(<BadgePulse aria-label="Active status">Active</BadgePulse>);
      const badge = screen.getByLabelText("Active status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("BadgeDot", () => {
    it("renders with dot indicator", () => {
      render(<BadgeDot>Online</BadgeDot>);
      const badge = screen.getByText("Online");
      expect(badge).toBeInTheDocument();
      
      // Check for dot elements
      const dots = badge.querySelectorAll('span[class*="rounded-full"]');
      expect(dots.length).toBeGreaterThan(0);
    });

    it("renders without pulse by default", () => {
      render(<BadgeDot>Status</BadgeDot>);
      const badge = screen.getByText("Status");
      
      // Should not have animate-ping class when withPulse is false
      const animatedDot = badge.querySelector('[class*="animate-ping"]');
      expect(animatedDot).not.toBeInTheDocument();
    });

    it("renders with pulse when withPulse is true", () => {
      render(<BadgeDot withPulse>Live</BadgeDot>);
      const badge = screen.getByText("Live");
      
      // Should have animate-ping class when withPulse is true
      const animatedDot = badge.querySelector('[class*="animate-ping"]');
      expect(animatedDot).toBeInTheDocument();
    });

    it("renders with correct dot colors for different variants", () => {
      const { rerender } = render(<BadgeDot variant="success">Success</BadgeDot>);
      let badge = screen.getByText("Success");
      let dot = badge.querySelector('span[class*="bg-green-500"]');
      expect(dot).toBeInTheDocument();

      rerender(<BadgeDot variant="destructive">Error</BadgeDot>);
      badge = screen.getByText("Error");
      dot = badge.querySelector('span[class*="bg-red-500"]');
      expect(dot).toBeInTheDocument();

      rerender(<BadgeDot variant="warning">Warning</BadgeDot>);
      badge = screen.getByText("Warning");
      dot = badge.querySelector('span[class*="bg-yellow-500"]');
      expect(dot).toBeInTheDocument();

      rerender(<BadgeDot variant="info">Info</BadgeDot>);
      badge = screen.getByText("Info");
      dot = badge.querySelector('span[class*="bg-blue-500"]');
      expect(dot).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      render(<BadgeDot className="custom-dot">Custom</BadgeDot>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-dot");
    });

    it("supports ARIA attributes", () => {
      render(<BadgeDot aria-label="User online status">Online</BadgeDot>);
      const badge = screen.getByLabelText("User online status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("BadgeGroup", () => {
    it("renders multiple badges with default spacing", () => {
      render(
        <BadgeGroup>
          <Badge>Badge 1</Badge>
          <Badge>Badge 2</Badge>
          <Badge>Badge 3</Badge>
        </BadgeGroup>
      );
      
      expect(screen.getByText("Badge 1")).toBeInTheDocument();
      expect(screen.getByText("Badge 2")).toBeInTheDocument();
      expect(screen.getByText("Badge 3")).toBeInTheDocument();
    });

    it("applies correct spacing classes", () => {
      const { rerender, container } = render(
        <BadgeGroup spacing="xs">
          <Badge>Test</Badge>
        </BadgeGroup>
      );
      let group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("gap-1");

      rerender(
        <BadgeGroup spacing="sm">
          <Badge>Test</Badge>
        </BadgeGroup>
      );
      group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("gap-2");

      rerender(
        <BadgeGroup spacing="md">
          <Badge>Test</Badge>
        </BadgeGroup>
      );
      group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("gap-3");

      rerender(
        <BadgeGroup spacing="lg">
          <Badge>Test</Badge>
        </BadgeGroup>
      );
      group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("gap-4");
    });

    it("accepts custom className", () => {
      const { container } = render(
        <BadgeGroup className="custom-group">
          <Badge>Test</Badge>
        </BadgeGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("custom-group");
    });

    it("handles flex-wrap for multiple badges", () => {
      const { container } = render(
        <BadgeGroup>
          <Badge>Badge 1</Badge>
          <Badge>Badge 2</Badge>
          <Badge>Badge 3</Badge>
        </BadgeGroup>
      );
      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass("flex-wrap");
    });
  });

  describe("Accessibility", () => {
    it("Badge has proper semantic structure", () => {
      render(<Badge>Accessible Badge</Badge>);
      const badge = screen.getByText("Accessible Badge");
      expect(badge.tagName.toLowerCase()).toBe("span");
    });

    it("BadgePulse has aria-hidden on animation layer", () => {
      render(<BadgePulse>Animated</BadgePulse>);
      const badge = screen.getByText("Animated");
      const pulseLayer = badge.parentElement?.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toHaveAttribute("aria-hidden", "true");
    });

    it("BadgeDot with pulse has aria-hidden on animation layer", () => {
      render(<BadgeDot withPulse>Live</BadgeDot>);
      const badge = screen.getByText("Live");
      const animatedDot = badge.querySelector('[aria-hidden="true"]');
      expect(animatedDot).toHaveAttribute("aria-hidden", "true");
    });

    it("supports custom ARIA labels for status indicators", () => {
      render(
        <BadgeDot 
          variant="success" 
          withPulse 
          aria-label="System is currently online and operational"
        >
          Online
        </BadgeDot>
      );
      const badge = screen.getByLabelText("System is currently online and operational");
      expect(badge).toBeInTheDocument();
    });

    it("Badge can be keyboard focusable when interactive", () => {
      render(
        <Badge asChild>
          <button>Click me</button>
        </Badge>
      );
      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe("Integration", () => {
    it("works with other components", () => {
      render(
        <div>
          <BadgeGroup>
            <Badge variant="success">Confirmed</Badge>
            <Badge variant="info">Paid</Badge>
            <BadgeDot variant="success" withPulse>
              Active
            </BadgeDot>
          </BadgeGroup>
        </div>
      );
      
      expect(screen.getByText("Confirmed")).toBeInTheDocument();
      expect(screen.getByText("Paid")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("handles complex nesting", () => {
      render(
        <BadgeGroup spacing="lg">
          <BadgePulse variant="success">
            System Active
          </BadgePulse>
          <BadgeDot variant="warning" withPulse>
            Pending
          </BadgeDot>
          <Badge variant="info">
            Information
          </Badge>
        </BadgeGroup>
      );
      
      expect(screen.getByText("System Active")).toBeInTheDocument();
      expect(screen.getByText("Pending")).toBeInTheDocument();
      expect(screen.getByText("Information")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty content", () => {
      const { container } = render(<Badge />);
      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });

    it("handles very long text", () => {
      const longText = "This is a very long badge text that should still render correctly";
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("handles multiple children", () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
          <span>Count</span>
        </Badge>
      );
      
      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
      expect(screen.getByText("Count")).toBeInTheDocument();
    });
  });
});

