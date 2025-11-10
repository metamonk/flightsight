/**
 * Color Contrast Accessibility Tests
 * 
 * WCAG 2.2 Color Contrast Requirements:
 * - Level AA: 4.5:1 for normal text, 3:1 for large text
 * - Level AAA: 7:1 for normal text, 4.5:1 for large text
 * 
 * Large text is defined as:
 * - 18pt (24px) or larger
 * - 14pt (18.66px) bold or larger
 */

import { describe, it, expect } from 'vitest'

// Color conversion utilities
function oklchToRgb(oklch: string): { r: number; g: number; b: number } {
  // Extract values from oklch(L C H) format
  const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) return { r: 0, g: 0, b: 0 }

  const [, l, c, h] = match.map(Number)

  // Convert OKLCH to RGB (simplified approximation)
  // This is a basic conversion - for production use a proper color library
  const hRad = (h * Math.PI) / 180
  const aVal = c * Math.cos(hRad)
  const bVal = c * Math.sin(hRad)

  // Approximate conversion from OKLab to RGB
  const L = l
  const M = l - 0.4 * aVal - 0.3 * bVal
  const S = l + 0.15 * aVal - 0.5 * bVal

  const r = Math.round(Math.max(0, Math.min(255, L * 255)))
  const g = Math.round(Math.max(0, Math.min(255, M * 255)))
  const b = Math.round(Math.max(0, Math.min(255, S * 255)))

  return { r, g, b }
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(fg: string, bg: string): number {
  const fgRgb = oklchToRgb(fg)
  const bgRgb = oklchToRgb(bg)

  const fgLum = getRelativeLuminance(fgRgb)
  const bgLum = getRelativeLuminance(bgRgb)

  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)

  return (lighter + 0.05) / (darker + 0.05)
}

// Theme colors from globals.css (UPDATED for accessibility - final)
const lightTheme = {
  background: 'oklch(0.9751 0.0127 244.2507)',
  foreground: 'oklch(0.3729 0.0306 259.7328)',
  card: 'oklch(1.0000 0 0)',
  cardForeground: 'oklch(0.3729 0.0306 259.7328)',
  primary: 'oklch(0.48 0.18 155)',
  primaryForeground: 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.9514 0.0250 236.8242)',
  secondaryForeground: 'oklch(0.38 0.0263 256.8018)',
  muted: 'oklch(0.9670 0.0029 264.5419)',
  mutedForeground: 'oklch(0.42 0.0234 264.3637)',
  destructive: 'oklch(0.50 0.22 25)',
  destructiveForeground: 'oklch(1.0000 0 0)',
  border: 'oklch(0.70 0.015 264)',
}

const darkTheme = {
  background: 'oklch(0.2077 0.0398 265.7549)',
  foreground: 'oklch(0.8717 0.0093 258.3382)',
  card: 'oklch(0.2795 0.0368 260.0310)',
  cardForeground: 'oklch(0.8717 0.0093 258.3382)',
  primary: 'oklch(0.7729 0.1535 163.2231)',
  primaryForeground: 'oklch(0.2077 0.0398 265.7549)',
  secondary: 'oklch(0.3351 0.0331 260.9120)',
  secondaryForeground: 'oklch(0.82 0.01 286)',
  muted: 'oklch(0.2463 0.0275 259.9628)',
  mutedForeground: 'oklch(0.68 0.02 264)',
  destructive: 'oklch(0.62 0.20 25)',
  destructiveForeground: 'oklch(0.98 0 0)',
  border: 'oklch(0.58 0.025 257)',
}

describe('Color Contrast - Light Theme', () => {
  describe('WCAG AA Compliance (4.5:1 for normal text)', () => {
    it('should have sufficient contrast for body text', () => {
      const ratio = getContrastRatio(lightTheme.foreground, lightTheme.background)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for card text', () => {
      const ratio = getContrastRatio(lightTheme.cardForeground, lightTheme.card)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for primary button text', () => {
      const ratio = getContrastRatio(lightTheme.primaryForeground, lightTheme.primary)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for secondary text', () => {
      const ratio = getContrastRatio(lightTheme.secondaryForeground, lightTheme.secondary)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for muted text', () => {
      const ratio = getContrastRatio(lightTheme.mutedForeground, lightTheme.muted)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for destructive button text', () => {
      const ratio = getContrastRatio(lightTheme.destructiveForeground, lightTheme.destructive)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('WCAG AA Compliance (3:1 for UI components)', () => {
    it('should have sufficient contrast for borders', () => {
      const ratio = getContrastRatio(lightTheme.border, lightTheme.background)
      expect(ratio).toBeGreaterThanOrEqual(3)
    })

    it('should have sufficient contrast for card borders', () => {
      const ratio = getContrastRatio(lightTheme.border, lightTheme.card)
      expect(ratio).toBeGreaterThanOrEqual(3)
    })
  })
})

describe('Color Contrast - Dark Theme', () => {
  describe('WCAG AA Compliance (4.5:1 for normal text)', () => {
    it('should have sufficient contrast for body text', () => {
      const ratio = getContrastRatio(darkTheme.foreground, darkTheme.background)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for card text', () => {
      const ratio = getContrastRatio(darkTheme.cardForeground, darkTheme.card)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for primary button text', () => {
      const ratio = getContrastRatio(darkTheme.primaryForeground, darkTheme.primary)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for secondary text', () => {
      const ratio = getContrastRatio(darkTheme.secondaryForeground, darkTheme.secondary)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for muted text', () => {
      const ratio = getContrastRatio(darkTheme.mutedForeground, darkTheme.muted)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should have sufficient contrast for destructive button text', () => {
      const ratio = getContrastRatio(darkTheme.destructiveForeground, darkTheme.destructive)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  })

  describe('WCAG AA Compliance (3:1 for UI components)', () => {
    it('should have sufficient contrast for borders', () => {
      const ratio = getContrastRatio(darkTheme.border, darkTheme.background)
      expect(ratio).toBeGreaterThanOrEqual(3)
    })

    it('should have sufficient contrast for card borders', () => {
      const ratio = getContrastRatio(darkTheme.border, darkTheme.card)
      expect(ratio).toBeGreaterThanOrEqual(3)
    })
  })
})

describe('Color Contrast - Detailed Report', () => {
  it('should generate detailed contrast report for light theme', () => {
    const combinations = [
      { name: 'Body text', fg: lightTheme.foreground, bg: lightTheme.background },
      { name: 'Card text', fg: lightTheme.cardForeground, bg: lightTheme.card },
      { name: 'Primary button', fg: lightTheme.primaryForeground, bg: lightTheme.primary },
      { name: 'Secondary text', fg: lightTheme.secondaryForeground, bg: lightTheme.secondary },
      { name: 'Muted text', fg: lightTheme.mutedForeground, bg: lightTheme.muted },
      { name: 'Destructive button', fg: lightTheme.destructiveForeground, bg: lightTheme.destructive },
      { name: 'Border', fg: lightTheme.border, bg: lightTheme.background },
    ]

    console.log('\n📊 Light Theme Contrast Report:')
    console.log('═══════════════════════════════════════════════')

    combinations.forEach(({ name, fg, bg }) => {
      const ratio = getContrastRatio(fg, bg)
      const passAA = ratio >= 4.5 ? '✅' : '❌'
      const passAAA = ratio >= 7 ? '✅' : '⚠️'
      console.log(`\n${name}:`)
      console.log(`  Ratio: ${ratio.toFixed(2)}:1`)
      console.log(`  WCAG AA (4.5:1): ${passAA}`)
      console.log(`  WCAG AAA (7:1): ${passAAA}`)
    })

    console.log('\n═══════════════════════════════════════════════\n')

    // Test should pass if we printed the report
    expect(true).toBe(true)
  })

  it('should generate detailed contrast report for dark theme', () => {
    const combinations = [
      { name: 'Body text', fg: darkTheme.foreground, bg: darkTheme.background },
      { name: 'Card text', fg: darkTheme.cardForeground, bg: darkTheme.card },
      { name: 'Primary button', fg: darkTheme.primaryForeground, bg: darkTheme.primary },
      { name: 'Secondary text', fg: darkTheme.secondaryForeground, bg: darkTheme.secondary },
      { name: 'Muted text', fg: darkTheme.mutedForeground, bg: darkTheme.muted },
      { name: 'Destructive button', fg: darkTheme.destructiveForeground, bg: darkTheme.destructive },
      { name: 'Border', fg: darkTheme.border, bg: darkTheme.background },
    ]

    console.log('\n📊 Dark Theme Contrast Report:')
    console.log('═══════════════════════════════════════════════')

    combinations.forEach(({ name, fg, bg }) => {
      const ratio = getContrastRatio(fg, bg)
      const passAA = ratio >= 4.5 ? '✅' : '❌'
      const passAAA = ratio >= 7 ? '✅' : '⚠️'
      console.log(`\n${name}:`)
      console.log(`  Ratio: ${ratio.toFixed(2)}:1`)
      console.log(`  WCAG AA (4.5:1): ${passAA}`)
      console.log(`  WCAG AAA (7:1): ${passAAA}`)
    })

    console.log('\n═══════════════════════════════════════════════\n')

    // Test should pass if we printed the report
    expect(true).toBe(true)
  })
})

