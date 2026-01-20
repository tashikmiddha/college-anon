import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Get backend URL from environment variable or use default for local dev
const backendUrl = loadEnv(process.env.NODE_ENV || 'development', process.cwd()).VITE_API_URL || 'http://localhost:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Vercel deployment configuration
  // These rewrites allow API calls to work seamlessly on Vercel
  // by proxying /api/* requests to your Render backend
  // Note: VITE_API_URL must be set in Vercel environment variables
  vercel: {
    rewrites: [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux']
        }
      }
    }
  }
});

