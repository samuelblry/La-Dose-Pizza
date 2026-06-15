// Page réservation — POST /api/reservations/
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiCreateReservation } from '../services/api'

// Créneaux d'ouverture proposés
const CRENEAUX = ['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
const today = new Date().toISOString().split('T')[0]

export default function Reservation() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [convives, setConvives] = useState(2)
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    if (!date) return setErreur('Choisissez une date.')
    if (!heure) return setErreur('Choisissez un créneau horaire.')
    setSaving(true)
    try {
      const data = await apiCreateReservation(token, {
        reservation_date: date,
        reservation_time: heure,
        guest_count: convives,
      })
      setConfirmation(data)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'Aucune table disponible pour ce créneau.')
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return (
      <Confirmation
        data={confirmation}
        date={date}
        heure={heure}
        convives={convives}
        onCompte={() => navigate('/mon-compte')}
        onAccueil={() => navigate('/')}
      />
    )
  }

  return (
    <main className="min-h-screen bg-dark pb-32 lg:pb-16">
      <header className="px-6 pt-24 text-center lg:pt-32">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Sur place
        </p>
        <h1 className="font-lostar text-[2.6rem] leading-none text-rouge lg:text-[4rem]">Réserver une table</h1>
        <p className="mt-3 font-poppins text-[0.8rem] text-creme/50 lg:text-base">
          Choisissez votre date, votre créneau et le nombre de convives.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-lg px-5 lg:max-w-6xl lg:px-8">
        {erreur && (
          <p
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-2xl border border-rouge/40 bg-rouge/10 px-4 py-3 font-poppins text-[0.8rem] text-rouge"
          >
            <IconAlert />
            {erreur}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">

          {/* Colonne gauche : Date + Créneau */}
          <div className="flex flex-col gap-5 lg:flex-1">
            {/* Date */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <h2 className="font-poppins text-base font-semibold text-ambre">Date</h2>
              <label className="mt-4 block">
                <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-creme/50">
                  Jour de la réservation <span className="text-rouge">*</span>
                </span>
                <input
                  type="date"
                  name="reservation_date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 font-poppins text-sm text-creme [color-scheme:dark] focus:border-ambre/50 focus:outline-none focus:ring-2 focus:ring-ambre/30"
                />
              </label>
            </section>

            {/* Créneau horaire */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <h2 className="font-poppins text-base font-semibold text-ambre">Créneau horaire</h2>
              <p className="mt-1 font-poppins text-[0.72rem] text-creme/40">Sélectionnez votre heure d'arrivée</p>
              <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-5">
                {CRENEAUX.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setHeure(c)}
                    aria-pressed={heure === c}
                    className={`rounded-xl border py-3 font-poppins text-[0.82rem] tabular-nums transition ${
                      heure === c
                        ? 'border-ambre bg-rouge text-creme'
                        : 'border-white/10 bg-dark text-creme/70 hover:border-white/25'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Colonne droite : Convives + CTA (sticky) */}
          <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0 lg:sticky lg:top-28">
            {/* Nombre de convives */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <h2 className="font-poppins text-base font-semibold text-ambre">Convives</h2>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-poppins text-sm text-creme/60">Nombre de personnes</p>
                <div className="flex items-center gap-1.5 rounded-full bg-rouge px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setConvives((n) => Math.max(1, n - 1))}
                    aria-label="Retirer un convive"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/10 disabled:opacity-40"
                    disabled={convives <= 1}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </button>
                  <span className="min-w-[2rem] text-center font-poppins text-base font-semibold tabular-nums text-creme">
                    {convives}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConvives((n) => Math.min(20, n + 1))}
                    aria-label="Ajouter un convive"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/10 disabled:opacity-40"
                    disabled={convives >= 20}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="mt-3 font-poppins text-[0.72rem] text-creme/40">
                Pour plus de 20 personnes, contactez-nous directement.
              </p>
            </section>

            {/* Récap sélection (desktop) */}
            {(date || heure) && (
              <section className="hidden rounded-3xl border border-ambre/20 bg-gradient-to-br from-[#3a0a04] to-[#240400] p-5 lg:block">
                <h3 className="font-poppins text-sm font-semibold text-ambre">Votre réservation</h3>
                <div className="mt-3 space-y-2">
                  {date && (
                    <div className="flex items-center justify-between font-poppins text-sm">
                      <span className="text-creme/50">Date</span>
                      <span className="capitalize text-creme">{fmtDate(date)}</span>
                    </div>
                  )}
                  {heure && (
                    <div className="flex items-center justify-between font-poppins text-sm">
                      <span className="text-creme/50">Heure</span>
                      <span className="text-creme">{heure}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-poppins text-sm">
                    <span className="text-creme/50">Convives</span>
                    <span className="text-creme">{convives} personne{convives > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </section>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rouge py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner />
                  Réservation…
                </>
              ) : (
                <>
                  Réserver ma table
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  )
}

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
}

// Écran de confirmation après réservation
function Confirmation({ data, date, heure, convives, onCompte, onAccueil }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark px-6 pb-16 pt-24 text-center lg:pt-32">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="mt-6 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">Réservation confirmée</p>
      <h1 className="mt-2 font-lostar text-[2.4rem] leading-none text-creme">À bientôt !</h1>
      <p className="mt-3 max-w-xs font-poppins text-[0.84rem] text-creme/60">
        Votre table vous attend. Un récapitulatif est disponible dans votre compte.
      </p>

      <div className="mt-7 w-full max-w-xs space-y-3 rounded-3xl border border-ambre/20 bg-[#240400] p-5 text-left">
        <RecapRow label="Date" value={fmtDate(date)} />
        <RecapRow label="Heure" value={heure} />
        <RecapRow label="Convives" value={`${convives} personne${convives > 1 ? 's' : ''}`} />
        {data?.table_number != null && <RecapRow label="Table" value={`N° ${data.table_number}`} highlight />}
      </div>

      <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onCompte}
          className="rounded-2xl bg-rouge py-3.5 font-poppins text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
        >
          Voir mes réservations
        </button>
        <button
          onClick={onAccueil}
          className="rounded-2xl border border-white/15 py-3.5 font-poppins text-[0.78rem] text-creme/70 transition hover:border-creme hover:text-creme"
        >
          Retour à l'accueil
        </button>
      </div>
    </main>
  )
}

function RecapRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 font-poppins text-sm last:border-0 last:pb-0">
      <span className="text-creme/50">{label}</span>
      <span className={`capitalize ${highlight ? 'font-lostar text-lg text-ambre' : 'text-creme'}`}>{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
