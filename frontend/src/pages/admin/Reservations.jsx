import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiAdminReservations, apiAdminPatchReservation } from '../../services/api'
import AdminLayout, { SearchBar } from '../../components/AdminLayout'
import { Vide } from './Orders'

const STATUTS = {
  en_attente: { label: 'En attente', dot: 'bg-creme/50', text: 'text-creme/60' },
  confirmee: { label: 'Confirmée', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  annulee: { label: 'Annulée', dot: 'bg-rouge', text: 'text-rouge' },
}

const FILTRES = [
  { value: 'tous', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmées' },
  { value: 'annulee', label: 'Annulées' },
]

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' })
}

export default function Reservations() {
  const { token } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState('asc')
  const [maj, setMaj] = useState(null)

  useEffect(() => {
    let actif = true
    apiAdminReservations(token)
      .then((d) => actif && setReservations(Array.isArray(d) ? d : d.results || []))
      .catch(() => actif && setErreur('Impossible de charger les réservations.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  const changerStatut = async (id, status) => {
    setMaj(id)
    try {
      await apiAdminPatchReservation(token, id, status)
      setReservations((prev) => prev.map((r) => ((r.id_reservation ?? r.id) === id ? { ...r, status } : r)))
    } catch {
      setErreur('Échec de la mise à jour du statut.')
    } finally {
      setMaj(null)
    }
  }

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    const filtrees = reservations.filter((r) => {
      if (filtre !== 'tous' && r.status !== filtre) return false
      if (!q) return true
      const champs = [r.user_first_name, r.user_last_name, r.user_email, r.user_phone]
      return champs.some((c) => c && String(c).toLowerCase().includes(q))
    })
    const cle = (r) => `${r.reservation_date}T${r.reservation_time}`
    return [...filtrees].sort((a, b) =>
      tri === 'asc' ? cle(a).localeCompare(cle(b)) : cle(b).localeCompare(cle(a)),
    )
  }, [reservations, filtre, recherche, tri])

  return (
    <AdminLayout title="Réservations" subtitle="Confirmez ou annulez les tables réservées.">
      {erreur && (
        <p className="mb-5 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">
          {erreur}
        </p>
      )}

      <SearchBar
        value={recherche}
        onChange={setRecherche}
        placeholder="Rechercher par nom, prénom, email ou téléphone…"
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTRES.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              className={`shrink-0 rounded-full border px-3.5 py-2 font-poppins text-[0.72rem] transition ${
                filtre === f.value
                  ? 'border-ambre bg-ambre/15 text-ambre'
                  : 'border-white/10 text-creme/60 hover:text-creme'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTri((t) => (t === 'asc' ? 'desc' : 'asc'))}
          className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 font-poppins text-[0.72rem] text-creme/70 transition hover:border-ambre hover:text-ambre"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3" />
          </svg>
          {tri === 'asc' ? 'Plus tôt d’abord' : 'Plus tard d’abord'}
        </button>
      </div>

      {loading ? (
        <Skeleton />
      ) : liste.length === 0 ? (
        <Vide label="Aucune réservation à afficher." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {liste.map((resa) => {
            const st = STATUTS[resa.status] || STATUTS.en_attente
            const rid = resa.id_reservation ?? resa.id
            return (
              <div key={rid} className="rounded-3xl border border-white/10 bg-[#240400] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-poppins text-sm font-semibold capitalize text-creme">
                      {fmtDate(resa.reservation_date)} · {resa.reservation_time}
                    </p>
                    {(resa.user_first_name || resa.user_last_name) && (
                      <p className="mt-0.5 truncate font-poppins text-[0.76rem] text-creme/70">
                        {[resa.user_first_name, resa.user_last_name].filter(Boolean).join(' ')}
                      </p>
                    )}
                    <p className="mt-0.5 truncate font-poppins text-[0.74rem] text-creme/50">{resa.user_email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-ambre/15 px-2.5 py-1 font-poppins text-[0.68rem] font-semibold text-ambre">
                    Table {resa.table_number}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 font-poppins text-[0.74rem] text-creme/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 text-ambre/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0" />
                  </svg>
                  {resa.guest_count} couvert{resa.guest_count > 1 ? 's' : ''}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className={`flex items-center gap-2 font-poppins text-[0.74rem] ${st.text}`}>
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  <select
                    value={resa.status}
                    disabled={maj === rid}
                    onChange={(e) => changerStatut(rid, e.target.value)}
                    className="rounded-lg border border-white/15 bg-dark px-3 py-2 font-poppins text-[0.74rem] text-creme focus:border-ambre focus:outline-none disabled:opacity-50"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="confirmee">Confirmée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-3xl bg-[#240400]" />
      ))}
    </div>
  )
}
