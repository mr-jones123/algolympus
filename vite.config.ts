import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/algolympus/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/gemini-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/gemini-api/, '/v1beta/openai'),
        configure: (proxy) => {
          // Disable buffering so SSE chunks stream through immediately
          proxy.on('proxyReq', (_proxyReq, _req, res) => {
            res.setHeader('X-Accel-Buffering', 'no');
          });
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cache-control'] = 'no-cache';
            delete proxyRes.headers['content-length'];
          });
        },
      },
    },
  },
});
