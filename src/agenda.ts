import type { Reunion } from './data'

/* ================= Import depuis Google Agenda (flux iCal) ================= */

/** Décode les échappements ICS (« \, » « \; » « \n »). */
const decoderIcs = (s: string) =>
  s.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\')

/** « 20261014T103000 » ou « 20261014 » → { date: '2026-10-14', heure: '10h30' } */
function parseDateIcs(valeur: string): { date: string; heure: string } | null {
  const t = valeur.trim()
  const complet = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(t)
  if (complet) {
    const [, a, m, j, h, min] = complet
    return { date: `${a}-${m}-${j}`, heure: `${h}h${min}` }
  }
  const jourSeul = /^(\d{4})(\d{2})(\d{2})$/.exec(t)
  if (jourSeul) {
    const [, a, m, j] = jourSeul
    return { date: `${a}-${m}-${j}`, heure: '09h00' }
  }
  return null
}

/**
 * Parse un flux iCal (Google Agenda) et renvoie les événements
 * sous forme de réunions prêtes à importer.
 */
export function parserIcs(texte: string): Omit<Reunion, 'id'>[] {
  // Déplie les lignes coupées (continuation = espace ou tabulation en début de ligne)
  const lignes = texte.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n')

  const reunions: Omit<Reunion, 'id'>[] = []
  let courant: Record<string, string> | null = null

  for (const ligne of lignes) {
    if (ligne === 'BEGIN:VEVENT') {
      courant = {}
      continue
    }
    if (ligne === 'END:VEVENT' && courant) {
      const debut = parseDateIcs(courant['DTSTART'] ?? '')
      if (debut && courant['SUMMARY']) {
        // Import volontairement minimal : titre + date + heure uniquement
        reunions.push({
          date: debut.date,
          heure: debut.heure,
          titre: decoderIcs(courant['SUMMARY']).replace(/^CSE — /, '').trim(),
          lieu: '',
          ordre: [],
          uid: courant['UID'],
        })
      }
      courant = null
      continue
    }
    if (courant) {
      const deuxPoints = ligne.indexOf(':')
      if (deuxPoints > 0) {
        // « DTSTART;TZID=Europe/Paris:20261014T103000 » → clé « DTSTART »
        const cle = ligne.slice(0, deuxPoints).split(';')[0].toUpperCase()
        courant[cle] = ligne.slice(deuxPoints + 1)
      }
    }
  }
  return reunions
}

/** Récupère le flux iCal via le proxy local du serveur de dev. */
export async function recupererCalendrierGoogle(icalUrl: string): Promise<Omit<Reunion, 'id'>[]> {
  const reponse = await fetch(`/api/ical?url=${encodeURIComponent(icalUrl)}`)
  if (!reponse.ok) {
    const detail = await reponse.text()
    throw new Error(detail || `Erreur ${reponse.status}`)
  }
  return parserIcs(await reponse.text())
}

/** « 14h00 » ou « 14:30 » → { h: 14, m: 0 } (défaut 14h00). */
function parseHeure(heure: string): { h: number; m: number } {
  const match = /(\d{1,2})\s*[h:]\s*(\d{2})/.exec(heure)
  if (!match) return { h: 14, m: 0 }
  return { h: Math.min(23, parseInt(match[1], 10)), m: Math.min(59, parseInt(match[2], 10)) }
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Date + heure de fin (durée par défaut : 1h30). */
function plage(r: Reunion): { debut: Date; fin: Date } {
  const { h, m } = parseHeure(r.heure)
  const debut = new Date(`${r.date}T${pad(h)}:${pad(m)}:00`)
  const fin = new Date(debut.getTime() + 90 * 60 * 1000)
  return { debut, fin }
}

const formatGoogle = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

/** Lien « Ajouter à Google Agenda » pré-rempli (aucune clé API requise). */
export function lienGoogleCalendar(r: Reunion): string {
  const { debut, fin } = plage(r)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `CSE — ${r.titre}`,
    dates: `${formatGoogle(debut)}/${formatGoogle(fin)}`,
    location: r.lieu,
    details: r.ordre.length > 0 ? `Ordre du jour :\n${r.ordre.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const formatIcs = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`

const echapperIcs = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Génère un fichier .ics importable dans Google Agenda (Paramètres → Importer). */
export function genererIcs(reunions: Reunion[], organisateur?: string): string {
  const evenements = reunions.map((r) => {
    const { debut, fin } = plage(r)
    return [
      'BEGIN:VEVENT',
      `UID:reunion-${r.id}@cse-retro`,
      `DTSTAMP:${formatIcs(new Date())}`,
      `DTSTART:${formatIcs(debut)}`,
      `DTEND:${formatIcs(fin)}`,
      `SUMMARY:${echapperIcs(`CSE — ${r.titre}`)}`,
      `LOCATION:${echapperIcs(r.lieu)}`,
      `DESCRIPTION:${echapperIcs(r.ordre.length > 0 ? `Ordre du jour : ${r.ordre.join(' | ')}` : '')}`,
      ...(organisateur ? [`ORGANIZER;CN=${echapperIcs('CSE')}:mailto:${organisateur}`] : []),
      'END:VEVENT',
    ].join('\r\n')
  })
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CSE Retro//Reunions//FR',
    'CALSCALE:GREGORIAN',
    ...evenements,
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Télécharge un fichier .ics (toutes les réunions ou une seule). */
export function telechargerIcs(reunions: Reunion[], organisateur?: string, nomFichier?: string) {
  const blob = new Blob([genererIcs(reunions, organisateur)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier ?? `reunions-cse-${new Date().toISOString().slice(0, 10)}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Envoie une invitation par e-mail :
 * télécharge le .ics de la réunion puis ouvre la messagerie avec un message
 * pré-rempli (le destinataire verra « Ajouter à l'agenda » dans Gmail/Outlook).
 */
export function envoyerParMail(r: Reunion, emailCSE: string) {
  const { debut } = plage(r)
  const dateFr = debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const heureFr = `${pad(debut.getHours())}h${pad(debut.getMinutes())}`

  // 1. Télécharge l'invitation .ics à joindre au message
  telechargerIcs([r], emailCSE || undefined, `invitation-cse-${r.date}.ics`)

  // 2. Ouvre la messagerie avec le message pré-rempli
  const sujet = `Invitation CSE — ${r.titre} (${dateFr})`
  const corps = [
    `Bonjour,`,
    ``,
    `Vous êtes convié(e) à la réunion du CSE :`,
    ``,
    `• ${r.titre}`,
    `• ${dateFr} à ${heureFr}`,
    `• Lieu : ${r.lieu}`,
    ...(r.ordre.length > 0 ? [``, `Ordre du jour :`, ...r.ordre.map((p, i) => `${i + 1}. ${p}`)] : []),
    ``,
    `Pour ajouter cette réunion à votre agenda (Google, Outlook…), ouvrez la pièce jointe « invitation-cse-${r.date}.ics » — elle se trouve dans vos téléchargements.`,
    ``,
    `Le bureau du CSE`,
  ].join('\n')

  const params = new URLSearchParams({ subject: sujet, body: corps })
  window.location.href = `mailto:?${params.toString()}`
}
