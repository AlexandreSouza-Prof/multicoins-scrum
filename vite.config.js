import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Libera acesso para outros computadores e celulares na mesma rede Wi-Fi / LAN
    port: 5173,
    allowedHosts: true, // Permite acesso via túneis públicos como localtunnel (.loca.lt)
  },
})
