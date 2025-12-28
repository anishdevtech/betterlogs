import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true, // Reset mocks between tests automatically
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});
