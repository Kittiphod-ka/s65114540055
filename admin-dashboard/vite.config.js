import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/s65114540055',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: true,
    port: 10055,
    origin: `${process.env.VITE_API_URL}/s65114540055`,
  }
})
