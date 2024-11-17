import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
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
