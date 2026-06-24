import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Serve index-admin.html for all routes (SPA fallback)
    {
      name: 'admin-html-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve index-admin.html for root and unknown routes
          if (req.url === '/' || (!req.url.includes('.') && !req.url.startsWith('/@') && !req.url.startsWith('/src') && !req.url.startsWith('/node_modules'))) {
            req.url = '/index-admin.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: 'index-admin.html',
    },
    outDir: 'dist-admin',
  },
  server: {
    port: 5174,
    open: true,
  },
})
