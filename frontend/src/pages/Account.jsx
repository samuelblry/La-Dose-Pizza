import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiMe, apiOrders, apiLogout, apiUpdateMe, apiChangePassword, apiDeleteMe } from '../services/api'

// Palier de fidélité : 100 pts = une réduction
const PALIER = 100

// Libellé + style pour chaque statut de commande
const STATUTS = {
  en_attente: { label: 'En attente', dot: 'bg-creme/50', text: 'text-creme/60' },
  en_preparation: { label: 'En préparation', dot: 'bg-ambre', text: 'text-ambre' },
  en_livraison: { label: 'En livraison', dot: 'bg-ambre', text: 'text-ambre' },
  livree: { label: 'Livrée', dot: 'bg-emerald-400', text: 'text-emerald-400' },
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
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  // Panneaux dépliables
  const [editInfos, setEditInfos] = useState(false)
  const [editMdp, setEditMdp] = useState(false)
  const [confirmSuppr, setConfirmSuppr] = useState(false)

  useEffect(() => {
    let actif = true
    Promise.all([apiMe(token), apiOrders(token)])
      .then(([me, cmds]) => {
        if (!actif) return
        setUser(me)
        setOrders(Array.isArray(cmds) ? cmds : cmds.results || [])
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
    await apiDeleteMe(token)
    logout()
    navigate('/')
  }

  const points = user?.loyalty_points ?? 0
  const reste = Math.max(0, PALIER - (points % PALIER))
  const progress = useMemo(() => ((points % PALIER) / PALIER) * 100, [points])
  const nomComplet = [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const initiale = (user?.first_name || user?.email || '?').charAt(0).toUpperCase()
  const adresse = user?.address

  return (
    <main className="min-h-screen bg-dark pb-32">
      {/* En-tête */}
      <header className="px-6 pt-24 text-center">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Espace client
        </p>
        <h1 className="font-lostar text-[2.6rem] leading-none text-rouge">Mon Compte</h1>
      </header>

      <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5 px-5 lg:mt-14 lg:max-w-5xl lg:px-8">
        {erreur && (
          <p className="rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">
            {erreur}
          </p>
        )}

        {loading ? (
          <Skeleton />
        ) : (
          <>
            {/* Carte fidélité — bannière pleine largeur */}
            <section className="relative overflow-hidden rounded-3xl border border-ambre/20 bg-gradient-to-br from-[#3a0a04] to-[#240400] p-6 lg:flex lg:items-center lg:gap-12 lg:p-8">
              <span className="logo-court pointer-events-none absolute -right-3 -top-3 block h-20 w-32 rotate-12 opacity-[0.06]" />
              <div className="relative lg:shrink-0">
                <p className="font-poppins text-[0.62rem] uppercase tracking-[0.25em] text-ambre">
                  Points de fidélité
                </p>
                <p className="mt-2 font-lostar text-5xl leading-none text-creme lg:text-6xl">
                  {points}
                  <span className="ml-2 font-poppins text-sm font-medium tracking-widest text-ambre">PTS</span>
                </p>
              </div>

              {/* Progression vers le prochain palier */}
              <div className="relative mt-5 lg:mt-0 lg:flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ambre to-rouge transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 font-poppins text-[0.74rem] text-creme/60">
                  Plus que <span className="font-semibold text-ambre">{reste} pts</span> avant votre prochaine réduction
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
              {/* Rail profil */}
              <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:w-80 lg:shrink-0">
            {/* Informations du compte */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rouge font-lostar text-2xl text-creme">
                  {initiale}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-poppins text-sm font-medium text-creme">
                    {nomComplet || user?.email}
                  </p>
                  <p className="font-poppins text-[0.74rem] text-creme/50">Membre La Dose Pizza</p>
                </div>
                {!editInfos && (
                  <button
                    onClick={() => setEditInfos(true)}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-poppins text-[0.7rem] text-creme/70 transition hover:border-ambre hover:text-ambre"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l5 5L8 21H3v-5L16 3z" />
                    </svg>
                    Modifier
                  </button>
                )}
              </div>

              {!editInfos ? (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
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
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-ambre/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3z" />
                  </svg>
                  <div>
                    <p className="font-poppins text-sm font-medium text-creme">Mot de passe</p>
                    <p className="font-poppins text-[0.72rem] text-creme/50">Modifiez votre mot de passe</p>
                  </div>
                </div>
                {!editMdp && (
                  <button
                    onClick={() => setEditMdp(true)}
                    className="rounded-full border border-white/15 px-3 py-1.5 font-poppins text-[0.7rem] text-creme/70 transition hover:border-ambre hover:text-ambre"
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
            <section className="rounded-3xl border border-rouge/30 bg-rouge/5 p-6">
              <p className="font-poppins text-sm font-semibold text-rouge">Supprimer mon compte</p>
              <p className="mt-1 font-poppins text-[0.74rem] leading-relaxed text-creme/50">
                Cette action est définitive. Toutes vos données et commandes seront supprimées.
              </p>
              {!confirmSuppr ? (
                <button
                  onClick={() => setConfirmSuppr(true)}
                  className="mt-4 rounded-xl border border-rouge/50 px-4 py-2.5 font-poppins text-[0.74rem] font-medium text-rouge transition hover:bg-rouge hover:text-creme"
                >
                  Supprimer mon compte
                </button>
              ) : (
                <div className="mt-4 animate-pop motion-reduce:animate-none">
                  <p className="font-poppins text-[0.78rem] text-creme">Êtes-vous sûr ? Cette action est irréversible.</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={supprimerCompte}
                      className="flex-1 rounded-xl bg-rouge py-2.5 font-poppins text-[0.74rem] font-semibold text-creme transition hover:bg-rouge/90"
                    >
                      Oui, supprimer
                    </button>
                    <button
                      onClick={() => setConfirmSuppr(false)}
                      className="flex-1 rounded-xl border border-white/15 py-2.5 font-poppins text-[0.74rem] text-creme/70 transition hover:border-creme hover:text-creme"
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 py-3.5 font-poppins text-[0.78rem] font-medium uppercase tracking-[0.1em] text-creme/70 transition hover:border-creme hover:text-creme"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17l5-5-5-5M20 12H9M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
              </svg>
              Se déconnecter
            </button>
              </aside>

            {/* Historique des commandes */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6 lg:min-w-0 lg:flex-1">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins text-xl text-ambre">Mes commandes</h2>
                {orders.length > 0 && (
                  <span className="font-poppins text-[0.68rem] uppercase tracking-[0.15em] text-creme/40">
                    {orders.length} commande{orders.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="logo-court mb-4 block h-10 w-16 opacity-20" />
                  <p className="font-poppins text-[0.82rem] text-creme/60">Aucune commande pour le moment</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="mt-4 rounded-full bg-rouge px-5 py-2.5 font-poppins text-[0.74rem] font-medium uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
                  >
                    Commander une pizza
                  </button>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {orders.map((order) => {
                    const st = STATUTS[order.status] || STATUTS.en_attente
                    return (
                      <li
                        key={order.id_order}
                        className="rounded-2xl border border-white/5 bg-black/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-poppins text-sm font-medium text-creme">
                              #{order.invoice_number}
                            </p>
                            <p className="mt-0.5 font-poppins text-[0.72rem] text-creme/50">
                              {fmtDate(order.order_date)}
                              {order.order_type && ` · ${order.order_type === 'livraison' ? 'Livraison' : 'Sur place'}`}
                            </p>
                          </div>
                          <span className="font-lostar text-lg text-ambre">{order.total_amount} €</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className={`flex items-center gap-2 font-poppins text-[0.74rem] ${st.text}`}>
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          <a
                            href={`http://localhost:8000/api/orders/${order.id_order}/invoice/`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 font-poppins text-[0.72rem] text-creme/60 underline-offset-4 transition hover:text-ambre hover:underline"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                            </svg>
                            Facture PDF
                          </a>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
            </div>

          </>
        )}
      </div>
    </main>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-ambre/70">
        {icon}
      </svg>
      <div className="min-w-0">
        <p className="font-poppins text-[0.64rem] uppercase tracking-[0.15em] text-creme/40">{label}</p>
        <p className="truncate font-poppins text-sm text-creme">{value}</p>
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
    <form onSubmit={handleSubmit} className="mt-5 animate-pop space-y-4 border-t border-white/10 pt-5 motion-reduce:animate-none">
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
      <p className="mt-4 flex items-center gap-2 font-poppins text-[0.8rem] text-emerald-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
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
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-creme/50">
        {label}
        {required && <span className="text-rouge"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 font-poppins text-sm text-creme placeholder-creme/30 focus:border-ambre/50 focus:outline-none"
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
        className="flex-1 rounded-xl bg-rouge py-3 font-poppins text-[0.78rem] font-semibold text-creme transition hover:bg-rouge/90 disabled:opacity-50"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-white/15 py-3 font-poppins text-[0.78rem] text-creme/70 transition hover:border-creme hover:text-creme"
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
        <div className="h-40 rounded-3xl bg-[#240400]" />
        <div className="h-36 rounded-3xl bg-[#240400]" />
        <div className="h-24 rounded-3xl bg-[#240400]" />
      </div>
      <div className="mt-5 h-80 rounded-3xl bg-[#240400] lg:mt-0 lg:flex-1" />
    </div>
  )
}
