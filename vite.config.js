import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Absolute, not './': with client-side routing a relative base breaks as
  // soon as a URL has a trailing slash or another path segment.
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
