import { useRef, useState } from 'react'
import { Search, UserRound, PlusCircle, Trash2, Download, Upload } from 'lucide-react'
import type { Beneficiaire } from '../data'
import { telechargerCsv, parseCsv, normaliser, lireFichier } from '../csv'
import { SectionHeader } from '../components/retro'

const quotientStyle: Record<Beneficiaire['quotient'], string> = {
  Q1: 'bg-avocado text-paper',
  Q2: 'bg-mustard text-cocoa',
  Q3: 'bg-tangerine text-paper',
}

interface Props {
  liste: Beneficiaire[]
  onAdd: (b: Omit<Beneficiaire, 'id'>) => void
  onImport: (bs: Omit<Beneficiaire, 'id'>[]) => void
  onDelete: (id: number) => void
}

export default function Beneficiaires({ liste, onAdd, onImport, onDelete }: Props) {
  const [recherche, setRecherche] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [message, setMessage] = useState('')
  const fichierRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ prenom: '', nom: '', service: '', anciennete: '', quotient: 'Q1' as Beneficiaire['quotient'], points: '' })

  // Export CSV — même format que l'import
  const exporterCSV = () => {
    telechargerCsv(`beneficiaires-cse-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Prénom', 'Nom', 'Service', 'Ancienneté', 'Quotient', 'Points'],
      ...liste.map((b) => [b.prenom, b.nom, b.service, String(b.anciennete), b.quotient, String(b.points)]),
    ])
  }

  // Import CSV — même format que l'export
  const importerCSV = async (fichier: File) => {
    const lignesCsv = parseCsv(await lireFichier(fichier))
    const corps = normaliser(lignesCsv[0]?.[0] ?? '').includes('prenom') ? lignesCsv.slice(1) : lignesCsv
    const valides: Omit<Beneficiaire, 'id'>[] = []
    for (const l of corps) {
      const [prenom, nom, service, anciennete, quotient, points] = l
      if (!prenom?.trim() || !nom?.trim()) continue
      const q = quotient?.trim().toUpperCase()
      valides.push({
        prenom: prenom.trim(),
        nom: nom.trim(),
        service: service?.trim() || 'Non renseigné',
        anciennete: parseInt(anciennete, 10) || 0,
        quotient: q === 'Q2' || q === 'Q3' ? q : 'Q1',
        points: parseInt(points, 10) || 0,
      })
    }
    if (valides.length > 0) {
      onImport(valides)
      setMessage(`${valides.length} bénéficiaire${valides.length > 1 ? 's' : ''} importé${valides.length > 1 ? 's' : ''} !`)
    } else {
      setMessage("Aucune ligne valide — vérifiez le format (Prénom;Nom;Service;Ancienneté;Quotient;Points).")
    }
    setTimeout(() => setMessage(''), 5000)
  }

  const resultats = liste.filter((b) =>
    `${b.prenom} ${b.nom} ${b.service}`.toLowerCase().includes(recherche.toLowerCase())
  )

  const soumettre = () => {
    const anc = parseInt(form.anciennete, 10)
    const pts = parseInt(form.points, 10)
    if (!form.prenom.trim() || !form.nom.trim() || !form.service.trim()) return
    onAdd({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      service: form.service.trim(),
      anciennete: isNaN(anc) ? 0 : anc,
      quotient: form.quotient,
      points: isNaN(pts) ? 0 : pts,
    })
    setForm({ prenom: '', nom: '', service: '', anciennete: '', quotient: 'Q1', points: '' })
    setOuvert(false)
  }

  return (
    <div>
      <SectionHeader kicker="Fichier du personnel" title="Bénéficiaires">
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
            <PlusCircle className="w-5 h-5" /> Nouveau bénéficiaire
          </button>
          <button onClick={exporterCSV} className="retro-btn bg-avocado text-paper" title="Exporter le fichier du personnel en CSV">
            <Download className="w-5 h-5" /> Exporter
          </button>
          <button onClick={() => fichierRef.current?.click()} className="retro-btn bg-salmon text-cocoa" title="Importer un fichier CSV (même format que l'export)">
            <Upload className="w-5 h-5" /> Importer
          </button>
          <input
            ref={fichierRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importerCSV(f)
              e.target.value = ''
            }}
          />
        </div>
      </SectionHeader>

      {message && (
        <div className="retro-card p-4 mb-6 bg-mustard/40 border-mustard">
          <p className="font-bold text-cocoa">{message}</p>
        </div>
      )}

      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouveau bénéficiaire</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="retro-input" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            <input className="retro-input" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            <input className="retro-input" placeholder="Service" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} />
            <input className="retro-input" placeholder="Ancienneté (ans)" inputMode="numeric" value={form.anciennete} onChange={(e) => setForm({ ...form, anciennete: e.target.value })} />
            <select className="retro-input" value={form.quotient} onChange={(e) => setForm({ ...form, quotient: e.target.value as Beneficiaire['quotient'] })}>
              <option value="Q1">Quotient Q1</option>
              <option value="Q2">Quotient Q2</option>
              <option value="Q3">Quotient Q3</option>
            </select>
            <input className="retro-input" placeholder="Points" inputMode="numeric" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Enregistrer</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mocha" />
        <input
          className="retro-input pl-12"
          placeholder="Rechercher un salarié, un service…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {resultats.map((b) => (
          <div key={b.id} className="retro-card p-5 text-center relative group">
            <button
              onClick={() => onDelete(b.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper border-2 border-cocoa flex items-center justify-center text-rust opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust hover:text-paper"
              title="Retirer le bénéficiaire"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 mx-auto rounded-full bg-salmon border-[3px] border-cocoa flex items-center justify-center mb-3">
              <UserRound className="w-8 h-8 text-cocoa" />
            </div>
            <p className="font-display text-lg text-cocoa">{b.prenom} {b.nom}</p>
            <p className="text-sm text-mocha font-semibold">{b.service}</p>
            <div className="flex justify-center gap-2 mt-3">
              <span className={`retro-chip ${quotientStyle[b.quotient]}`}>{b.quotient}</span>
              <span className="retro-chip bg-cream text-cocoa">{b.anciennete} ans</span>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-dashed border-cocoa/40">
              <p className="text-xs uppercase tracking-widest text-mocha font-bold">Compteur de points</p>
              <p className="font-display text-xl text-tangerine">{b.points} pts</p>
            </div>
          </div>
        ))}
      </div>

      {resultats.length === 0 && (
        <div className="retro-card p-10 text-center">
          <p className="font-display text-xl text-rust">Aucun bénéficiaire trouvé…</p>
          <p className="text-mocha mt-2">Essayez un autre nom ou service.</p>
        </div>
      )}
    </div>
  )
}
