import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Node by default — the calculation tests are pure and need no DOM.
    // Component tests opt into jsdom with a `@vitest-environment jsdom` docblock.
    environment: 'node',
    include: ['utils/**/*.test.ts', 'components/**/*.test.tsx'],
    // Vitest's default `forks` pool times out spawning workers on some Windows
    // machines, and — the dangerous part — reports success having run nothing at
    // all, so a red suite can look green. Threads start reliably and, for a suite
    // this small and this pure, faster.
    pool: 'threads',
    // A suite that matches no files is a broken config, not a pass.
    passWithNoTests: false,
  },
});
