import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Phaser를 별도 청크로 분리
        manualChunks(id: string) {
          if (id.includes('phaser')) return 'phaser'
          if (id.includes('@supabase')) return 'supabase'
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('react/')
          ) return 'vendor'
          return undefined
        },
      },
    },
  },
})
