import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // เพิ่มบรรทัดนี้
  },
  server: {
    host: true,
    port: 10055  
  }
})
