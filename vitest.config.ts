import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**', 'src/types/**', 'src/generators/**', 'src/simulation/**', 'src/persistence/**'],
      thresholds: {
        lines: 80,
      },
    },
  },
});
