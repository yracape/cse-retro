import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

/**
 * Petit proxy local : le navigateur ne peut pas appeler Google Calendar
 * directement (blocage CORS). Le serveur de dev récupère le flux iCal
 * côté Node et le renvoie à l'application.
 * Sécurité : seules les URL calendar.google.com sont acceptées.
 */
function icalProxy(): Plugin {
  return {
    name: 'ical-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ical', async (req, res) => {
        try {
          const url = new URL(req.url ?? '', 'http://localhost')
          const cible = url.searchParams.get('url') ?? ''
          const cibleParsee = new URL(cible)
          if (cibleParsee.hostname !== 'calendar.google.com') {
            res.statusCode = 400
            res.end('Seules les adresses calendar.google.com sont acceptées.')
            return
          }
          const reponse = await fetch(cible)
          if (!reponse.ok) {
            res.statusCode = reponse.status
            res.end(`Google a répondu ${reponse.status} — vérifiez l'adresse iCal.`)
            return
          }
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
          res.end(await reponse.text())
        } catch (e) {
          res.statusCode = 500
          res.end(`Erreur proxy : ${e instanceof Error ? e.message : String(e)}`)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), icalProxy()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
