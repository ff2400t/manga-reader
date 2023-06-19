// https://vitejs.dev/config/
export default {
  build: {
    lib: {
      entry: 'src/manga-reader.ts',
      formats: ['es'],
    },
    rollupOptions: {
      // external: /^lit/
    },
  },
}

