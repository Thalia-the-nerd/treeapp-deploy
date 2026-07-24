import { defineConfig } from 'vite';
import { resolve } from 'path';


import fs from 'fs';
import path from 'path';

const htmlFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = path.basename(file, '.html');
    acc[name] = resolve(__dirname, file);
    return acc;
  }, {});

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlFiles
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3003'
    }
  }
});
