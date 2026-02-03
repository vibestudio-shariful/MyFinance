
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'date-fns', 'lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true
  }
});
