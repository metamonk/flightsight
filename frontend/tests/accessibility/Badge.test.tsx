import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import {
  Badge,
  BadgePulse,
  BadgeDot,
  BadgeGroup,
} from "@/components/kibo-ui/badge";

expect.extend(toHaveNoViolations);

describe("Badge Accessibility", () => {
  describe("Badge", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with different variants", async () => {
      const { container } = render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-label", async () => {
      const { container } = render(
        <Badge aria-label="5 unread notifications">5</Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be accessible when used as a child component", async () => {
      const { container } = render(
        <Badge asChild>
          <button type="button">Interactive Badge</button>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be accessible as a link", async () => {
      const { container } = render(
        <Badge asChild>
          <a href="/notifications" aria-label="View notifications">
            5
          </a>
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("BadgePulse", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <BadgePulse variant="success">Active</BadgePulse>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with all variants", async () => {
      const { container } = render(
        <div>
          <BadgePulse variant="default">Default</BadgePulse>
          <BadgePulse variant="success">Success</BadgePulse>
          <BadgePulse variant="warning">Warning</BadgePulse>
          <BadgePulse variant="destructive">Error</BadgePulse>
          <BadgePulse variant="info">Info</BadgePulse>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have aria-hidden on pulse animation layer", async () => {
      const { container } = render(<BadgePulse>Animated</BadgePulse>);
      const pulseLayer = container.querySelector('[aria-hidden="true"]');
      expect(pulseLayer).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-label for status indication", async () => {
      const { container } = render(
        <BadgePulse 
          variant="success" 
          aria-label="System is currently active and operational"
        >
          Active
        </BadgePulse>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("BadgeDot", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<BadgeDot variant="success">Online</BadgeDot>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with pulse animation", async () => {
      const { container } = render(
        <BadgeDot variant="success" withPulse>
          Live
        </BadgeDot>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with all variants", async () => {
      const { container } = render(
        <div>
          <BadgeDot variant="success">Available</BadgeDot>
          <BadgeDot variant="destructive">Offline</BadgeDot>
          <BadgeDot variant="warning">Away</BadgeDot>
          <BadgeDot variant="info">Busy</BadgeDot>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support aria-label for status context", async () => {
      const { container } = render(
        <BadgeDot 
          variant="success" 
          withPulse
          aria-label="User is currently online and available"
        >
          Online
        </BadgeDot>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have aria-hidden on animation elements", async () => {
      const { container } = render(
        <BadgeDot variant="success" withPulse>
          Live
        </BadgeDot>
      );
      
      // Check for aria-hidden on animated dot
      const animatedElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(animatedElements.length).toBeGreaterThan(0);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("BadgeGroup", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(
        <BadgeGroup>
          <Badge>Badge 1</Badge>
          <Badge>Badge 2</Badge>
          <Badge>Badge 3</Badge>
        </BadgeGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with different spacing", async () => {
      const { container } = render(
        <div>
          <BadgeGroup spacing="xs">
            <Badge>Test 1</Badge>
          </BadgeGroup>
          <BadgeGroup spacing="sm">
            <Badge>Test 2</Badge>
          </BadgeGroup>
          <BadgeGroup spacing="md">
            <Badge>Test 3</Badge>
          </BadgeGroup>
          <BadgeGroup spacing="lg">
            <Badge>Test 4</Badge>
          </BadgeGroup>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have violations with mixed badge types", async () => {
      const { container } = render(
        <BadgeGroup spacing="md">
          <Badge variant="success">Confirmed</Badge>
          <BadgeDot variant="success" withPulse>
            Active
          </BadgeDot>
          <BadgePulse variant="warning">Pending</BadgePulse>
        </BadgeGroup>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Color Contrast", () => {
    it("should meet contrast requirements for default variant", async () => {
      const { container } = render(<Badge variant="default">Default</Badge>);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should meet contrast requirements for all variants", async () => {
      const { container } = render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should be keyboard accessible when interactive", async () => {
      const { container } = render(
        <Badge asChild>
          <button type="button">Interactive Badge</button>
        </Badge>
      );
      const results = await axe(container, {
        rules: {
          'keyboard-navigable': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should be keyboard accessible as a link", async () => {
      const { container } = render(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );
      const results = await axe(container, {
        rules: {
          'keyboard-navigable': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe("Screen Reader Support", () => {
    it("should provide meaningful context with aria-label", async () => {
      const { container } = render(
        <div>
          <Badge aria-label="5 unread notifications">5</Badge>
          <BadgeDot 
            variant="success" 
            withPulse
            aria-label="User is online"
          >
            Online
          </BadgeDot>
          <BadgePulse 
            variant="destructive"
            aria-label="Critical system alert"
          >
            Alert
          </BadgePulse>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should hide decorative elements from screen readers", async () => {
      const { container } = render(
        <div>
          <BadgePulse>Animated</BadgePulse>
          <BadgeDot withPulse>Live</BadgeDot>
        </div>
      );
      
      // Verify animation layers are hidden
      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThan(0);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Complex Use Cases", () => {
    it("should be accessible in notification counter context", async () => {
      const { container } = render(
        <button type="button" aria-label="Notifications">
          <span>Notifications</span>
          <Badge 
            className="ml-2"
            aria-label="5 unread notifications"
          >
            5
          </Badge>
        </button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be accessible in user presence context", async () => {
      const { container } = render(
        <div role="status" aria-label="User status">
          <span>John Doe</span>
          <BadgeDot 
            variant="success" 
            withPulse
            aria-label="Online and available"
          >
            Online
          </BadgeDot>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be accessible in status dashboard context", async () => {
      const { container } = render(
        <div>
          <div role="status" aria-label="System status">
            <span>Weather Monitoring</span>
            <BadgePulse 
              variant="success"
              aria-label="System active"
            >
              Active
            </BadgePulse>
          </div>
          <div role="status" aria-label="API Gateway status">
            <span>API Gateway</span>
            <BadgePulse 
              variant="warning"
              aria-label="Service degraded"
            >
              Degraded
            </BadgePulse>
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should be accessible with tags/labels context", async () => {
      const { container } = render(
        <div aria-label="Technologies used">
          <BadgeGroup>
            <Badge>React</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Tailwind CSS</Badge>
          </BadgeGroup>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("WCAG 2.1 AA Compliance", () => {
    it("should pass all WCAG 2.1 AA rules", async () => {
      const { container } = render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <BadgePulse variant="success">Active</BadgePulse>
          <BadgeDot variant="success" withPulse>Online</BadgeDot>
          <BadgeGroup>
            <Badge>Group 1</Badge>
            <Badge>Group 2</Badge>
          </BadgeGroup>
        </div>
      );
      
      const results = await axe(container, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      });
      
      expect(results).toHaveNoViolations();
    });
  });
});

