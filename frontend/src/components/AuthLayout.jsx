import { useState } from 'react'

// Coquille commune aux pages Connexion / Inscription
export function AuthLayout({ surtitre, titre, sousTitre, children }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-dark px-5 py-16 lg:flex-row lg:items-stretch lg:gap-0 lg:p-0">
      {/* halos chauds décoratifs */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-rouge/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-ambre/10 blur-3xl" />
      <img
        src="/img/element/pizza_qui_vole.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-10 w-56 rotate-12 opacity-10 md:w-72 lg:hidden"
      />

      {/* panneau de marque — desktop uniquement */}
      <aside className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-[#3a0a04] to-dark px-14 lg:flex">
        <img
          src="/img/background/background_pizza_hero.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.07]"
        />
        <div className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-rouge/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark to-transparent" />
        <div className="relative max-w-md">
          <img src="/img/logo/logo_long.svg" alt="La Dose Pizza" className="w-60" />
          <p className="mt-4 font-poppins text-xs uppercase tracking-[0.3em] text-ambre">
            Finger-Licking Good
          </p>
          <p className="mt-7 max-w-sm font-poppins text-sm leading-relaxed text-creme/70">
            Des pizzas cuites au feu de bois, préparées avec des produits frais.
          </p>
          <ul className="mt-8 space-y-4">
            <Atout>Commandez en quelques clics</Atout>
            <Atout>Réservez votre table en ligne</Atout>
            <Atout>Cumulez des points de fidélité</Atout>
          </ul>
        </div>
      </aside>

      <div className="relative flex w-full max-w-md items-center justify-center lg:w-1/2 lg:max-w-none lg:px-8 lg:py-28">
        <div className="w-full max-w-md rounded-3xl border border-ambre/20 bg-gradient-to-br from-[#3a0a04] to-[#240400] p-7 shadow-2xl shadow-black/40 sm:p-9 lg:p-10">
          <header className="mb-7 text-center">
            <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
              {surtitre}
            </p>
            <h1 className="font-lostar text-[2.4rem] leading-none text-rouge">{titre}</h1>
            {sousTitre && (
              <p className="mt-3 font-poppins text-[0.82rem] text-creme/60">{sousTitre}</p>
            )}
          </header>

          {children}
        </div>
      </div>
    </main>
  )
}

// Champ texte avec label visible + icône optionnelle
export function Field({ label, icon, hint, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.78rem] font-medium text-creme/80">
        {label}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ambre/70">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border bg-dark/60 py-3 text-creme placeholder-creme/30 transition focus:outline-none focus:ring-2 focus:ring-ambre/40 ${
            icon ? 'pl-11 pr-4' : 'px-4'
          } ${error ? 'border-rouge' : 'border-creme/15 focus:border-ambre/60'}`}
        />
      </span>
      {error ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-rouge">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-creme/45">{hint}</span>
      ) : null}
    </label>
  )
}

// Champ mot de passe avec bouton afficher/masquer
export function PasswordField({ label, hint, error, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.78rem] font-medium text-creme/80">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ambre/70">
          <IconLock />
        </span>
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-xl border bg-dark/60 py-3 pl-11 pr-11 text-creme placeholder-creme/30 transition focus:outline-none focus:ring-2 focus:ring-ambre/40 ${
            error ? 'border-rouge' : 'border-creme/15 focus:border-ambre/60'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-creme/50 transition hover:text-ambre"
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </span>
      {error ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-rouge">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-creme/45">{hint}</span>
      ) : null}
    </label>
  )
}

// Bouton principal avec état de chargement
export function SubmitButton({ loading, children, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-rouge py-3 font-poppins font-semibold text-creme transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Spinner />}
      {loading ? loadingLabel : children}
    </button>
  )
}

// Bannière d'erreur globale (lisible par les lecteurs d'écran)
export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <p
      role="alert"
      aria-live="polite"
      className="mb-5 flex items-center gap-2 rounded-xl border border-rouge/40 bg-rouge/10 px-4 py-3 font-poppins text-[0.8rem] text-rouge"
    >
      <IconAlert />
      <span>{message}</span>
    </p>
  )
}

// Puce d'atout (panneau de marque desktop)
function Atout({ children }) {
  return (
    <li className="flex items-center gap-3 font-poppins text-sm text-creme/85">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ambre/15 text-ambre">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {children}
    </li>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 5L2 7" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

export { IconMail, IconPhone, IconUser }
