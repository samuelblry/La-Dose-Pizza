import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiMe, apiOrders, apiReservations, apiLogout, apiUpdateMe, apiChangePassword, apiDeleteMe, apiCancelReservation, MEDIA_BASE } from '../services/api'

// Libellé + style pour chaque statut de commande (thème clair)
const STATUTS = {
  en_attente: { label: 'En attente', dot: 'bg-dark/20', text: 'text-dark/50' },
  en_preparation: { label: 'En préparation', dot: 'bg-ambre', text: 'text-ambre' },
  en_livraison: { label: 'En livraison', dot: 'bg-ambre', text: 'text-ambre' },
  livree: { label: 'Livrée', dot: 'bg-emerald-500', text: 'text-emerald-500' },
  annulee: { label: 'Annulée', dot: 'bg-rouge', text: 'text-rouge' },
}

const STATUTS_RESA = {
  en_attente: { label: 'En attente', dot: 'bg-dark/20', text: 'text-dark/50' },
  confirmee: { label: 'Confirmée', dot: 'bg-emerald-500', text: 'text-emerald-500' },
  annulee: { label: 'Annulée', dot: 'bg-rouge', text: 'text-rouge' },
}

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Account() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [telechargement, setTelechargement] = useState(null)
  const [modalConfig, setModalConfig] = useState(null)

  // Limites pour "Voir plus"
  const [ordersLimit, setOrdersLimit] = useState(3)
  const [reservationsLimit, setReservationsLimit] = useState(3)

  // Télécharge la facture PDF avec le token JWT
  async function telechargerFacture(orderId, invoiceNumber) {
    setTelechargement(orderId)
    try {
      const res = await fetch(`${MEDIA_BASE}/api/orders/${orderId}/invoice/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Erreur')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture_${invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setModalConfig({
        title: "Erreur",
        message: "Impossible de télécharger la facture.",
        isAlert: true,
        onConfirm: () => setModalConfig(null)
      })
    } finally {
      setTelechargement(null)
    }
  }

  // Panneaux dépliables
  const [editInfos, setEditInfos] = useState(false)
  const [editMdp, setEditMdp] = useState(false)
  const [confirmSuppr, setConfirmSuppr] = useState(false)

  useEffect(() => {
    let actif = true
    Promise.all([apiMe(token), apiOrders(token), apiReservations(token)])
      .then(([me, cmds, resa]) => {
        if (!actif) return
        setUser(me)
        setOrders(Array.isArray(cmds) ? cmds : cmds.results || [])
        setReservations(Array.isArray(resa) ? resa : resa.results || [])
      })
      .catch(() => actif && setErreur('Impossible de charger votre compte.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  const deconnexion = async () => {
    try {
      await apiLogout(token, localStorage.getItem('refresh'))
    } catch {
      // on déconnecte quand même côté front
    }
    logout()
    navigate('/')
  }

  const supprimerCompte = async () => {
    try {
      await apiDeleteMe(token)
    } catch {
      // on continue la déconnexion même si l'API échoue
    }
    logout()
    navigate('/')
  }

  const handleCancelReservation = (id) => {
    setModalConfig({
      title: "Annuler la réservation",
      message: "Voulez-vous vraiment annuler cette réservation ?",
      onConfirm: async () => {
        setModalConfig(null)
        try {
          await apiCancelReservation(token, id);
          setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'annulee' } : r));
        } catch (err) {
          setErreur(err?.error || err?.detail || "Erreur lors de l'annulation.");
        }
      }
    })
  }

  const points = user?.loyalty_points ?? 0
  const nomComplet = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const initiale = (user?.first_name || user?.email || '?').charAt(0).toUpperCase()
  const adresse = user?.address

  return (
    <main className="min-h-screen bg-creme pb-32">
      {/* En-tête Héros */}
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-5xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            Espace client
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Mon Compte
          </h1>
        </div>
      </header>

      <div className="mx-auto mt-[-2rem] relative z-10 flex max-w-lg flex-col gap-5 px-5 lg:mt-[-3rem] lg:max-w-6xl lg:px-8">
        {erreur && (
          <div className="flex items-center gap-2 rounded-2xl border border-rouge/20 bg-rouge/10 px-5 py-4 font-poppins text-[0.8rem] text-rouge shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {erreur}
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Carte fidélité — claire */}
            <section className="relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 p-6 lg:flex lg:items-center lg:gap-12 lg:p-8">
              <span className="logo-court pointer-events-none absolute -right-3 -top-3 block h-20 w-32 rotate-12 opacity-[0.03] text-dark" />
              <div className="relative lg:shrink-0">
                <p className="font-poppins text-[0.62rem] uppercase tracking-[0.25em] text-dark/40">
                  Points de fidélité
                </p>
                <p className="mt-2 font-lostar text-5xl leading-none text-rouge lg:text-6xl">
                  {points}
                  <span className="ml-2 font-poppins text-sm font-medium tracking-widest text-ambre">PTS</span>
                </p>
              </div>

              {/* Équivalence en euros */}
              <div className="relative mt-5 lg:mt-0 lg:flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ambre/10 text-ambre-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <p className="font-poppins text-sm font-medium text-dark">
                      Valeur actuelle : <span className="text-rouge font-semibold">{(points * 0.10).toFixed(2)} €</span>
                    </p>
                    <p className="mt-0.5 font-poppins text-[0.74rem] text-dark/50">
                      Utilisables librement lors du paiement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
              {/* Rail profil */}
              <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:w-80 lg:shrink-0">
                {/* Informations du compte */}
                <section className="rounded-3xl bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rouge/10 font-lostar text-2xl text-rouge">
                      {initiale}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-poppins text-sm font-semibold text-dark">
                        {nomComplet || user?.email}
                      </p>
                      <p className="font-poppins text-[0.74rem] text-dark/50">Membre La Dose Pizza</p>
                    </div>
                    {!editInfos && (
                      <button
                        onClick={() => setEditInfos(true)}
                        className="flex items-center gap-1.5 rounded-full border border-dark/10 bg-dark/5 px-3 py-1.5 font-poppins text-[0.7rem] text-dark/60 transition hover:border-rouge hover:text-rouge hover:bg-rouge/5"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l5 5L8 21H3v-5L16 3z" />
                        </svg>
                        Éditer
                      </button>
                    )}
                  </div>

                  {!editInfos ? (
                    <div className="mt-5 space-y-3 border-t border-dark/5 pt-5">
                      <InfoRow
                        label="Nom complet"
                        value={nomComplet || '—'}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />}
                      />
                      <InfoRow
                        label="Email"
                        value={user?.email || '—'}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />}
                      />
                      <InfoRow
                        label="Téléphone"
                        value={user?.phone || '—'}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.5a1 1 0 011 .76l1 4a1 1 0 01-.29.95l-1.6 1.6a14 14 0 006.34 6.34l1.6-1.6a1 1 0 01.95-.29l4 1a1 1 0 01.76 1V19a2 2 0 01-2 2A16 16 0 013 5z" />}
                      />
                      <InfoRow
                        label="Adresse"
                        value={adresse ? `${adresse.street}, ${adresse.zip_code} ${adresse.city}` : 'Aucune adresse enregistrée'}
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.2-7-11a7 7 0 1114 0c0 5.8-7 11-7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />}
                      />
                    </div>
                  ) : (
                    <FormInfos
                      user={user}
                      token={token}
                      onCancel={() => setEditInfos(false)}
                      onSaved={(maj) => {
                        setUser(maj)
                        setEditInfos(false)
                      }}
                    />
                  )}
                </section>

                {/* Sécurité — mot de passe */}
                <section className="rounded-3xl bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-ambre">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3z" />
                      </svg>
                      <div>
                        <p className="font-poppins text-sm font-semibold text-dark">Mot de passe</p>
                        <p className="font-poppins text-[0.72rem] text-dark/50">Modifiez votre accès</p>
                      </div>
                    </div>
                    {!editMdp && (
                      <button
                        onClick={() => setEditMdp(true)}
                        className="rounded-full border border-dark/10 bg-dark/5 px-3 py-1.5 font-poppins text-[0.7rem] text-dark/60 transition hover:border-ambre hover:text-ambre hover:bg-ambre/5"
                      >
                        Changer
                      </button>
                    )}
                  </div>

                  {editMdp && (
                    <FormMotDePasse
                      token={token}
                      onCancel={() => setEditMdp(false)}
                      onSaved={() => setEditMdp(false)}
                    />
                  )}
                </section>

                {/* Zone dangereuse — suppression du compte */}
                <section className="rounded-3xl border border-rouge/20 bg-rouge/5 p-6 shadow-sm">
                  <p className="font-poppins text-sm font-semibold text-rouge">Zone de danger</p>
                  <p className="mt-1 font-poppins text-[0.74rem] leading-relaxed text-dark/60">
                    La suppression de votre compte est définitive. Toutes vos données seront effacées.
                  </p>
                  {!confirmSuppr ? (
                    <button
                      onClick={() => setConfirmSuppr(true)}
                      className="mt-4 rounded-xl border border-rouge/30 bg-white px-4 py-2.5 font-poppins text-[0.74rem] font-medium text-rouge transition hover:bg-rouge hover:text-white"
                    >
                      Supprimer mon compte
                    </button>
                  ) : (
                    <div className="mt-4 animate-pop motion-reduce:animate-none">
                      <p className="font-poppins text-[0.78rem] font-medium text-dark">Êtes-vous sûr ? C'est irréversible.</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          onClick={supprimerCompte}
                          className="flex-1 rounded-xl bg-rouge py-2.5 font-poppins text-[0.74rem] font-semibold text-white transition hover:bg-rouge/90 shadow-sm"
                        >
                          Oui, supprimer
                        </button>
                        <button
                          onClick={() => setConfirmSuppr(false)}
                          className="flex-1 rounded-xl border border-dark/15 bg-white py-2.5 font-poppins text-[0.74rem] text-dark/70 transition hover:border-dark hover:text-dark"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Déconnexion */}
                <button
                  onClick={deconnexion}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dark/10 bg-white py-3.5 font-poppins text-[0.78rem] font-medium uppercase tracking-[0.1em] text-dark/60 shadow-sm transition hover:border-dark hover:text-dark"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17l5-5-5-5M20 12H9M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
                  </svg>
                  Se déconnecter
                </button>
              </aside>

              {/* Historique des commandes & Réservations */}
              <div className="flex flex-col gap-5 lg:min-w-0 lg:flex-1">
                
                {/* Mes commandes */}
                <section className="rounded-3xl bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-poppins text-lg font-semibold text-dark">Mes commandes</h2>
                    {orders.length > 0 && (
                      <span className="font-poppins text-[0.68rem] uppercase tracking-[0.15em] text-dark/40 bg-dark/5 px-2.5 py-1 rounded-full">
                        {orders.length} au total
                      </span>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <span className="logo-court mb-3 block h-8 w-12 opacity-10 text-dark" />
                      <p className="font-poppins text-[0.82rem] text-dark/50">Aucune commande pour le moment</p>
                      <button
                        onClick={() => navigate('/menu')}
                        className="mt-4 rounded-full bg-rouge/10 text-rouge px-5 py-2.5 font-poppins text-[0.74rem] font-medium uppercase tracking-[0.1em] transition hover:bg-rouge hover:text-white"
                      >
                        Commander une pizza
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-3">
                        {orders.slice(0, ordersLimit).map((order) => {
                          const st = STATUTS[order.status] || STATUTS.en_attente
                          return (
                            <li
                              key={order.id_order || order.id}
                              className="rounded-2xl border border-dark/5 bg-creme/30 p-4 transition hover:border-dark/10"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-poppins text-sm font-semibold text-dark">
                                    #{order.invoice_number}
                                  </p>
                                  <p className="mt-0.5 font-poppins text-[0.72rem] text-dark/50">
                                    {fmtDate(order.order_date)}
                                    {order.order_type && ` · ${order.order_type === 'livraison' ? 'Livraison' : 'Sur place'}`}
                                  </p>
                                </div>
                                <span className="font-lostar text-lg text-rouge">{order.total_amount} €</span>
                              </div>

                              <div className="mt-3 flex items-center justify-between border-t border-dark/5 pt-3">
                                <span className={`flex items-center gap-2 font-poppins text-[0.74rem] font-medium ${st.text}`}>
                                  <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                  {st.label}
                                </span>
                                <button
                                  onClick={() => telechargerFacture(order.id ?? order.id_order, order.invoice_number)}
                                  disabled={telechargement === (order.id ?? order.id_order)}
                                  className="flex items-center gap-1.5 font-poppins text-[0.72rem] text-dark/50 underline-offset-4 transition hover:text-rouge hover:underline disabled:opacity-40"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                                  </svg>
                                  {telechargement === (order.id ?? order.id_order) ? 'Téléchargement...' : 'Facture PDF'}
                                </button>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                      
                      {orders.length > ordersLimit && (
                        <button
                          onClick={() => setOrdersLimit(prev => prev + 3)}
                          className="mt-4 w-full rounded-xl border border-dark/10 bg-dark/5 py-2.5 font-poppins text-[0.74rem] font-medium text-dark/60 transition hover:bg-dark/10 hover:text-dark"
                        >
                          Voir plus de commandes
                        </button>
                      )}
                    </>
                  )}
                </section>

                {/* Mes réservations */}
                <section className="rounded-3xl bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-poppins text-lg font-semibold text-dark">Mes réservations</h2>
                    {reservations.length > 0 && (
                      <span className="font-poppins text-[0.68rem] uppercase tracking-[0.15em] text-dark/40 bg-dark/5 px-2.5 py-1 rounded-full">
                        {reservations.length} au total
                      </span>
                    )}
                  </div>

                  {reservations.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <span className="logo-court mb-3 block h-8 w-12 opacity-10 text-dark" />
                      <p className="font-poppins text-[0.82rem] text-dark/50">Aucune réservation pour le moment</p>
                      <button
                        onClick={() => navigate('/reservation')}
                        className="mt-4 rounded-full bg-rouge/10 text-rouge px-5 py-2.5 font-poppins text-[0.74rem] font-medium uppercase tracking-[0.1em] transition hover:bg-rouge hover:text-white"
                      >
                        Réserver une table
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="space-y-3">
                        {reservations.slice(0, reservationsLimit).map((r) => {
                          const st = STATUTS_RESA[r.status] || STATUTS_RESA.en_attente
                          return (
                            <li key={r.id} className="rounded-2xl border border-dark/5 bg-creme/30 p-4 transition hover:border-dark/10">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-poppins text-sm font-semibold text-dark">
                                    {new Date(r.reservation_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    {' à '}{r.reservation_time?.slice(0, 5)}
                                  </p>
                                  <p className="mt-0.5 font-poppins text-[0.72rem] text-dark/50">
                                    {r.guest_count} personne{r.guest_count > 1 ? 's' : ''}
                                    {r.table_number ? ` · Table ${r.table_number}` : ''}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className={`flex items-center gap-2 font-poppins text-[0.74rem] font-medium ${st.text}`}>
                                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                    {st.label}
                                  </span>
                                  {(r.status === 'en_attente' || r.status === 'confirmee') && (
                                    <button
                                      onClick={() => handleCancelReservation(r.id)}
                                      className="font-poppins text-[0.65rem] uppercase tracking-wider text-rouge/70 transition hover:text-rouge hover:underline"
                                    >
                                      Annuler
                                    </button>
                                  )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>

                      {reservations.length > reservationsLimit && (
                        <button
                          onClick={() => setReservationsLimit(prev => prev + 3)}
                          className="mt-4 w-full rounded-xl border border-dark/10 bg-dark/5 py-2.5 font-poppins text-[0.74rem] font-medium text-dark/60 transition hover:bg-dark/10 hover:text-dark"
                        >
                          Voir plus de réservations
                        </button>
                      )}
                    </>
                  )}
                </section>
              </div>
            </div>

          </>
        )}
      </div>

      {/* Modal de confirmation / alerte */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-dark/5">
            <h3 className="mb-2 font-poppins text-lg font-semibold text-dark">{modalConfig.title}</h3>
            <p className="mb-6 font-poppins text-sm text-dark/70">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              {!modalConfig.isAlert && (
                <button
                  onClick={() => setModalConfig(null)}
                  className="rounded-full border border-dark/15 px-4 py-2 font-poppins text-xs font-medium text-dark/70 transition hover:border-dark hover:text-dark"
                >
                  Annuler
                </button>
              )}
              <button
                onClick={modalConfig.onConfirm}
                className="rounded-full bg-rouge px-4 py-2 font-poppins text-xs font-medium text-white transition hover:bg-rouge/90"
              >
                {modalConfig.isAlert ? 'Compris' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-ambre">
        {icon}
      </svg>
      <div className="min-w-0">
        <p className="font-poppins text-[0.64rem] uppercase tracking-[0.15em] text-dark/40">{label}</p>
        <p className="truncate font-poppins text-sm text-dark font-medium">{value}</p>
      </div>
    </div>
  )
}

// Formulaire d'édition des infos (email, téléphone, adresse)
function FormInfos({ user, token, onCancel, onSaved }) {
  const adr = user?.address || {}
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setSaving(true)
    const f = new FormData(e.target)
    const payload = {
      first_name: f.get('first_name'),
      last_name: f.get('last_name'),
      email: f.get('email'),
      phone: f.get('phone'),
      street: f.get('street'),
      zip_code: f.get('zip_code'),
      city: f.get('city'),
    }
    try {
      const maj = await apiUpdateMe(token, payload)
      onSaved(maj)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'Échec de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 animate-pop space-y-4 border-t border-dark/5 pt-5 motion-reduce:animate-none">
      {erreur && <p className="font-poppins text-[0.78rem] text-rouge">{erreur}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" name="first_name" defaultValue={user?.first_name} />
        <Field label="Nom" name="last_name" defaultValue={user?.last_name} />
      </div>
      <Field label="Email" name="email" type="email" defaultValue={user?.email} required />
      <Field label="Téléphone" name="phone" type="tel" defaultValue={user?.phone} />
      <Field label="Adresse" name="street" defaultValue={adr.street} placeholder="12 rue de la Pizza" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Code postal" name="zip_code" defaultValue={adr.zip_code} placeholder="75011" />
        <Field label="Ville" name="city" defaultValue={adr.city} placeholder="Paris" />
      </div>
      <Actions saving={saving} onCancel={onCancel} />
    </form>
  )
}

// Formulaire de changement de mot de passe
function FormMotDePasse({ token, onCancel, onSaved }) {
  const [erreur, setErreur] = useState('')
  const [ok, setOk] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    const f = new FormData(e.target)
    const current = f.get('current_password')
    const next = f.get('new_password')
    const confirm = f.get('confirm_password')
    if (next.length < 6) return setErreur('Le nouveau mot de passe doit faire au moins 6 caractères.')
    if (next !== confirm) return setErreur('Les mots de passe ne correspondent pas.')
    setSaving(true)
    try {
      await apiChangePassword(token, { current_password: current, new_password: next })
      setOk(true)
      setTimeout(onSaved, 1200)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'Mot de passe actuel incorrect.')
    } finally {
      setSaving(false)
    }
  }

  if (ok) {
    return (
      <p className="mt-4 flex items-center gap-2 font-poppins text-[0.8rem] font-medium text-emerald-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Mot de passe mis à jour
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 animate-pop space-y-4 motion-reduce:animate-none">
      {erreur && <p className="font-poppins text-[0.78rem] text-rouge">{erreur}</p>}
      <Field label="Mot de passe actuel" name="current_password" type="password" required />
      <Field label="Nouveau mot de passe" name="new_password" type="password" required />
      <Field label="Confirmer le mot de passe" name="confirm_password" type="password" required />
      <Actions saving={saving} onCancel={onCancel} />
    </form>
  )
}

function Field({ label, name, type = 'text', defaultValue, placeholder, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-dark/50 font-medium">
        {label}
        {required && <span className="text-rouge"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-dark/15 bg-creme/40 px-4 py-3 font-poppins text-sm text-dark placeholder-dark/30 focus:border-rouge/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rouge/10 transition"
      />
    </label>
  )
}

function Actions({ saving, onCancel }) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="submit"
        disabled={saving}
        className="flex-1 rounded-xl bg-rouge py-3 font-poppins text-[0.78rem] font-semibold text-white transition hover:bg-rouge/90 disabled:opacity-50 shadow-sm"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-dark/15 bg-white py-3 font-poppins text-[0.78rem] font-medium text-dark/70 transition hover:border-dark hover:text-dark"
      >
        Annuler
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse lg:flex lg:items-start lg:gap-6">
      <div className="space-y-5 lg:w-80 lg:shrink-0">
        <div className="h-40 rounded-3xl bg-dark/5" />
        <div className="h-36 rounded-3xl bg-dark/5" />
        <div className="h-24 rounded-3xl bg-dark/5" />
      </div>
      <div className="mt-5 h-80 rounded-3xl bg-dark/5 lg:mt-0 lg:flex-1" />
    </div>
  )
}
