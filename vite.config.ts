import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    open: true, 
  },
  resolve: {
    alias: {
      phaser: 'phaser/dist/phaser.js', 
      '@': path.resolve(__dirname, './src')
    },
  },
});
