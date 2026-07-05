import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase vendor chunk
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
          ],
          // Animation and motion vendor chunk
          'vendor-motion': ['framer-motion'],
          // UI libraries vendor chunk
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          // React router chunk
          'vendor-router': ['react-router-dom'],
          // React core chunk
          'vendor-react': ['react', 'react-dom'],
          // Helmet chunk
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },
  },
});
