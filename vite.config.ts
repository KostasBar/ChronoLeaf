import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // allow serving files from one level up to project root
      allow: ['.']
    }
  },
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
