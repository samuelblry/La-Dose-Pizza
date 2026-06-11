// Page connexion — POST /api/auth/login/
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Redirige vers la page voulue après login (ex: /commander, /reservation)
  const redirectTo = location.state?.from || '/'

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO William : appel POST /api/auth/login/ → récupérer le token puis :
    // login(token)
    // navigate(redirectTo)
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-[#2a0400] rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-lostar text-rouge text-3xl mb-6 text-center">Connexion</h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* envoyé comme "email" → vérifié dans user_account */}
          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />

          {/* envoyé comme "password" → comparé au password_hash */}
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />

          {/* POST /api/auth/login/ → retourne token + is_admin pour redirection */}
          <button
            type="submit"
            className="w-full bg-rouge text-creme font-semibold rounded-lg py-3 mt-2 hover:opacity-90 transition"
          >
            Se connecter
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
