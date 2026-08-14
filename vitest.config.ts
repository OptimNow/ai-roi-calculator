import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Component tests (components/*.test.tsx) need @testing-library/react + jsdom,
    // which are not installed yet — only the pure calculation tests run for now.
    include: ['utils/**/*.test.ts'],
  },
});
