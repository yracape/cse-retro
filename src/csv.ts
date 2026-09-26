/**
 * Utilitaires CSV — format « Excel français » :
 * séparateur point-virgule, champs entre guillemets, BOM UTF-8.
 */

export const echapperCsv = (s: string) => `"${s.replace(/"/g, '""')}"`

export const montantCsv = (n: number) => n.toFixed(2).replace('.', ',')

/** Télécharge un tableau de lignes CSV (avec BOM pour Excel). */
export function telechargerCsv(nomFichier: string, lignes: string[][]) {
  const contenu = lignes.map((l) => l.map(echapperCsv).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + contenu], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  a.click()
  URL.revokeObjectURL(url)
}

/** Parse un texte CSV (point-virgule, guillemets, BOM optionnel). */
export function parseCsv(texte: string): string[][] {
  // Retire le BOM éventuel
  const src = texte.replace(/^﻿/, '')
  const lignes: string[][] = []
  let champ = ''
  let ligne: string[] = []
  let dansGuillemets = false

  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (dansGuillemets) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          champ += '"'
          i++
        } else {
          dansGuillemets = false
        }
      } else {
        champ += c
      }
    } else if (c === '"') {
      dansGuillemets = true
    } else if (c === ';') {
      ligne.push(champ)
      champ = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++
      ligne.push(champ)
      champ = ''
      if (ligne.some((v) => v.trim() !== '')) lignes.push(ligne)
      ligne = []
    } else {
      champ += c
    }
  }
  ligne.push(champ)
  if (ligne.some((v) => v.trim() !== '')) lignes.push(ligne)
  return lignes
}

/** Convertit « 1 234,56 » ou « 1234.56 » en nombre. */
export function parseMontantCsv(s: string): number {
  const nettoye = s.replace(/\s/g, '').replace(',', '.')
  return parseFloat(nettoye)
}

/** Minuscules sans accents — pour comparer les en-têtes quel que soit l'encodage. */
export function normaliser(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Accepte une date ISO « 1968-09-20 » ou française « 20/09/1968 »
 * (Excel réécrit les dates au format français à l'enregistrement)
 * et renvoie toujours l'ISO, ou null si illisible.
 */
export function parseDateCsv(s: string): string | null {
  const t = (s ?? '').trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (iso) return t
  const fr = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/.exec(t)
  if (fr) {
    const [, j, m, a] = fr
    return `${a}-${m.padStart(2, '0')}-${j.padStart(2, '0')}`
  }
  return null
}

/**
 * Lit un fichier texte choisi par l'utilisateur.
 * Excel enregistre souvent en ANSI (windows-1252) : si la lecture UTF-8
 * produit des caractères de remplacement, on retente en windows-1252.
 */
export function lireFichier(fichier: File): Promise<string> {
  const lire = (encodage: string) =>
    new Promise<string>((resolve, reject) => {
      const lecteur = new FileReader()
      lecteur.onload = () => resolve(String(lecteur.result ?? ''))
      lecteur.onerror = () => reject(lecteur.error)
      lecteur.readAsText(fichier, encodage)
    })
  return lire('utf-8').then((texte) =>
    texte.includes('�') ? lire('windows-1252') : texte
  )
}
