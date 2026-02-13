import { defineConfig, type Plugin } from 'vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

/**
 * Serve index-v4.html instead of index.html for the dev server.
 * This allows v4 to coexist with the existing frontend during development.
 * Rewrites ALL HTML navigation requests so SPA routing works correctly.
 */
function v4HtmlPlugin(): Plugin {
  return {
    name: 'v4-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || '';
        const isHtmlRequest = req.headers.accept?.includes('text/html');
        const isInternalOrAsset =
          url.startsWith('/api') ||
          url.startsWith('/socket.io') ||
          url.startsWith('/uploads') ||
          url.startsWith('/@') ||
          url.startsWith('/node_modules') ||
          url.includes('.');
        if (isHtmlRequest && !isInternalOrAsset) {
          req.url = '/index-v4.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    v4HtmlPlugin(),
    // MUST be before react() — generates route tree before React transform
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src-v4/routes',
      generatedRouteTree: './src-v4/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: ['rowlab.net'],
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        ws: true,
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src-v4'),
    },
  },
  build: {
    outDir: 'dist-v4',
    sourcemap: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index-v4.html'),
    },
  },
});
