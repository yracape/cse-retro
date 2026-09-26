import { useRef, useState } from 'react'
import { PlusCircle, ArrowDownCircle, ArrowUpCircle, Trash2, Pencil, Save, Download, Upload } from 'lucide-react'
import { fmt, fmtDate } from '../data'
import type { Transaction, Budgets } from '../data'
import { telechargerCsv, parseCsv, parseMontantCsv, parseDateCsv, normaliser, lireFichier, montantCsv } from '../csv'
import { SectionHeader } from '../components/retro'

interface Props {
  transactions: Transaction[]
  budgets: Budgets
  onAdd: (t: Omit<Transaction, 'id'>) => void
  onImport: (ts: Omit<Transaction, 'id'>[]) => void
  onDelete: (id: number) => void
  onUpdateBudgets: (b: Budgets) => void
}

export default function Budget({ transactions, budgets, onAdd, onImport, onDelete, onUpdateBudgets }: Props) {
  const [filtre, setFiltre] = useState<'Tous' | 'Fonctionnement' | 'ASC'>('Tous')
  const [form, setForm] = useState({ libelle: '', montant: '', budget: 'ASC' as Transaction['budget'], type: 'Dépense' as Transaction['type'] })
  const [ouvert, setOuvert] = useState(false)
  const [edition, setEdition] = useState(false)
  const [message, setMessage] = useState('')
  const fichierRef = useRef<HTMLInputElement>(null)
  const [budgetForm, setBudgetForm] = useState({
    foncAlloue: String(budgets.fonctionnement.alloue),
    foncDepense: String(budgets.fonctionnement.depense),
    ascAlloue: String(budgets.asc.alloue),
    ascDepense: String(budgets.asc.depense),
  })

  const lignes = transactions.filter((t) => filtre === 'Tous' || t.budget === filtre)

  const parseMontant = (s: string) => parseFloat(s.replace(',', '.'))

  const soumettre = () => {
    const montant = parseMontant(form.montant)
    if (!form.libelle.trim() || isNaN(montant) || montant <= 0) return
    onAdd({ date: new Date().toISOString().slice(0, 10), libelle: form.libelle.trim(), montant, budget: form.budget, type: form.type })
    setForm({ libelle: '', montant: '', budget: 'ASC', type: 'Dépense' })
    setOuvert(false)
  }

  const sauverBudgets = () => {
    const vals = [budgetForm.foncAlloue, budgetForm.foncDepense, budgetForm.ascAlloue, budgetForm.ascDepense].map(parseMontant)
    if (vals.some((v) => isNaN(v) || v < 0)) return
    onUpdateBudgets({
      fonctionnement: { alloue: vals[0], depense: vals[1] },
      asc: { alloue: vals[2], depense: vals[3] },
    })
    setEdition(false)
  }

  const solde = (b: 'Fonctionnement' | 'ASC') => {
    const mouvements = transactions.filter((t) => t.budget === b)
    const recettes = mouvements.filter((t) => t.type === 'Recette').reduce((s, t) => s + t.montant, 0)
    const depenses = mouvements.filter((t) => t.type === 'Dépense').reduce((s, t) => s + t.montant, 0)
    return recettes - depenses
  }

  // Export CSV (séparateur « ; » + BOM pour Excel français)
  const exporterCSV = () => {
    telechargerCsv(`journal-cse-${filtre.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Date', 'Libellé', 'Budget', 'Type', 'Montant'],
      ...lignes.map((t) => [t.date, t.libelle, t.budget, t.type, montantCsv(t.montant)]),
    ])
  }

  // Import CSV — même format que l'export (dates ISO ou françaises acceptées)
  const importerCSV = async (fichier: File) => {
    const lignesCsv = parseCsv(await lireFichier(fichier))
    const corps = normaliser(lignesCsv[0]?.[0] ?? '').includes('date') ? lignesCsv.slice(1) : lignesCsv
    const valides: Omit<Transaction, 'id'>[] = []
    for (const l of corps) {
      const [dateBrute, libelle, budgetBrut, typeBrut, montant] = l
      const date = parseDateCsv(dateBrute ?? '')
      const m = parseMontantCsv(montant ?? '')
      const budget = budgetBrut?.trim()
      const type = normaliser(typeBrut ?? '') === 'recette' ? 'Recette' : normaliser(typeBrut ?? '') === 'depense' ? 'Dépense' : null
      if (!date) continue
      if (!libelle?.trim()) continue
      if (budget !== 'ASC' && budget !== 'Fonctionnement') continue
      if (!type) continue
      if (isNaN(m) || m <= 0) continue
      valides.push({ date, libelle: libelle.trim(), budget, type, montant: m })
    }
    if (valides.length > 0) {
      onImport(valides)
      setMessage(`${valides.length} écriture${valides.length > 1 ? 's' : ''} importée${valides.length > 1 ? 's' : ''} !`)
    } else {
      setMessage("Aucune écriture valide — vérifiez le format (Date;Libellé;Budget;Type;Montant).")
    }
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <div>
      <SectionHeader kicker="Trésorerie" title="Budget & comptabilité">
        <div className="flex gap-3">
          <button onClick={() => setEdition(!edition)} className="retro-btn bg-mustard text-cocoa">
            <Pencil className="w-5 h-5" /> Modifier les budgets
          </button>
          <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
            <PlusCircle className="w-5 h-5" /> Nouvelle écriture
          </button>
          <button onClick={exporterCSV} className="retro-btn bg-avocado text-paper" title="Exporter le journal affiché en CSV">
            <Download className="w-5 h-5" /> Exporter
          </button>
          <button onClick={() => fichierRef.current?.click()} className="retro-btn bg-salmon text-cocoa" title="Importer un journal CSV (même format que l'export)">
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

      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {(['Fonctionnement', 'ASC'] as const).map((b) => (
          <div key={b} className="retro-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-mocha">Budget {b === 'ASC' ? 'ASC' : 'de fonctionnement'}</p>
              <p className="font-display text-3xl mt-1 text-cocoa">{fmt(solde(b))}</p>
              <p className="text-sm text-mocha mt-1">Alloué : {fmt(b === 'ASC' ? budgets.asc.alloue : budgets.fonctionnement.alloue)}</p>
            </div>
            <div className={`w-16 h-16 rounded-full border-[3px] border-cocoa ${b === 'ASC' ? 'bg-mustard' : 'bg-tangerine'} retro-sun opacity-80`} />
          </div>
        ))}
      </div>

      {/* Édition des budgets */}
      {edition && (
        <div className="retro-card p-6 mb-8 border-mustard">
          <h3 className="font-display text-lg text-rust mb-4">Montants des budgets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Fonct. alloué</span>
              <input className="retro-input mt-1" inputMode="decimal" value={budgetForm.foncAlloue} onChange={(e) => setBudgetForm({ ...budgetForm, foncAlloue: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Fonct. dépensé</span>
              <input className="retro-input mt-1" inputMode="decimal" value={budgetForm.foncDepense} onChange={(e) => setBudgetForm({ ...budgetForm, foncDepense: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">ASC alloué</span>
              <input className="retro-input mt-1" inputMode="decimal" value={budgetForm.ascAlloue} onChange={(e) => setBudgetForm({ ...budgetForm, ascAlloue: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">ASC dépensé</span>
              <input className="retro-input mt-1" inputMode="decimal" value={budgetForm.ascDepense} onChange={(e) => setBudgetForm({ ...budgetForm, ascDepense: e.target.value })} />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={sauverBudgets} className="retro-btn bg-avocado text-paper"><Save className="w-5 h-5" /> Enregistrer</button>
            <button onClick={() => setEdition(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      {/* Formulaire d'écriture */}
      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouvelle écriture comptable</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="retro-input md:col-span-2" placeholder="Libellé (ex. Billets piscine x50)" value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} />
            <input className="retro-input" placeholder="Montant (€)" inputMode="decimal" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
            <div className="flex gap-2">
              <select className="retro-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value as Transaction['budget'] })}>
                <option value="ASC">ASC</option>
                <option value="Fonctionnement">Fonctionnement</option>
              </select>
              <select className="retro-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Transaction['type'] })}>
                <option value="Dépense">Dépense</option>
                <option value="Recette">Recette</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Enregistrer</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 mb-4">
        {(['Tous', 'Fonctionnement', 'ASC'] as const).map((f) => (
          <button key={f} onClick={() => setFiltre(f)} className={`retro-btn text-xs ${filtre === f ? 'bg-cocoa text-paper' : 'bg-paper text-cocoa'}`}>{f}</button>
        ))}
      </div>

      {/* Journal */}
      <div className="retro-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-cocoa text-paper">
              <th className="px-5 py-3 text-xs uppercase tracking-widest">Date</th>
              <th className="px-5 py-3 text-xs uppercase tracking-widest">Libellé</th>
              <th className="px-5 py-3 text-xs uppercase tracking-widest hidden md:table-cell">Budget</th>
              <th className="px-5 py-3 text-xs uppercase tracking-widest text-right">Montant</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {lignes.map((t, i) => (
              <tr key={t.id} className={`${i % 2 === 0 ? 'bg-paper' : 'bg-cream'} group`}>
                <td className="px-5 py-3 text-sm font-medium whitespace-nowrap">{fmtDate(t.date)}</td>
                <td className="px-5 py-3 font-semibold">
                  <span className="flex items-center gap-2">
                    {t.type === 'Recette'
                      ? <ArrowUpCircle className="w-5 h-5 text-avocado shrink-0" />
                      : <ArrowDownCircle className="w-5 h-5 text-rust shrink-0" />}
                    {t.libelle}
                  </span>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <span className={`retro-chip ${t.budget === 'ASC' ? 'bg-mustard' : 'bg-salmon'} text-cocoa`}>{t.budget}</span>
                </td>
                <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${t.type === 'Recette' ? 'text-avocado' : 'text-rust'}`}>
                  {t.type === 'Recette' ? '+' : '−'} {fmt(t.montant)}
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rust hover:text-ember"
                    title="Supprimer l'écriture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lignes.length === 0 && (
          <p className="p-6 text-center text-mocha font-medium">Aucune écriture pour ce filtre.</p>
        )}
      </div>
    </div>
  )
}
