import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true, 
  },
  resolve: {
    alias: {
      phaser: 'phaser/dist/phaser.js', 
    },
  },
});
