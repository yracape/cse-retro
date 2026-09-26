import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Wallet, PiggyBank, ArrowUpRight } from 'lucide-react'
import { depensesMensuelles, repartitionASC, fmt, fmtDate } from '../data'
import type { Budgets, Reunion } from '../data'
import { SectionHeader, ProgressRing, Starburst } from '../components/retro'

interface Props {
  goSection: (s: string) => void
  budgets: Budgets
  reunions: Reunion[]
  annee: string
}

export default function Dashboard({ goSection, budgets, reunions, annee }: Props) {
  // Uniquement les réunions à partir d'aujourd'hui
  const aujourdHui = new Date().toLocaleDateString('sv-SE')
  const aVenir = reunions.filter((r) => r.date >= aujourdHui)

  const kpis = [
    { label: 'Budget ASC restant', valeur: fmt(budgets.asc.alloue - budgets.asc.depense), detail: 'sur ' + fmt(budgets.asc.alloue), icone: Wallet, fond: 'bg-salmon', cible: 'budget' },
    { label: 'Budget fonctionnement restant', valeur: fmt(budgets.fonctionnement.alloue - budgets.fonctionnement.depense), detail: 'sur ' + fmt(budgets.fonctionnement.alloue), icone: PiggyBank, fond: 'bg-avocado', cible: 'budget' },
  ]

  return (
    <div>
      <SectionHeader kicker="Vue d'ensemble" title="Tableau de bord" />

      {/* Cartes indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {kpis.map((k) => (
          <div
            key={k.label}
            onClick={'cible' in k && k.cible ? () => goSection(k.cible as string) : undefined}
            className={`retro-card p-5 relative overflow-hidden ${'cible' in k && k.cible ? 'cursor-pointer hover:-translate-y-1 hover:shadow-retro-lg transition-all' : ''}`}
            title={'cible' in k && k.cible ? 'Cliquer pour ouvrir la section' : undefined}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${k.fond} border-[3px] border-cocoa opacity-90`} />
            <k.icone className="w-7 h-7 text-tangerine mb-3 relative" strokeWidth={2.5} />
            <p className="text-xs font-bold uppercase tracking-widest text-mocha">{k.label}</p>
            <p className="font-display text-2xl text-cocoa mt-1 relative">{k.valeur}</p>
            <p className="text-sm text-mocha mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> {k.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Jauges des budgets */}
      <div className="retro-card p-6 mb-10 retro-dots">
        <h3 className="font-display text-xl text-rust mb-6 text-center">Consommation des budgets {annee}</h3>
        <div className="flex flex-wrap justify-center gap-12">
          <ProgressRing value={budgets.fonctionnement.depense} max={budgets.fonctionnement.alloue} label="Fonctionnement" color="#E8641C" />
          <ProgressRing value={budgets.asc.depense} max={budgets.asc.alloue} label="Activités sociales & culturelles" color="#E9A319" />
          <div className="hidden md:flex items-center">
            <Starburst className="w-36 h-36">
              <span className="text-sm">Budget<br />maîtrisé !</span>
            </Starburst>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
        <div className="retro-card p-6 lg:col-span-3">
          <h3 className="font-display text-lg text-rust mb-4">Dépenses mensuelles</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={depensesMensuelles}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A2C14" opacity={0.2} />
              <XAxis dataKey="mois" stroke="#4A2C14" tick={{ fill: '#4A2C14', fontWeight: 600 }} />
              <YAxis stroke="#4A2C14" tick={{ fill: '#4A2C14' }} />
              <Tooltip
                contentStyle={{ background: '#FDF4E3', border: '3px solid #4A2C14', borderRadius: 12, fontWeight: 600 }}
                formatter={(v: number) => fmt(v)}
              />
              <Legend />
              <Bar dataKey="fonctionnement" name="Fonctionnement" fill="#E8641C" stroke="#4A2C14" strokeWidth={2} radius={[6, 6, 0, 0]} />
              <Bar dataKey="asc" name="ASC" fill="#E9A319" stroke="#4A2C14" strokeWidth={2} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="retro-card p-6 lg:col-span-2">
          <h3 className="font-display text-lg text-rust mb-4">Répartition des dépenses ASC</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={repartitionASC} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} stroke="#4A2C14" strokeWidth={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11} fontWeight={700}>
                {repartitionASC.map((e) => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#FDF4E3', border: '3px solid #4A2C14', borderRadius: 12, fontWeight: 600 }} formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prochaines réunions */}
      <div className="retro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-rust">Prochaines réunions</h3>
          <button onClick={() => goSection('reunions')} className="retro-btn bg-tangerine text-paper text-xs">Tout l'agenda</button>
        </div>
        {aVenir.length === 0 ? (
          <p className="text-mocha font-medium">Aucune réunion à venir — ajoutez-en une dans la section Réunions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aVenir.slice(0, 3).map((r) => (
              <div key={r.id} className="border-[3px] border-cocoa rounded-xl bg-cream p-4">
                <span className="retro-chip bg-tangerine text-paper mb-2">{fmtDate(r.date)}</span>
                <p className="font-bold mt-2">{r.titre}</p>
                <p className="text-sm text-mocha">{r.heure}{r.lieu ? ` — ${r.lieu}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
