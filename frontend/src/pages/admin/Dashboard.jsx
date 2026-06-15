import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiAdminStats, apiLogout } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

const STATS = [
  {
    key: 'orders_today',
    label: "Commandes aujourd'hui",
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6a1 1 0 011 1a1 1 0 001 1h1a1 1 0 011 1v11a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1h1a1 1 0 001-1a1 1 0 011-1z" />,
  },
  {
    key: 'pending_reservations',
    label: 'Réservations en attente',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />,
  },
  {
    key: 'total_clients',
    label: 'Clients inscrits',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  },
]

const ACCES = [
  { to: '/admin/commandes', label: 'Suivre les commandes', desc: 'Voir et mettre à jour le statut des commandes' },
  { to: '/admin/menu', label: 'Gérer la carte', desc: 'Ajouter, modifier ou retirer des pizzas' },
  { to: '/admin/clients', label: 'Fiches clients', desc: 'Coordonnées et points de fidélité' },
  { to: '/admin/reservations', label: 'Réservations', desc: 'Tables réservées et confirmations' },
]

export default function Dashboard() {
  const { token, refresh, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  const handleLogout = async () => {
    try { await apiLogout(token, refresh) } catch {}
    logout()
    navigate('/')
  }

  useEffect(() => {
    let actif = true
    apiAdminStats(token)
      .then((s) => actif && setStats(s))
      .catch(() => actif && setErreur('Impossible de charger les statistiques.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  return (
    <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de l'activité du restaurant.">
      {erreur && (
        <p className="mb-5 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">
          {erreur}
        </p>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.key} className="rounded-3xl border border-white/10 bg-[#240400] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rouge/15 text-ambre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                {s.icon}
              </svg>
            </div>
            <p className="mt-4 font-lostar text-4xl leading-none text-creme">
              {loading ? <span className="inline-block h-9 w-12 animate-pulse rounded bg-white/10 align-middle" /> : stats?.[s.key] ?? 0}
            </p>
            <p className="mt-2 font-poppins text-[0.78rem] text-creme/55">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accès rapides */}
      <h2 className="mb-4 mt-10 font-poppins text-base font-semibold text-ambre">Accès rapides</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ACCES.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#240400] p-6 transition hover:border-rouge"
          >
            <div className="min-w-0">
              <p className="font-poppins text-sm font-semibold text-creme">{a.label}</p>
              <p className="mt-1 font-poppins text-[0.76rem] text-creme/50">{a.desc}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0 text-creme/40 transition group-hover:translate-x-1 group-hover:text-ambre">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Déconnexion */}
      <div className="mt-10 flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-rouge/30 px-5 py-2.5 font-poppins text-[0.78rem] text-rouge/80 transition hover:bg-rouge hover:text-creme"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </AdminLayout>
  )
}
