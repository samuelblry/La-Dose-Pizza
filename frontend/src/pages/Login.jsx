import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiLogin } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    const form = new FormData(e.target)
    try {
      const data = await apiLogin(form.get('email'), form.get('password'))
      login(data.token, data.refresh, data.is_admin)
      navigate(data.is_admin ? '/admin' : redirectTo)
    } catch (err) {
      setErreur(err?.error || 'Identifiants incorrects')
    } finally {
      setChargement(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-[#2a0400] rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-lostar text-rouge text-3xl mb-6 text-center">Connexion</h1>

        {erreur && (
          <p className="text-red-400 text-sm text-center mb-4">{erreur}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            required
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            required
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-rouge text-creme font-semibold rounded-lg py-3 mt-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {chargement ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-creme/50 text-sm text-center mt-4">
          Pas encore de compte ?{' '}
          <a href="/inscription" className="text-ambre hover:underline">S'inscrire</a>
        </p>
      </div>
    </main>
  )
}
