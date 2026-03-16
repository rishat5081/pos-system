import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('src/renderer/src'),
      '@main': resolve('src/main'),
      '@preload': resolve('src/preload')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/renderer/src/test/setup.ts'],
    testTimeout: 10000,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
  }
});
