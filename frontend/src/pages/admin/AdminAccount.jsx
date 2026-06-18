import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiMe, apiChangePassword } from '../../services/api'
import AdminLayout from '../../components/AdminLayout'

const InputField = ({ label, value }) => (
  <div>
    <label className="mb-1 block font-poppins text-[0.7rem] text-creme/40">{label}</label>
    <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-poppins text-sm text-creme/60 select-none cursor-not-allowed">
      {value || '—'}
    </div>
  </div>
)

export default function AdminAccount() {
  const { token } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Changement de mot de passe
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let actif = true
    apiMe(token)
      .then((u) => actif && setUser(u))
      .catch(() => {})
      .finally(() => actif && setLoading(false))
    return () => { actif = false }
  }, [token])

  const handleChangePwd = async (e) => {
    e.preventDefault()
    setErreur('')
    setOk(false)
    if (form.next.length < 6) return setErreur('Le nouveau mot de passe doit faire au moins 6 caractères.')
    if (form.next !== form.confirm) return setErreur('Les mots de passe ne correspondent pas.')
    setSaving(true)
    try {
      await apiChangePassword(token, { current_password: form.current, new_password: form.next })
      setOk(true)
      setForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setOk(false), 3000)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'Mot de passe actuel incorrect.')
    } finally {
      setSaving(false)
    }
  }

  const Skeleton = () => (
    <span className="inline-block h-4 w-32 animate-pulse rounded bg-white/10 align-middle" />
  )

  return (
    <AdminLayout title="Mon compte" subtitle="Informations du compte et sécurité.">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Infos personnelles (lecture seule) */}
        <div className="rounded-3xl border border-white/10 bg-[#240400] p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-poppins text-sm font-semibold text-creme">Informations personnelles</h2>
              <p className="mt-0.5 font-poppins text-[0.72rem] text-creme/40">
                Contactez le super admin pour modifier ces informations.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 font-poppins text-[0.67rem] text-creme/40">
              Lecture seule
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="mb-1 h-3 w-16 animate-pulse rounded bg-white/10" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-white/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Prénom" value={user?.first_name} />
                <InputField label="Nom" value={user?.last_name} />
              </div>
              <InputField label="Email" value={user?.email} />
              <InputField label="Téléphone" value={user?.phone} />
            </div>
          )}
        </div>

        {/* Changement de mot de passe */}
        <div className="rounded-3xl border border-white/10 bg-[#240400] p-6">
          <h2 className="mb-5 font-poppins text-sm font-semibold text-creme">Changer le mot de passe</h2>

          <form onSubmit={handleChangePwd} className="space-y-4">
            {[
              { key: 'current', label: 'Mot de passe actuel' },
              { key: 'next',    label: 'Nouveau mot de passe' },
              { key: 'confirm', label: 'Confirmer le nouveau mot de passe' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block font-poppins text-[0.7rem] text-creme/40">{label}</label>
                <input
                  type="password"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 font-poppins text-sm text-creme outline-none focus:border-ambre transition"
                />
              </div>
            ))}

            {erreur && (
              <p className="font-poppins text-[0.78rem] text-rouge">{erreur}</p>
            )}
            {ok && (
              <p className="font-poppins text-[0.78rem] text-emerald-400">Mot de passe mis à jour.</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-rouge py-2.5 font-poppins text-sm font-semibold text-white transition hover:bg-rouge/80 disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>

      </div>
    </AdminLayout>
  )
}
