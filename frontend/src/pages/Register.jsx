import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRegister } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    const form = new FormData(e.target)
    try {
      await apiRegister(form.get('email'), form.get('password'), form.get('phone'))
      navigate('/connexion')
    } catch (err) {
      const msgs = Object.values(err).flat()
      setErreur(msgs[0] || 'Erreur lors de la création du compte')
    } finally {
      setChargement(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-[#2a0400] rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-lostar text-rouge text-3xl mb-6 text-center">Créer un compte</h1>

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
            minLength={6}
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Numéro de téléphone"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-rouge text-creme font-semibold rounded-lg py-3 mt-2 hover:opacity-90 transition disabled:opacity-50"
          >
            {chargement ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-creme/50 text-sm text-center mt-4">
          Déjà un compte ?{' '}
          <a href="/connexion" className="text-ambre hover:underline">Se connecter</a>
        </p>
      </div>
    </main>
  )
}
