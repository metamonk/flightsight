declare module 'jest-axe' {
  import { ReactElement } from 'react'

  export interface JestAxeConfigureOptions {
    rules?: {
      [key: string]: { enabled: boolean }
    }
    globalOptions?: any
    impactLevels?: string[]
    resultTypes?: string[]
    runOnly?: {
      type: 'tag' | 'rule'
      values: string[]
    }
  }

  export interface AxeResults {
    violations: any[]
    passes: any[]
    incomplete: any[]
    inapplicable: any[]
  }

  export function axe(
    html: ReactElement | HTMLElement | string,
    options?: JestAxeConfigureOptions
  ): Promise<AxeResults>

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean
      message: () => string
    }
  }

  export function configureAxe(options: JestAxeConfigureOptions): typeof axe
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): any
  }
}
