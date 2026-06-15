import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRegister } from '../services/api'
import { AuthLayout, Field, PasswordField, SubmitButton, ErrorBanner, IconMail, IconPhone, IconUser } from '../components/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [erreur, setErreur] = useState('')
  const [erreurMdp, setErreurMdp] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    setErreurMdp('')
    const form = new FormData(e.target)
    const password = form.get('password')

    if (password.length < 6) {
      setErreurMdp('6 caractères minimum')
      return
    }
    if (password !== form.get('confirm')) {
      setErreurMdp('Les mots de passe ne correspondent pas')
      return
    }

    setChargement(true)
    try {
      await apiRegister({
        email: form.get('email'),
        password,
        phone: form.get('phone'),
        first_name: form.get('first_name'),
        last_name: form.get('last_name'),
      })
      navigate('/connexion')
    } catch (err) {
      const msgs = Object.values(err).flat()
      setErreur(msgs[0] || 'Erreur lors de la création du compte')
    } finally {
      setChargement(false)
    }
  }

  return (
    <AuthLayout
      surtitre="Bienvenue"
      titre="Créer un compte"
      sousTitre="Commandez, réservez et cumulez des points de fidélité"
    >
      <ErrorBanner message={erreur} />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Prénom"
            icon={<IconUser />}
            type="text"
            name="first_name"
            autoComplete="given-name"
            placeholder="Lucas"
            required
          />
          <Field
            label="Nom"
            type="text"
            name="last_name"
            autoComplete="family-name"
            placeholder="Martin"
            required
          />
        </div>
        <Field
          label="Adresse e-mail"
          icon={<IconMail />}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          required
        />
        <Field
          label="Téléphone"
          icon={<IconPhone />}
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          hint="Pour vous prévenir lors des livraisons"
        />
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={6}
          required
          error={erreurMdp}
          hint={erreurMdp ? '' : '6 caractères minimum'}
        />
        <PasswordField
          label="Confirmer le mot de passe"
          name="confirm"
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

        <SubmitButton loading={chargement} loadingLabel="Création…">
          Créer mon compte
        </SubmitButton>
      </form>

      <p className="mt-6 text-center font-poppins text-[0.82rem] text-creme/50">
        Déjà un compte ?{' '}
        <Link to="/connexion" className="font-medium text-ambre hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}
