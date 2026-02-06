import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: false, // Don't check coverage for untested files (fixes sourcemap error)
      exclude: [
        'node_modules/**',
        'tests/**',
        '*.config.js',
        'js/composers.js', // Data file
        'js/rag-rules.js', // Config file
        'js/config.js'     // Config file
      ]
    }
  }
});
