import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Node by default — the calculation tests are pure and need no DOM.
    // Component tests opt into jsdom with a `@vitest-environment jsdom` docblock.
    environment: 'node',
    include: ['utils/**/*.test.ts', 'components/**/*.test.tsx'],
  },
});
