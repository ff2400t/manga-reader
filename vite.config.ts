import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
  // this is to make the library build of manga-reader;
  // i haven't found a way to make it work from npm scripts
  // so for now i have to manually set the env
  // `BUILD_MODE='lib' pnpm run build`
  if (process.env.BUILD_MODE === 'lib') {
    return {
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
  }
  return {}
})

