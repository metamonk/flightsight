import { render, RenderOptions } from '@testing-library/react'
import { axe, toHaveNoViolations, JestAxeConfigureOptions } from 'jest-axe'
import { ReactElement } from 'react'

// Extend expect with jest-axe matchers (already done in setup.ts, but type-safe here)
expect.extend(toHaveNoViolations)

/**
 * Default axe configuration for accessibility testing
 */
export const defaultAxeConfig: JestAxeConfigureOptions = {
  rules: {
    // Customize rules as needed for your application
    // Example: Disable specific rules if they're not applicable
    // 'color-contrast': { enabled: false },
  },
}

/**
 * Run accessibility tests on a rendered component
 * @param container - The rendered component container
 * @param config - Optional axe configuration
 * @returns Promise resolving to axe results
 */
export async function testAccessibility(
  container: HTMLElement,
  config: JestAxeConfigureOptions = defaultAxeConfig
) {
  const results = await axe(container, config)
  expect(results).toHaveNoViolations()
  return results
}

/**
 * Render a component and run accessibility tests
 * @param ui - The component to render
 * @param options - Render options
 * @param axeConfig - Optional axe configuration
 * @returns Object with render result and accessibility test function
 */
export async function renderWithA11y(
  ui: ReactElement,
  options?: RenderOptions,
  axeConfig: JestAxeConfigureOptions = defaultAxeConfig
) {
  const renderResult = render(ui, options)
  const results = await axe(renderResult.container, axeConfig)
  
  return {
    ...renderResult,
    a11yResults: results,
  }
}

/**
 * Common accessibility testing scenarios
 */
export const a11yScenarios = {
  /**
   * Test keyboard navigation for a component
   */
  keyboardNavigation: {
    tabThrough: async (container: Element) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      return Array.from(focusableElements)
    },
    
    testFocusOrder: (elements: Element[]) => {
      elements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex')
        if (tabIndex && parseInt(tabIndex) > 0) {
          console.warn(
            `Element at index ${index} has positive tabindex (${tabIndex}). ` +
            'Consider using tabindex="0" or removing it for natural focus order.'
          )
        }
      })
    },
  },

  /**
   * Test ARIA attributes
   */
  ariaAttributes: {
    validateAriaLabels: (container: Element) => {
      const interactiveElements = container.querySelectorAll(
        'button, a, input, select, textarea'
      )
      
      const elementsWithoutLabels: Element[] = []
      
      interactiveElements.forEach((element) => {
        const hasAriaLabel = element.hasAttribute('aria-label')
        const hasAriaLabelledby = element.hasAttribute('aria-labelledby')
        const hasInnerText = element.textContent?.trim()
        const hasValue = (element as HTMLInputElement).value
        
        if (!hasAriaLabel && !hasAriaLabelledby && !hasInnerText && !hasValue) {
          elementsWithoutLabels.push(element)
        }
      })
      
      return elementsWithoutLabels
    },
  },

  /**
   * Test semantic HTML
   */
  semanticHTML: {
    validateLandmarks: (container: Element) => {
      const landmarks = container.querySelectorAll(
        'header, nav, main, article, section, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]'
      )
      return Array.from(landmarks)
    },
    
    validateHeadingHierarchy: (container: Element) => {
      const headings = Array.from(
        container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      )
      
      const hierarchy = headings.map((heading) => {
        const level = parseInt(heading.tagName[1])
        return { element: heading, level }
      })
      
      // Check for skipped levels
      for (let i = 1; i < hierarchy.length; i++) {
        const currentLevel = hierarchy[i].level
        const previousLevel = hierarchy[i - 1].level
        
        if (currentLevel - previousLevel > 1) {
          console.warn(
            `Heading hierarchy skip detected: ${hierarchy[i - 1].element.tagName} to ${hierarchy[i].element.tagName}`
          )
        }
      }
      
      return hierarchy
    },
  },
}

/**
 * Quick accessibility check wrapper
 * Use this in tests for a fast accessibility validation
 */
export async function expectNoA11yViolations(ui: ReactElement) {
  const { container, a11yResults } = await renderWithA11y(ui)
  expect(a11yResults).toHaveNoViolations()
  return container
}

/**
 * Generate accessibility report for a component
 * Useful for manual review and documentation
 */
export async function generateA11yReport(ui: ReactElement) {
  const { container } = render(ui)
  const results = await axe(container)
  
  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    summary: {
      totalViolations: results.violations.length,
      totalPasses: results.passes.length,
      totalIncomplete: results.incomplete.length,
    },
  }
}

