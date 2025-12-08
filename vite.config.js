import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3001,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        privacy: 'privacy.html'
      }
    }
  }
})
