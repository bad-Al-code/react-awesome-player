import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactAwesomePlayer',
      fileName: 'react-awesome-player',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'hls.js', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'hls.js': 'Hls',
          'lucide-react': 'lucide-react',
        },
      },
    },
  },
});
