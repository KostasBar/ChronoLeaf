import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ChronoLeaf',
      formats: ['es', 'cjs', 'umd'],
      fileName: format => `chrono-leaf.${format}.js`
    },
    sourcemap: true,
  }
});
