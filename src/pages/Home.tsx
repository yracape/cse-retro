import { useState } from 'react'
import {
  LayoutDashboard, Wallet, CalendarDays, Megaphone, Menu, X, Settings2,
} from 'lucide-react'
import Dashboard from '../sections/Dashboard'
import Budget from '../sections/Budget'
import Reunions from '../sections/Reunions'
import Communication from '../sections/Communication'
import Parametres from '../sections/Parametres'
import { usePersistentState } from '../hooks/usePersistentState'
import {
  transactionsInit, reunionsInit, annoncesInit,
  budgetsInit, settingsInit,
} from '../data'
import type {
  Transaction, Reunion, Annonce, Budgets, Settings,
} from '../data'

const nav = [
  { id: 'dashboard', label: 'Tableau de bord', icone: LayoutDashboard },
  { id: 'budget', label: 'Budget & compta', icone: Wallet },
  { id: 'reunions', label: 'Réunions', icone: CalendarDays },
  { id: 'communication', label: 'Communication', icone: Megaphone },
  { id: 'parametres', label: 'Paramètres', icone: Settings2 },
]

const nextId = <T extends { id: number }>(liste: T[]) => Math.max(0, ...liste.map((x) => x.id)) + 1

export default function Home() {
  const [section, setSection] = useState('dashboard')
  const [menuOuvert, setMenuOuvert] = useState(false)

  // === Données persistantes (localStorage) ===
  const [settings, setSettings] = usePersistentState<Settings>('settings', settingsInit)
  const [budgets, setBudgets] = usePersistentState<Budgets>('budgets', budgetsInit)
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('transactions', transactionsInit)
  const [reunions, setReunions] = usePersistentState<Reunion[]>('reunions', reunionsInit)
  const [annonces, setAnnonces] = usePersistentState<Annonce[]>('annonces', annoncesInit)

  // === Actions ===
  const ajouterTransaction = (t: Omit<Transaction, 'id'>) =>
    setTransactions((prev) => [{ ...t, id: nextId(prev) }, ...prev])
  const importerTransactions = (ts: Omit<Transaction, 'id'>[]) =>
    setTransactions((prev) => {
      let id = nextId(prev)
      return [...ts.map((t) => ({ ...t, id: id++ })), ...prev]
    })
  const supprimerTransaction = (id: number) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id))

  const ajouterReunion = (r: Omit<Reunion, 'id'>) =>
    setReunions((prev) => [...prev, { ...r, id: nextId(prev) }].sort((a, b) => a.date.localeCompare(b.date)))
  const importerReunions = (rs: Omit<Reunion, 'id'>[]) =>
    setReunions((prev) => {
      const uidsConnus = new Set(prev.map((r) => r.uid).filter(Boolean))
      const nouvelles = rs.filter((r) => !r.uid || !uidsConnus.has(r.uid))
      let id = nextId(prev)
      return [...prev, ...nouvelles.map((r) => ({ ...r, id: id++ }))].sort((a, b) => a.date.localeCompare(b.date))
    })
  const supprimerReunion = (id: number) =>
    setReunions((prev) => prev.filter((r) => r.id !== id))

  const ajouterAnnonce = (a: Omit<Annonce, 'id'>) =>
    setAnnonces((prev) => [{ ...a, id: nextId(prev) }, ...prev])
  const supprimerAnnonce = (id: number) =>
    setAnnonces((prev) => prev.filter((a) => a.id !== id))

  const aller = (id: string) => {
    setSection(id)
    setMenuOuvert(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex">
      {/* === Barre latérale === */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-cocoa text-paper flex flex-col border-r-[3px] border-cocoa
          transition-transform duration-300 lg:translate-x-0 ${menuOuvert ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b-[3px] border-dashed border-paper/30">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full retro-sun border-[3px] border-paper animate-spin-slow shrink-0" />
            <div>
              <p className="font-display text-2xl text-mustard leading-none">CSE Rétro</p>
              <p className="text-xs uppercase tracking-[0.25em] text-paper/70 mt-1">Gestion du comité</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => aller(n.id)}
              className={`w-full flex items-center gap-3 rounded-full border-[3px] px-4 py-2.5 font-bold text-sm uppercase tracking-wide transition-all
                ${section === n.id
                  ? 'bg-tangerine text-paper border-paper shadow-[3px_3px_0_#E9A319]'
                  : 'border-transparent text-paper/70 hover:text-paper hover:border-paper/40'}`}
            >
              <n.icone className="w-5 h-5" strokeWidth={2.5} />
              {n.label}
            </button>
          ))}
        </nav>

        {/* Pied de la barre */}
        <div className="p-5 border-t-[3px] border-dashed border-paper/30 text-center">
          <p className="font-display text-salmon text-sm">Exercice {settings.annee}</p>
          <p className="text-xs text-paper/60 mt-1">Données sauvegardées localement</p>
        </div>
      </aside>

      {/* Fond sombre mobile */}
      {menuOuvert && (
        <div className="fixed inset-0 z-30 bg-cocoa/60 lg:hidden" onClick={() => setMenuOuvert(false)} />
      )}

      {/* === Contenu === */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Bandeau supérieur */}
        <header className="sticky top-0 z-20 bg-tangerine border-b-[3px] border-cocoa">
          <div className="flex items-center gap-4 px-5 py-3">
            <button onClick={() => setMenuOuvert(!menuOuvert)} className="lg:hidden retro-btn bg-paper text-cocoa !px-3 !py-1.5">
              {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex-1 overflow-hidden">
              <p className="font-display text-paper text-lg md:text-xl whitespace-nowrap drop-shadow-[2px_2px_0_#4A2C14]">
                Comité Social & Économique — {settings.nom}
              </p>
            </div>
            <span className="hidden md:inline-flex retro-chip bg-paper text-cocoa">Année {settings.annee}</span>
          </div>
          {/* Bande à pois */}
          <div className="h-3 retro-dots bg-mustard border-t-[3px] border-cocoa" />
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">
          {section === 'dashboard' && <Dashboard goSection={aller} budgets={budgets} reunions={reunions} annee={settings.annee} />}
          {section === 'budget' && (
            <Budget
              transactions={transactions}
              budgets={budgets}
              onAdd={ajouterTransaction}
              onImport={importerTransactions}
              onDelete={supprimerTransaction}
              onUpdateBudgets={setBudgets}
            />
          )}
          {section === 'reunions' && (
            <Reunions
              liste={reunions}
              emailCSE={settings.email ?? ''}
              icalUrl={settings.icalUrl ?? ''}
              onAdd={ajouterReunion}
              onImport={importerReunions}
              onDelete={supprimerReunion}
            />
          )}
          {section === 'communication' && (
            <Communication liste={annonces} onAdd={ajouterAnnonce} onDelete={supprimerAnnonce} />
          )}
          {section === 'parametres' && <Parametres settings={settings} onSave={setSettings} />}
        </main>
      </div>
    </div>
  )
}
