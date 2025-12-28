import pages from '@hono/vite-cloudflare-pages'
import adapter from '@hono/vite-dev-server/cloudflare'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [react()],
      build: {
        target: 'esnext', // Permite recursos modernos
        rollupOptions: {
          input: './index.html',
          output: {
            entryFileNames: 'static/[name]-[hash].js',
            chunkFileNames: 'static/[name]-[hash].js',
            assetFileNames: 'static/[name]-[hash].[ext]'
          }
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    }
  }

  return {
    plugins: [
      pages(),
      devServer({
        adapter,
        entry: 'src/index.tsx'
      })
    ],
    server: {
      allowedHosts: true,
    },
    build: {
      target: 'esnext' // Importante para o Worker suportar await
    }
  }
})
