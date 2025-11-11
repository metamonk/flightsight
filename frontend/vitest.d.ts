/// <reference types="vitest" />
/// <reference types="vitest/globals" />

declare module 'vitest' {
  import type {
    describe as _describe,
    it as _it,
    test as _test,
    expect as _expect,
    beforeEach as _beforeEach,
    afterEach as _afterEach,
    beforeAll as _beforeAll,
    afterAll as _afterAll,
    vi as _vi
  } from '@vitest/runner'

  export const describe: typeof _describe
  export const it: typeof _it
  export const test: typeof _test
  export const expect: typeof _expect
  export const beforeEach: typeof _beforeEach
  export const afterEach: typeof _afterEach
  export const beforeAll: typeof _beforeAll
  export const afterAll: typeof _afterAll
  export const vi: typeof _vi

  export * from '@vitest/runner'
  export * from '@vitest/expect'
  export * from '@vitest/spy'
}
