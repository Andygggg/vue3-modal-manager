import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'lib_dist',
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    emptyOutDir: true,
    copyPublicDir: false,
  },
})
