/**
 * Récupère le flux iCal du calendrier Google et l'écrit dans
 * public/calendrier.ics — il sera déployé avec le site statique.
 * L'adresse est fournie par le secret GitHub Actions ICAL_URL.
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const url = process.env.ICAL_URL
if (!url) {
  console.error('ICAL_URL manquant (secret GitHub Actions non configuré)')
  process.exit(1)
}

const reponse = await fetch(url)
if (!reponse.ok) {
  console.error(`Google a répondu ${reponse.status}`)
  process.exit(1)
}

const texte = await reponse.text()
if (!texte.includes('BEGIN:VCALENDAR')) {
  console.error('La réponse ne ressemble pas à un flux iCal')
  process.exit(1)
}

mkdirSync('public', { recursive: true })
writeFileSync('public/calendrier.ics', texte, 'utf-8')
console.log(`calendrier.ics écrit (${texte.length} caractères)`)
