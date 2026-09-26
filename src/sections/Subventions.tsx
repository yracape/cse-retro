import { useState } from 'react'
import { Check, X, HandCoins, PlusCircle } from 'lucide-react'
import { fmt, fmtDate } from '../data'
import type { Subvention } from '../data'
import { SectionHeader } from '../components/retro'

const statutStyle: Record<Subvention['statut'], string> = {
  'En attente': 'bg-mustard text-cocoa',
  'Approuvée': 'bg-avocado text-paper',
  'Refusée': 'bg-rust text-paper',
}

interface Props {
  liste: Subvention[]
  onDecide: (id: number, ok: boolean) => void
  onAdd: (s: Omit<Subvention, 'id'>) => void
}

export default function Subventions({ liste, onDecide, onAdd }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ demandeur: '', motif: '', montant: '' })

  const enAttente = liste.filter((s) => s.statut === 'En attente')
  const totalApprouve = liste.filter((s) => s.statut === 'Approuvée').reduce((s, x) => s + x.montant, 0)

  const soumettre = () => {
    const montant = parseFloat(form.montant.replace(',', '.'))
    if (!form.demandeur.trim() || !form.motif.trim() || isNaN(montant) || montant <= 0) return
    onAdd({
      demandeur: form.demandeur.trim(),
      motif: form.motif.trim(),
      montant,
      date: new Date().toISOString().slice(0, 10),
      statut: 'En attente',
    })
    setForm({ demandeur: '', motif: '', montant: '' })
    setOuvert(false)
  }

  return (
    <div>
      <SectionHeader kicker="Aides sociales" title="Subventions">
        <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
          <PlusCircle className="w-5 h-5" /> Nouvelle demande
        </button>
      </SectionHeader>

      <div className="retro-card p-5 mb-8 flex flex-wrap items-center gap-6 retro-dots">
        <HandCoins className="w-10 h-10 text-tangerine" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mocha">Demandes en attente</p>
          <p className="font-display text-2xl text-cocoa">{enAttente.length}</p>
        </div>
        <div className="w-1 self-stretch bg-cocoa/20 rounded-full" />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-mocha">Total approuvé</p>
          <p className="font-display text-2xl text-tangerine">{fmt(totalApprouve)}</p>
        </div>
      </div>

      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouvelle demande de subvention</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="retro-input" placeholder="Demandeur (ex. Simone Dubois)" value={form.demandeur} onChange={(e) => setForm({ ...form, demandeur: e.target.value })} />
            <input className="retro-input" placeholder="Motif (ex. Colonie de vacances)" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
            <input className="retro-input" placeholder="Montant (€)" inputMode="decimal" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Enregistrer</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {liste.map((s) => (
          <div key={s.id} className="retro-card p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-display text-lg text-cocoa">{s.demandeur}</p>
                <span className={`retro-chip ${statutStyle[s.statut]}`}>{s.statut}</span>
              </div>
              <p className="text-mocha font-medium mt-1">{s.motif}</p>
              <p className="text-xs text-mocha mt-1">Déposée le {fmtDate(s.date)}</p>
            </div>
            <p className="font-display text-2xl text-tangerine">{fmt(s.montant)}</p>
            {s.statut === 'En attente' && (
              <div className="flex gap-2">
                <button onClick={() => onDecide(s.id, true)} className="retro-btn bg-avocado text-paper text-xs" title="Approuver">
                  <Check className="w-4 h-4" /> Approuver
                </button>
                <button onClick={() => onDecide(s.id, false)} className="retro-btn bg-rust text-paper text-xs" title="Refuser">
                  <X className="w-4 h-4" /> Refuser
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {liste.length === 0 && (
        <div className="retro-card p-10 text-center">
          <p className="font-display text-xl text-rust">Aucune demande…</p>
          <p className="text-mocha mt-2">Les nouvelles demandes apparaîtront ici.</p>
        </div>
      )}
    </div>
  )
}
