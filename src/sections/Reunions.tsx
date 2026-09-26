import { useState } from 'react'
import { MapPin, Clock, ListOrdered, PlusCircle, Trash2, CalendarPlus, Mail, CalendarSync } from 'lucide-react'
import { fmtDate } from '../data'
import type { Reunion } from '../data'
import { lienGoogleCalendar, envoyerParMail, recupererCalendrierGoogle } from '../agenda'
import { SectionHeader, SunDivider } from '../components/retro'

interface Props {
  liste: Reunion[]
  emailCSE: string
  icalUrl: string
  onAdd: (r: Omit<Reunion, 'id'>) => void
  onImport: (rs: Omit<Reunion, 'id'>[]) => void
  onDelete: (id: number) => void
}

export default function Reunions({ liste, emailCSE, icalUrl, onAdd, onImport, onDelete }: Props) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({ date: '', heure: '14h00', titre: '', lieu: '', ordre: '' })
  const [synchro, setSynchro] = useState<'repos' | 'en-cours'>('repos')
  const [message, setMessage] = useState('')
  const [voirPassees, setVoirPassees] = useState(false)

  // Date du jour au format AAAA-MM-JJ (heure locale)
  const aujourdHui = new Date().toLocaleDateString('sv-SE')
  const passees = liste.filter((r) => r.date < aujourdHui)
  const affichees = voirPassees ? liste : liste.filter((r) => r.date >= aujourdHui)

  const synchroniser = async () => {
    if (!icalUrl.trim()) {
      setMessage("Renseignez d'abord l'adresse iCal du calendrier dans Paramètres.")
      setTimeout(() => setMessage(''), 6000)
      return
    }
    setSynchro('en-cours')
    try {
      const avant = liste.length
      const recues = await recupererCalendrierGoogle(icalUrl.trim())
      onImport(recues)
      const nouvelles = recues.filter((r) => !r.uid || !new Set(liste.map((x) => x.uid)).has(r.uid)).length
      setMessage(
        recues.length === 0
          ? 'Aucun événement trouvé dans le calendrier Google.'
          : `${recues.length} événement${recues.length > 1 ? 's' : ''} lu${recues.length > 1 ? 's' : ''} — ${nouvelles} nouveau${nouvelles > 1 ? 'x' : ''} importé${nouvelles > 1 ? 's' : ''} (${avant} déjà présentes).`
      )
    } catch (e) {
      setMessage(`Échec de la synchronisation : ${e instanceof Error ? e.message : 'erreur inconnue'}`)
    } finally {
      setSynchro('repos')
      setTimeout(() => setMessage(''), 8000)
    }
  }

  const soumettre = () => {
    if (!form.date || !form.titre.trim() || !form.lieu.trim()) return
    onAdd({
      date: form.date,
      heure: form.heure.trim() || '14h00',
      titre: form.titre.trim(),
      lieu: form.lieu.trim(),
      ordre: form.ordre.split('\n').map((l) => l.trim()).filter(Boolean),
    })
    setForm({ date: '', heure: '14h00', titre: '', lieu: '', ordre: '' })
    setOuvert(false)
  }

  return (
    <div>
      <SectionHeader kicker="Vie du comité" title="Réunions & ordre du jour">
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setOuvert(!ouvert)} className="retro-btn bg-tangerine text-paper">
            <PlusCircle className="w-5 h-5" /> Planifier une réunion
          </button>
          <button
            onClick={synchroniser}
            disabled={synchro === 'en-cours'}
            className={`retro-btn ${synchro === 'en-cours' ? 'bg-muted text-mocha opacity-60 cursor-wait' : 'bg-salmon text-cocoa'}`}
            title="Importer les événements du calendrier Google (adresse iCal dans Paramètres)"
          >
            <CalendarSync className={`w-5 h-5 ${synchro === 'en-cours' ? 'animate-spin' : ''}`} />
            {synchro === 'en-cours' ? 'Synchronisation…' : 'Synchroniser Google'}
          </button>
        </div>
      </SectionHeader>

      {message && (
        <div className="retro-card p-4 mb-6 bg-mustard/40 border-mustard">
          <p className="font-bold text-cocoa">{message}</p>
        </div>
      )}

      {ouvert && (
        <div className="retro-card p-6 mb-8 border-tangerine">
          <h3 className="font-display text-lg text-rust mb-4">Nouvelle réunion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Date</span>
              <input type="date" className="retro-input mt-1" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Heure</span>
              <input className="retro-input mt-1" placeholder="14h00" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
            </label>
            <input className="retro-input" placeholder="Titre (ex. Réunion ordinaire d'octobre)" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            <input className="retro-input" placeholder="Lieu (ex. Salle des délégués)" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
            <label className="block md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-mocha">Ordre du jour (un point par ligne)</span>
              <textarea
                className="retro-input mt-1 min-h-24"
                placeholder={'Point budget\nBilletterie hiver\nQuestions diverses'}
                value={form.ordre}
                onChange={(e) => setForm({ ...form, ordre: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={soumettre} className="retro-btn bg-avocado text-paper">Enregistrer</button>
            <button onClick={() => setOuvert(false)} className="retro-btn bg-cream text-cocoa">Annuler</button>
          </div>
        </div>
      )}

      {/* Bascule réunions passées */}
      {passees.length > 0 && (
        <div className="mb-6">
          <button onClick={() => setVoirPassees(!voirPassees)} className={`retro-btn text-xs ${voirPassees ? 'bg-cocoa text-paper' : 'bg-paper text-cocoa'}`}>
            {voirPassees ? 'Masquer les réunions passées' : `Voir les ${passees.length} réunion${passees.length > 1 ? 's' : ''} passée${passees.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {affichees.map((r, idx) => (
          <div key={r.id}>
            <div className="retro-card p-6 md:flex gap-6 group relative">
              <button
                onClick={() => onDelete(r.id)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-paper border-2 border-cocoa flex items-center justify-center text-rust opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rust hover:text-paper"
                title="Supprimer la réunion"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {/* Date façon calendrier vintage */}
              <div className="shrink-0 w-28 text-center mb-4 md:mb-0">
                <div className="border-[3px] border-cocoa rounded-xl overflow-hidden shadow-retro-sm">
                  <div className="bg-rust text-paper text-xs font-bold uppercase tracking-widest py-1">
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' })}
                  </div>
                  <div className="bg-paper font-display text-4xl py-2 text-cocoa">
                    {new Date(r.date + 'T00:00:00').getDate()}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-rust">{r.titre}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm font-semibold text-mocha">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {r.heure}</span>
                  {r.lieu && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {r.lieu}</span>}
                  <span className="flex items-center gap-1"><ListOrdered className="w-4 h-4" /> {fmtDate(r.date)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={lienGoogleCalendar(r)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="retro-btn bg-mustard text-cocoa text-xs"
                    title="Ouvrir Google Agenda avec cet événement pré-rempli (connexion Google requise)"
                  >
                    <CalendarPlus className="w-4 h-4" /> Google Agenda
                  </a>
                  <button
                    onClick={() => envoyerParMail(r, emailCSE)}
                    className="retro-btn bg-salmon text-cocoa text-xs"
                    title="Télécharge l'invitation .ics et ouvre votre messagerie avec le message pré-rempli"
                  >
                    <Mail className="w-4 h-4" /> Envoyer par e-mail
                  </button>
                </div>
                {r.ordre.length > 0 && (
                  <div className="mt-4 border-t-2 border-dashed border-cocoa/40 pt-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-mocha mb-2">Ordre du jour</p>
                    <ol className="space-y-1">
                      {r.ordre.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 font-medium">
                          <span className="w-6 h-6 shrink-0 rounded-full bg-tangerine border-2 border-cocoa text-paper text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
            {idx < affichees.length - 1 && <SunDivider />}
          </div>
        ))}
      </div>

      {affichees.length === 0 && (
        <div className="retro-card p-10 text-center">
          <p className="font-display text-xl text-rust">Aucune réunion à venir…</p>
          <p className="text-mocha mt-2">Planifiez la prochaine avec le bouton ci-dessus.</p>
        </div>
      )}
    </div>
  )
}
