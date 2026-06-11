// Page inscription — POST /api/auth/register/
export default function Register() {
  return (
    <main className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="bg-[#2a0400] rounded-2xl p-8 w-full max-w-md">
        <h1 className="font-lostar text-rouge text-3xl mb-6 text-center">Créer un compte</h1>

        <form className="flex flex-col gap-4">
          {/* "email" → stocké dans user_account.email (unique) */}
          <input
            type="email"
            name="email"
            placeholder="Adresse e-mail"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />

          {/* "password" → hashé côté back avant stockage dans password_hash */}
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />

          {/* "phone" → stocké dans user_account.phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Numéro de téléphone"
            className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />

          {/* POST /api/auth/register/ → crée user_account + loyalty_points=0 + is_admin=false */}
          <button
            type="submit"
            className="w-full bg-rouge text-creme font-semibold rounded-lg py-3 mt-2 hover:opacity-90 transition"
          >
            Créer mon compte
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
