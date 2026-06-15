import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiLogin } from '../services/api'
import { AuthLayout, Field, PasswordField, SubmitButton, ErrorBanner, IconMail } from '../components/AuthLayout'

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
    <AuthLayout
      surtitre="Espace client"
      titre="Connexion"
      sousTitre="Ravi de vous revoir chez La Dose Pizza"
    >
      <ErrorBanner message={erreur} />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field
          label="Adresse e-mail"
          icon={<IconMail />}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          required
        />
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        <SubmitButton loading={chargement} loadingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>

      <p className="mt-6 text-center font-poppins text-[0.82rem] text-creme/50">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-medium text-ambre hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  )
}
