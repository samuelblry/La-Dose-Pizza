import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiAdminClients } from '../../services/api'
import AdminLayout, { SearchBar } from '../../components/AdminLayout'
import { Vide } from './Orders'

export default function Clients() {
  const { token } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    let actif = true
    apiAdminClients(token)
      .then((d) => actif && setClients(Array.isArray(d) ? d : d.results || []))
      .catch(() => actif && setErreur('Impossible de charger les clients.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone].some((v) => v && String(v).toLowerCase().includes(q)),
    )
  }, [clients, recherche])

  return (
    <AdminLayout title="Fiches clients" subtitle="Coordonnées et points de fidélité des clients inscrits.">
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

      {loading ? (
        <Skeleton />
      ) : liste.length === 0 ? (
        <Vide label={recherche ? 'Aucun client ne correspond à la recherche.' : 'Aucun client inscrit pour le moment.'} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {liste.map((client) => {
            const nom = [client.first_name, client.last_name].filter(Boolean).join(' ')
            return (
            <div key={client.id_user ?? client.id} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-[#240400] p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rouge font-lostar text-xl text-creme">
                {(nom || client.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-poppins text-sm font-semibold text-creme">{nom || client.email}</p>
                  <span className="shrink-0 rounded-full bg-ambre/15 px-2.5 py-1 font-poppins text-[0.68rem] font-semibold text-ambre">
                    {client.loyalty_points ?? 0} pts
                  </span>
                </div>
                {nom && <p className="mt-0.5 truncate font-poppins text-[0.74rem] text-creme/55">{client.email}</p>}
                <p className="mt-1 font-poppins text-[0.74rem] text-creme/55">{client.phone || 'Téléphone non renseigné'}</p>
                <p className="mt-0.5 font-poppins text-[0.72rem] text-creme/40">
                  {client.address ? `${client.address.street || ''} ${client.address.city || ''}`.trim() || 'Adresse non renseignée' : 'Adresse non renseignée'}
                </p>
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
        <div key={i} className="h-24 animate-pulse rounded-3xl bg-[#240400]" />
      ))}
    </div>
  )
}
