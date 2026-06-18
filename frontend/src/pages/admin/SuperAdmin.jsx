import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  apiSuperAdminStats,
  apiSuperAdminEmployees,
  apiSuperAdminCreateEmployee,
  apiSuperAdminDeleteEmployee,
  apiSuperAdminResetPassword,
  apiSuperAdminUsers,
  apiSuperAdminLogs,
  apiLogout,
} from '../../services/api'

// ── Icônes ──────────────────────────────────────────────────────────────────
const Icon = ({ d, className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const ICONS = {
  revenue:      'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  orders:       'M9 5h6a1 1 0 011 1 1 1 0 001 1h1a1 1 0 011 1v11a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1h1a1 1 0 001-1 1 1 0 011-1z',
  reservations: 'M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  clients:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  employees:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  copy:         'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  check:        'M5 13l4 4L19 7',
  logout:       'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  search:       'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  shield:       'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  clock:        'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  close:        'M6 18L18 6M6 6l12 12',
  add:          'M12 4v16m8-8H4',
  reset:        'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  trash:        'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtRevenue = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const initials = (u) => {
  const f = u.first_name?.[0] || ''
  const l = u.last_name?.[0] || ''
  return (f + l).toUpperCase() || u.email?.[0]?.toUpperCase() || '?'
}

const roleLabel = (u) => {
  if (u.is_superadmin) return { label: 'Super Admin', cls: 'bg-rouge/20 text-rouge' }
  if (u.is_admin) return { label: 'Admin', cls: 'bg-ambre/15 text-ambre' }
  return { label: 'Client', cls: 'bg-white/10 text-creme/70' }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <span className={`inline-block animate-pulse rounded bg-white/10 ${className}`} />
)

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ iconKey, value, label, loading, accent = false }) {
  return (
    <div className={`rounded-3xl border p-6 transition ${accent ? 'border-ambre/30 bg-ambre/5' : 'border-white/10 bg-[#240400]'}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent ? 'bg-ambre/20 text-ambre' : 'bg-rouge/15 text-ambre'}`}>
        <Icon d={ICONS[iconKey]} />
      </div>
      <p className="mt-4 font-lostar text-4xl leading-none text-creme">
        {loading ? <Skeleton className="h-9 w-20 align-middle" /> : value}
      </p>
      <p className="mt-2 font-poppins text-[0.78rem] text-creme/55">{label}</p>
    </div>
  )
}

// ── Temp Password Panel ───────────────────────────────────────────────────────
function TempPwdPanel({ data, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(data.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl border border-ambre/40 bg-[#1a0200] p-5 shadow-2xl">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-poppins text-[0.7rem] uppercase tracking-widest text-ambre/70">Mot de passe temporaire</p>
        <button onClick={onClose} className="text-creme/40 hover:text-creme">
          <Icon d={ICONS.close} className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-1 font-poppins text-[0.75rem] text-creme/60">Pour : <span className="text-creme">{data.name}</span></p>
      <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
        <code className="flex-1 font-mono text-base tracking-wider text-ambre">{data.password}</code>
        <button onClick={copy} className="shrink-0 text-creme/50 transition hover:text-ambre">
          <Icon d={copied ? ICONS.check : ICONS.copy} className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 font-poppins text-[0.7rem] text-creme/40">Communiquez ce mot de passe à l'employé, il ne sera plus affiché.</p>
    </div>
  )
}

// ── Modal confirmation ────────────────────────────────────────────────────────
function ConfirmModal({ config, onClose }) {
  if (!config) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#240400] p-6 shadow-2xl">
        <h3 className="mb-2 font-poppins text-lg font-semibold text-rouge">{config.title}</h3>
        <p className="mb-6 font-poppins text-sm text-creme/70">{config.message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full border border-creme/20 px-4 py-2 font-poppins text-xs text-creme transition hover:bg-creme/10">
            Annuler
          </button>
          <button onClick={config.onConfirm} className="rounded-full bg-rouge px-4 py-2 font-poppins text-xs text-white transition hover:bg-rouge/80">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Employee Tab ──────────────────────────────────────────────────────────────
function EmployeesTab({ token, onTempPwd }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: 'employe' })
  const [submitting, setSubmitting] = useState(false)
  const [modal, setModal] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    apiSuperAdminEmployees(token)
      .then(setEmployees)
      .catch(() => setErreur('Impossible de charger les employés.'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErreur('')
    try {
      const res = await apiSuperAdminCreateEmployee(token, {
        ...form,
        is_admin: form.role === 'admin',
      })
      onTempPwd({ password: res.temp_password, name: `${res.first_name} ${res.last_name}`.trim() || res.email })
      setForm({ first_name: '', last_name: '', email: '', role: 'employe' })
      setShowForm(false)
      load()
    } catch (err) {
      setErreur(err?.error || 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (emp) => {
    setModal({
      title: "Supprimer l'employé",
      message: `Voulez-vous vraiment supprimer ${emp.first_name} ${emp.last_name} ?`,
      onConfirm: async () => {
        setModal(null)
        await apiSuperAdminDeleteEmployee(token, emp.id)
        load()
      },
    })
  }

  const handleReset = (emp) => {
    setModal({
      title: 'Réinitialiser le mot de passe',
      message: `Voulez-vous réinitialiser le mot de passe de ${emp.first_name} ?`,
      onConfirm: async () => {
        setModal(null)
        const res = await apiSuperAdminResetPassword(token, emp.id)
        onTempPwd({ password: res.temp_password, name: res.name })
      },
    })
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-poppins text-base font-semibold text-ambre">
          {loading ? <Skeleton className="h-4 w-32" /> : `${employees.length} employé${employees.length !== 1 ? 's' : ''}`}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-poppins text-xs font-semibold transition ${showForm ? 'border border-creme/20 text-creme hover:bg-creme/10' : 'bg-rouge text-white hover:bg-rouge/80'}`}
        >
          <Icon d={showForm ? ICONS.close : ICONS.add} className="h-3.5 w-3.5" />
          {showForm ? 'Annuler' : 'Ajouter un employé'}
        </button>
      </div>

      {erreur && (
        <p className="mb-4 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">{erreur}</p>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-3xl border border-ambre/20 bg-[#240400] p-6">
          <h3 className="mb-4 font-poppins text-sm font-semibold text-creme">Nouvel employé</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block font-poppins text-[0.7rem] text-creme/50">Prénom</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Jean"
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 font-poppins text-sm text-creme outline-none focus:border-ambre"
              />
            </div>
            <div>
              <label className="mb-1 block font-poppins text-[0.7rem] text-creme/50">Nom</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Dupont"
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 font-poppins text-sm text-creme outline-none focus:border-ambre"
              />
            </div>
            <div>
              <label className="mb-1 block font-poppins text-[0.7rem] text-creme/50">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@ladosepizza.fr"
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 font-poppins text-sm text-creme outline-none focus:border-ambre"
              />
            </div>
            <div>
              <label className="mb-1 block font-poppins text-[0.7rem] text-creme/50">Rôle *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#240400] px-4 py-2.5 font-poppins text-sm text-creme outline-none focus:border-ambre"
              >
                <option value="employe">Employé</option>
                <option value="admin">Admin (accès dashboard)</option>
              </select>
            </div>
          </div>
          <p className="mt-3 font-poppins text-[0.7rem] text-creme/40">Un mot de passe temporaire sera généré automatiquement.</p>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-ambre px-5 py-2 font-poppins text-xs font-semibold text-dark transition hover:bg-ambre/80 disabled:opacity-50"
          >
            {submitting ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-white/10 bg-[#240400] p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#240400] py-14 text-center">
          <Icon d={ICONS.employees} className="mx-auto mb-3 h-8 w-8 text-creme/20" />
          <p className="font-poppins text-sm text-creme/40">Aucun employé enregistré.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {employees.map((emp) => (
            <div key={emp.id} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-[#240400] p-5 transition hover:border-white/20">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rouge font-lostar text-xl text-creme">
                {initials(emp)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-poppins text-sm font-semibold text-creme">
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p className="truncate font-poppins text-[0.74rem] text-creme/50">{emp.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 font-poppins text-[0.67rem] font-semibold ${emp.is_admin ? 'bg-rouge/20 text-rouge' : 'bg-ambre/15 text-ambre'}`}>
                    {emp.is_admin ? 'Admin' : 'Employé'}
                  </span>
                </div>
                {emp.last_login_at && (
                  <p className="mt-1.5 flex items-center gap-1 font-poppins text-[0.7rem] text-creme/35">
                    <Icon d={ICONS.clock} className="h-3 w-3" />
                    Dernière connexion : {fmtDateTime(emp.last_login_at)}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleReset(emp)}
                    className="flex items-center gap-1.5 rounded-full border border-ambre/30 px-3 py-1.5 font-poppins text-[0.7rem] text-ambre transition hover:bg-ambre hover:text-dark"
                  >
                    <Icon d={ICONS.reset} className="h-3 w-3" />
                    Reset MDP
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="flex items-center gap-1.5 rounded-full border border-rouge/30 px-3 py-1.5 font-poppins text-[0.7rem] text-rouge transition hover:bg-rouge hover:text-creme"
                  >
                    <Icon d={ICONS.trash} className="h-3 w-3" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal config={modal} onClose={() => setModal(null)} />
    </>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab({ token }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiSuperAdminUsers(token)
      .then(setUsers)
      .catch(() => setErreur('Impossible de charger les utilisateurs.'))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return !q ||
      u.email?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="mb-5">
        <div className="relative">
          <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-creme/30" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-transparent py-2.5 pl-10 pr-4 font-poppins text-sm text-creme outline-none placeholder:text-creme/30 focus:border-ambre/50"
          />
        </div>
      </div>

      {erreur && (
        <p className="mb-4 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">{erreur}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#240400] px-5 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#240400] py-14 text-center">
          <Icon d={ICONS.clients} className="mx-auto mb-3 h-8 w-8 text-creme/20" />
          <p className="font-poppins text-sm text-creme/40">Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 font-poppins text-[0.75rem] text-creme/40">
            {filtered.length} client{filtered.length !== 1 ? 's' : ''}
            {search ? ' (filtrés)' : ''}
          </p>
          <div className="space-y-2">
            {filtered.map((u) => {
              return (
                <div key={u.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#240400] px-5 py-4 transition hover:border-white/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-lostar text-lg text-creme">
                    {initials(u)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-poppins text-sm font-semibold text-creme">
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '—'}
                    </p>
                    <p className="truncate font-poppins text-[0.73rem] text-creme/50">{u.email}</p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-4 sm:flex">
                    {!u.is_admin && (
                      <p className="font-poppins text-[0.72rem] text-creme/40">
                        <span className="text-ambre font-semibold">{u.loyalty_points}</span> pts
                      </p>
                    )}
                    {u.address?.city && (
                      <p className="hidden font-poppins text-[0.72rem] text-creme/35 md:block">{u.address.city}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-poppins text-[0.67rem] font-semibold text-creme/60">
                    Client
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────
function LogsTab({ token }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [filterEmp, setFilterEmp] = useState('')

  useEffect(() => {
    apiSuperAdminLogs(token)
      .then(setLogs)
      .catch(() => setErreur('Impossible de charger les logs.'))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = logs.filter((l) => {
    if (!filterEmp) return true
    const q = filterEmp.toLowerCase()
    return l.user_email?.toLowerCase().includes(q) || l.user_name?.toLowerCase().includes(q)
  })

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-creme/30" />
          <input
            type="text"
            placeholder="Filtrer par employé…"
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-transparent py-2.5 pl-10 pr-4 font-poppins text-sm text-creme outline-none placeholder:text-creme/30 focus:border-ambre/50"
          />
        </div>
        <p className="font-poppins text-[0.75rem] text-creme/35">200 derniers logs</p>
      </div>

      {erreur && (
        <p className="mb-4 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">{erreur}</p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#240400] px-5 py-3.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3.5 w-44 flex-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#240400] py-14 text-center">
          <Icon d={ICONS.clock} className="mx-auto mb-3 h-8 w-8 text-creme/20" />
          <p className="font-poppins text-sm text-creme/40">
            {filterEmp ? 'Aucun log correspondant.' : 'Aucun log de connexion enregistré.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="hidden grid-cols-[1fr_1.6fr_1.2fr_1fr] gap-4 border-b border-white/10 bg-[#1a0100] px-5 py-3 sm:grid">
            {['Employé', 'Email', 'Date & Heure', 'IP'].map((h) => (
              <p key={h} className="font-poppins text-[0.68rem] font-semibold uppercase tracking-wider text-creme/35">{h}</p>
            ))}
          </div>
          <div className="divide-y divide-white/5 bg-[#240400]">
            {filtered.map((log) => (
              <div key={log.id} className="grid grid-cols-1 gap-1 px-5 py-3.5 transition hover:bg-white/5 sm:grid-cols-[1fr_1.6fr_1.2fr_1fr] sm:items-center sm:gap-4">
                <p className="font-poppins text-sm font-semibold text-creme">{log.user_name}</p>
                <p className="truncate font-poppins text-[0.74rem] text-creme/55">{log.user_email}</p>
                <p className="font-poppins text-[0.74rem] text-creme/50">{fmtDateTime(log.timestamp)}</p>
                <p className="font-mono text-[0.72rem] text-creme/35">{log.ip_address || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'employees', label: 'Employés', icon: ICONS.employees },
  { id: 'users', label: 'Utilisateurs', icon: ICONS.clients },
  { id: 'logs', label: 'Logs connexion', icon: ICONS.clock },
]

const STATS_DEF = [
  { key: 'total_revenue', label: "Chiffre d'affaires", icon: 'revenue', fmt: fmtRevenue, accent: true },
  { key: 'total_orders', label: 'Commandes totales', icon: 'orders', fmt: (n) => n },
  { key: 'total_reservations', label: 'Réservations totales', icon: 'reservations', fmt: (n) => n },
  { key: 'total_clients', label: 'Clients inscrits', icon: 'clients', fmt: (n) => n },
  { key: 'total_employees', label: 'Employés actifs', icon: 'employees', fmt: (n) => n },
]

export default function SuperAdmin() {
  const navigate = useNavigate()
  const { token, refresh, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('employees')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [tempPwd, setTempPwd] = useState(null)

  const handleLogout = async () => {
    try { await apiLogout(token, refresh) } catch {}
    logout()
    navigate('/')
  }

  useEffect(() => {
    let actif = true
    apiSuperAdminStats(token)
      .then((s) => actif && setStats(s))
      .catch(() => {})
      .finally(() => actif && setStatsLoading(false))
    return () => { actif = false }
  }, [token])

  return (
    <main className="min-h-screen bg-dark pb-32">
      {/* Header */}
      <header className="px-6 pt-24 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-rouge/20 text-rouge">
          <Icon d={ICONS.shield} className="h-5 w-5" />
        </div>
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Espace Super Administrateur
        </p>
        <h1 className="font-lostar text-[2.4rem] leading-none text-rouge lg:text-[3rem]">Gestion Globale</h1>
        <p className="mx-auto mt-3 max-w-md font-poppins text-[0.82rem] text-creme/55">
          Statistiques globales, gestion des employés et des comptes.
        </p>
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 mx-auto rounded-full border border-rouge/40 px-5 py-2 font-poppins text-xs text-rouge transition hover:bg-rouge hover:text-creme"
        >
          <Icon d={ICONS.logout} className="h-3.5 w-3.5" />
          Se déconnecter
        </button>
      </header>

      <div className="mx-auto mt-10 max-w-6xl px-5 lg:px-8">
        {/* Stats */}
        <h2 className="mb-4 font-poppins text-base font-semibold text-ambre">Statistiques globales</h2>
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS_DEF.map((s) => (
            <StatCard
              key={s.key}
              iconKey={s.icon}
              value={stats ? s.fmt(stats[s.key]) : 0}
              label={s.label}
              loading={statsLoading}
              accent={s.accent}
            />
          ))}
        </div>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-white/10 bg-[#1a0100] p-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-poppins text-sm font-medium transition ${
                activeTab === t.id
                  ? 'bg-rouge text-white shadow-md'
                  : 'text-creme/50 hover:text-creme'
              }`}
            >
              <Icon d={t.icon} className="hidden h-4 w-4 sm:block" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'employees' && (
          <EmployeesTab token={token} onTempPwd={setTempPwd} />
        )}
        {activeTab === 'users' && (
          <UsersTab token={token} />
        )}
        {activeTab === 'logs' && (
          <LogsTab token={token} />
        )}
      </div>

      {/* Temp password toast */}
      {tempPwd && <TempPwdPanel data={tempPwd} onClose={() => setTempPwd(null)} />}
    </main>
  )
}
