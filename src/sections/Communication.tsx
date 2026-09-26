import { useState } from 'react'
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react'
import { fmtDate } from '../data'
import type { Annonce } from '../data'
import { SectionHeader } from '../components/retro'

const tagStyle: Record<string, string> = {
  Voyage: 'bg-tangerine text-paper',
  Billetterie: 'bg-mustard text-cocoa',
  'Événement': 'bg-avocado text-paper',
}

interface Props {
  liste: Annonce[]
  onAdd: (a: Omit<Annonce, 'id'>) => void
  onDelete: (id: number) => void
}

export default function Communication({ liste, onAdd, onDelete }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ titre: '', texte: '', tag: 'Événement' })

  const soumettre = () => {
    if (!form.titre.trim() || !form.texte.trim()) return
    onAdd({
      titre: form.titre.trim(),
      texte: form.texte.trim(),
      tag: form.tag,
      date: new Date().toISOString().slice(0, 10),
    })
    setForm({ titre: '', texte: '', tag: 'Événement' })
    setOuvert(false)
  }

  return (
    <div>
      <SectionHeader kicker="Panneau d'affichage" title="Communication">
        <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
          <PlusCircle className="w-5 h-5" /> Nouvelle annonce
        </button>
      </SectionHeader>

      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouvelle annonce</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="retro-input md:col-span-2" placeholder="Titre de l'annonce" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            <select className="retro-input" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
              <option value="Événement">Événement</option>
              <option value="Voyage">Voyage</option>
              <option value="Billetterie">Billetterie</option>
              <option value="Divers">Divers</option>
            </select>
            <label className="block md:col-span-3">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Texte</span>
              <textarea
                className="retro-input mt-1 min-h-24"
                placeholder="Le texte de votre annonce…"
                value={form.texte}
                onChange={(e) => setForm({ ...form, texte: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Publier</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {liste.map((a, i) => (
          <article
            key={a.id}
            className={`retro-card p-6 relative group ${i % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]'} hover:rotate-0 transition-transform`}
          >
            {/* Punaise */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rust border-[3px] border-cocoa shadow-retro-sm" />
            <button
              onClick={() => onDelete(a.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper border-2 border-cocoa flex items-center justify-center text-rust opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust hover:text-paper"
              title="Retirer l'annonce"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between mb-3 mt-1">
              <span className={`retro-chip ${tagStyle[a.tag] ?? 'bg-salmon text-cocoa'}`}>{a.tag}</span>
              <span className="text-xs font-bold text-mocha">{fmtDate(a.date)}</span>
            </div>
            <h3 className="font-display text-lg text-rust leading-snug">{a.titre}</h3>
            <p className="mt-3 text-sm font-medium text-cocoa/90 leading-relaxed">{a.texte}</p>
            <div className="mt-4 h-2 groovy-wave opacity-50" />
          </article>
        ))}

        {/* Carte d'appel à contribution */}
        <div className="retro-card p-6 bg-cocoa text-paper flex flex-col items-center justify-center text-center rotate-[1deg] hover:rotate-0 transition-transform">
          <Megaphone className="w-10 h-10 text-mustard mb-3" />
          <h3 className="font-display text-lg text-mustard">Une annonce à passer ?</h3>
          <p className="mt-2 text-sm text-paper/80">Utilisez le bouton « Nouvelle annonce » — elle s'affiche aussitôt sur le panneau et reste enregistrée.</p>
          <button onClick={() => setOuvert(true)} className="retro-btn bg-tangerine text-paper mt-4 text-xs">Proposer une annonce</button>
        </div>
      </div>
    </div>
  )
}
