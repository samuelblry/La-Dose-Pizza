import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiAdminOrders, apiAdminPatchOrder } from '../../services/api'
import AdminLayout, { SearchBar } from '../../components/AdminLayout'

const STATUTS = {
  en_attente: { label: 'En attente', dot: 'bg-creme/50', text: 'text-creme/60' },
  en_preparation: { label: 'En préparation', dot: 'bg-ambre', text: 'text-ambre' },
  en_livraison: { label: 'En livraison', dot: 'bg-ambre', text: 'text-ambre' },
  livree: { label: 'Livrée', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  annulee: { label: 'Annulée', dot: 'bg-rouge', text: 'text-rouge' },
}

// Libellés adaptés au mode "sur place" (pas de livraison)
const labelStatut = (status, type) => {
  if (type === 'sur_place') {
    if (status === 'en_livraison') return 'Prête'
    if (status === 'livree') return 'Récupérée'
  }
  return STATUTS[status]?.label || STATUTS.en_attente.label
}

const statutCommande = (status, type) => ({
  ...(STATUTS[status] || STATUTS.en_attente),
  label: labelStatut(status, type),
})

const FILTRES = [
  { value: 'tous', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livree', label: 'Livrées' },
  { value: 'annulee', label: 'Annulées' },
]

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Orders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [recherche, setRecherche] = useState('')
  const [maj, setMaj] = useState(null)

  useEffect(() => {
    let actif = true
    apiAdminOrders(token)
      .then((d) => actif && setOrders(Array.isArray(d) ? d : d.results || []))
      .catch(() => actif && setErreur('Impossible de charger les commandes.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  const changerStatut = async (id, status) => {
    setMaj(id)
    try {
      await apiAdminPatchOrder(token, id, status)
      setOrders((prev) => prev.map((o) => ((o.id_order ?? o.id) === id ? { ...o, status } : o)))
    } catch {
      setErreur('Échec de la mise à jour du statut.')
    } finally {
      setMaj(null)
    }
  }

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return orders.filter((o) => {
      if (filtre !== 'tous' && o.status !== filtre) return false
      if (!q) return true
      const champs = [o.user_first_name, o.user_last_name, o.user_email, o.user_phone, o.invoice_number]
      return champs.some((c) => c && String(c).toLowerCase().includes(q))
    })
  }, [orders, filtre, recherche])

  return (
    <AdminLayout title="Commandes" subtitle="Suivez et mettez à jour le statut de chaque commande.">
      {erreur && (
        <p className="mb-5 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">
          {erreur}
        </p>
      )}

      <SearchBar
        value={recherche}
        onChange={setRecherche}
        placeholder="Rechercher par nom, prénom, n° de facture, email ou téléphone…"
      />

      {/* filtres par statut */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {loading ? (
        <Skeleton />
      ) : liste.length === 0 ? (
        <Vide label="Aucune commande à afficher." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {liste.map((order) => {
            const st = statutCommande(order.status, order.order_type)
            const oid = order.id_order ?? order.id
            const surPlace = order.order_type === 'sur_place'
            return (
              <div key={oid} className="rounded-3xl border border-white/10 bg-[#240400] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-poppins text-sm font-semibold text-creme">#{order.invoice_number}</p>
                    {(order.user_first_name || order.user_last_name) && (
                      <p className="mt-0.5 truncate font-poppins text-[0.76rem] text-creme/70">
                        {[order.user_first_name, order.user_last_name].filter(Boolean).join(' ')}
                      </p>
                    )}
                    <p className="mt-0.5 truncate font-poppins text-[0.74rem] text-creme/50">
                      {order.user_email}
                    </p>
                    <p className="mt-0.5 font-poppins text-[0.72rem] text-creme/40">
                      {fmtDate(order.order_date)}
                      {order.order_type && ` · ${order.order_type === 'livraison' ? 'Livraison' : 'Sur place'}`}
                    </p>
                  </div>
                  <span className="font-lostar text-xl text-ambre">{order.total_amount} €</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className={`flex items-center gap-2 font-poppins text-[0.74rem] ${st.text}`}>
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  <select
                    value={order.status}
                    disabled={maj === oid}
                    onChange={(e) => changerStatut(oid, e.target.value)}
                    className="rounded-lg border border-white/15 bg-dark px-3 py-2 font-poppins text-[0.74rem] text-creme focus:border-ambre focus:outline-none disabled:opacity-50"
                  >
                    <option value="en_attente">En attente</option>
                    <option value="en_preparation">En préparation</option>
                    <option value="en_livraison">{surPlace ? 'Prête' : 'En livraison'}</option>
                    <option value="livree">{surPlace ? 'Récupérée' : 'Livrée'}</option>
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
        <div key={i} className="h-32 animate-pulse rounded-3xl bg-[#240400]" />
      ))}
    </div>
  )
}

export function Vide({ label }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-[#240400] py-12 text-center">
      <span className="logo-court mb-4 block h-10 w-16 opacity-20" />
      <p className="font-poppins text-[0.82rem] text-creme/55">{label}</p>
    </div>
  )
}
