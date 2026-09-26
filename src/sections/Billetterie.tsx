import { useState } from 'react'
import { Clapperboard, FerrisWheel, MountainSnow, Landmark, Waves, Tent, ShoppingCart, PlusCircle, Trash2 } from 'lucide-react'
import { fmt } from '../data'
import type { Offre } from '../data'
import { SectionHeader } from '../components/retro'

const icones: Record<string, typeof Clapperboard> = {
  clapperboard: Clapperboard,
  'ferris-wheel': FerrisWheel,
  'mountain-snow': MountainSnow,
  landmark: Landmark,
  waves: Waves,
  tent: Tent,
}

const choixIcones = [
  { id: 'clapperboard', label: 'Cinéma' },
  { id: 'ferris-wheel', label: 'Parc' },
  { id: 'mountain-snow', label: 'Ski' },
  { id: 'landmark', label: 'Musée' },
  { id: 'waves', label: 'Piscine' },
  { id: 'tent', label: 'Spectacle' },
]

const fonds = ['bg-tangerine', 'bg-mustard', 'bg-salmon', 'bg-avocado']

interface Props {
  offres: Offre[]
  onVendre: (id: number) => void
  onAdd: (o: Omit<Offre, 'id'>) => void
  onDelete: (id: number) => void
}

export default function Billetterie({ offres, onVendre, onAdd, onDelete }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ titre: '', categorie: 'Culture', prixPublic: '', prixCSE: '', stock: '', icone: 'clapperboard' })

  const soumettre = () => {
    const pp = parseFloat(form.prixPublic.replace(',', '.'))
    const pc = parseFloat(form.prixCSE.replace(',', '.'))
    const st = parseInt(form.stock, 10)
    if (!form.titre.trim() || isNaN(pp) || isNaN(pc) || isNaN(st) || pp <= 0 || pc < 0 || st < 0) return
    onAdd({ titre: form.titre.trim(), categorie: form.categorie, prixPublic: pp, prixCSE: pc, stock: st, icone: form.icone })
    setForm({ titre: '', categorie: 'Culture', prixPublic: '', prixCSE: '', stock: '', icone: 'clapperboard' })
    setOuvert(false)
  }

  return (
    <div>
      <SectionHeader kicker="Tarifs préférentiels" title="Billetterie">
        <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
          <PlusCircle className="w-5 h-5" /> Nouvelle offre
        </button>
      </SectionHeader>

      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouvelle offre de billetterie</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="retro-input md:col-span-2" placeholder="Titre (ex. Cinéma Le Balzac)" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            <input className="retro-input" placeholder="Catégorie (ex. Culture)" value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} />
            <input className="retro-input" placeholder="Prix public (€)" inputMode="decimal" value={form.prixPublic} onChange={(e) => setForm({ ...form, prixPublic: e.target.value })} />
            <input className="retro-input" placeholder="Prix CSE (€)" inputMode="decimal" value={form.prixCSE} onChange={(e) => setForm({ ...form, prixCSE: e.target.value })} />
            <div className="flex gap-2">
              <input className="retro-input" placeholder="Stock" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <select className="retro-input" value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })}>
                {choixIcones.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Enregistrer</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {offres.map((o, i) => {
          const Icone = icones[o.icone] ?? Clapperboard
          const epuise = o.stock === 0
          return (
            <div key={o.id} className="retro-card overflow-hidden flex flex-col group relative">
              <button
                onClick={() => onDelete(o.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-paper border-2 border-cocoa flex items-center justify-center text-rust opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust hover:text-paper"
                title="Supprimer l'offre"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className={`${fonds[i % fonds.length]} border-b-[3px] border-cocoa p-6 flex items-center justify-between`}>
                <Icone className="w-12 h-12 text-paper drop-shadow-[2px_2px_0_#4A2C14]" strokeWidth={2} />
                <span className="retro-chip bg-paper text-cocoa">{o.categorie}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-lg text-cocoa">{o.titre}</h3>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="font-display text-2xl text-tangerine">{fmt(o.prixCSE)}</span>
                  <span className="text-mocha line-through">{fmt(o.prixPublic)}</span>
                  {o.prixPublic > 0 && (
                    <span className="retro-chip bg-avocado text-paper ml-auto">−{Math.round((1 - o.prixCSE / o.prixPublic) * 100)}%</span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-sm font-bold ${o.stock < 15 ? 'text-rust' : 'text-mocha'}`}>
                    {epuise ? 'Épuisé !' : `${o.stock} billets en stock`}
                  </span>
                  <button
                    onClick={() => onVendre(o.id)}
                    disabled={epuise}
                    className={`retro-btn text-xs ${epuise ? 'bg-muted text-mocha opacity-50 cursor-not-allowed' : 'bg-tangerine text-paper'}`}
                  >
                    <ShoppingCart className="w-4 h-4" /> Vendre
                  </button>
                </div>
                {/* Jauge de stock */}
                <div className="mt-3 h-3 rounded-full border-2 border-cocoa bg-cream overflow-hidden">
                  <div
                    className={`h-full ${o.stock < 15 ? 'bg-rust' : 'bg-avocado'} transition-all`}
                    style={{ width: `${Math.min(100, (o.stock / 150) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {offres.length === 0 && (
        <div className="retro-card p-10 text-center">
          <p className="font-display text-xl text-rust">Aucune offre pour le moment…</p>
          <p className="text-mocha mt-2">Ajoutez votre première offre avec le bouton ci-dessus.</p>
        </div>
      )}
    </div>
  )
}
