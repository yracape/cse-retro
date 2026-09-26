import { useState } from 'react'
import { Save, RotateCcw, Building2, CalendarClock, Mail, CalendarSync } from 'lucide-react'
import type { Settings } from '../data'
import { clearPersistentData } from '../hooks/usePersistentState'
import { SectionHeader } from '../components/retro'

interface Props {
  settings: Settings
  onSave: (s: Settings) => void
}

export default function Parametres({ settings, onSave }: Props) {
  const [form, setForm] = useState({ ...settings, email: settings.email ?? '', icalUrl: settings.icalUrl ?? '' })
  const [confirmation, setConfirmation] = useState(false)

  const reinitialiser = () => {
    if (!confirmation) {
      setConfirmation(true)
      return
    }
    clearPersistentData()
    window.location.reload()
  }

  return (
    <div>
      <SectionHeader kicker="Configuration" title="Paramètres" />

      <div className="retro-card p-6 max-w-2xl">
        <h3 className="font-display text-lg text-rust mb-4">Identité du comité</h3>
        <div className="space-y-4">
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mocha mb-1">
              <Building2 className="w-4 h-4" /> Nom de l'établissement
            </span>
            <input
              className="retro-input"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex. Usine Renault Billancourt"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mocha mb-1">
              <CalendarClock className="w-4 h-4" /> Année de l'exercice
            </span>
            <input
              className="retro-input"
              value={form.annee}
              onChange={(e) => setForm({ ...form, annee: e.target.value })}
              placeholder="Ex. 2026"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mocha mb-1">
              <Mail className="w-4 h-4" /> Adresse e-mail du CSE
            </span>
            <input
              className="retro-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex. cse@mon-entreprise.fr"
            />
            <span className="text-xs text-mocha mt-1 block">
              Utilisée comme expéditrice des invitations de réunion envoyées par e-mail.
            </span>
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mocha mb-1">
              <CalendarSync className="w-4 h-4" /> Adresse iCal du calendrier Google
            </span>
            <input
              className="retro-input"
              value={form.icalUrl}
              onChange={(e) => setForm({ ...form, icalUrl: e.target.value })}
              placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
            />
            <span className="text-xs text-mocha mt-1 block">
              Dans Google Agenda : Paramètres du calendrier → « Adresse secrète au format iCal » → copiez-la ici.
              Permet d'importer les réunions depuis Google Agenda (bouton « Synchroniser » dans Réunions).
            </span>
          </label>
          <button onClick={() => onSave(form)} className="retro-btn bg-tangerine text-paper">
            <Save className="w-5 h-5" /> Enregistrer
          </button>
        </div>
      </div>

      <div className="retro-card p-6 max-w-2xl mt-8 border-rust">
        <h3 className="font-display text-lg text-rust mb-2">Zone dangereuse</h3>
        <p className="text-sm text-mocha font-medium mb-4">
          Réinitialise toutes les données (budgets, écritures, réunions, annonces…) et revient aux valeurs de démonstration.
        </p>
        <button onClick={reinitialiser} className={`retro-btn text-xs ${confirmation ? 'bg-rust text-paper' : 'bg-cream text-cocoa'}`}>
          <RotateCcw className="w-4 h-4" />
          {confirmation ? 'Cliquez encore pour confirmer !' : 'Réinitialiser les données'}
        </button>
      </div>
    </div>
  )
}
