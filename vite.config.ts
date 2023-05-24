import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      fileName: 'index',
      entry: 'src/manga-reader.ts',
      formats: ['es'],
    },
    rollupOptions: {
      // external: /^lit/
    },
  },
})