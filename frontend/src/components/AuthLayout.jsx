import { useState } from 'react'

// Coquille commune aux pages Connexion / Inscription
export function AuthLayout({ surtitre, titre, sousTitre, children }) {
  return (
    <main className="min-h-screen bg-creme pb-32 lg:pb-20">
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-center">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            {surtitre}
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            {titre}
          </h1>
          {sousTitre && (
            <p className="mx-auto mt-4 max-w-md font-poppins text-[0.85rem] text-creme/60 lg:text-base">
              {sousTitre}
            </p>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto -mt-8 max-w-md px-5 lg:-mt-12 lg:max-w-lg">
        <div className="rounded-3xl bg-white p-7 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 sm:p-9 lg:p-10">
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
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-dark/60">
        {label}
        {props.required && <span className="text-rouge"> *</span>}
      </span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark/40">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border bg-creme/30 py-3 text-dark placeholder-dark/30 transition focus:outline-none focus:ring-2 focus:ring-rouge/30 ${
            icon ? 'pl-12 pr-4' : 'px-4'
          } ${error ? 'border-rouge/50' : 'border-dark/10 focus:border-rouge/50'}`}
        />
      </span>
      {error ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-rouge">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-dark/40">{hint}</span>
      ) : null}
    </label>
  )
}

// Champ mot de passe avec bouton afficher/masquer
export function PasswordField({ label, hint, error, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-dark/60">
        {label}
        {props.required && <span className="text-rouge"> *</span>}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark/40">
          <IconLock />
        </span>
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-xl border bg-creme/30 py-3 pl-12 pr-12 text-dark placeholder-dark/30 transition focus:outline-none focus:ring-2 focus:ring-rouge/30 ${
            error ? 'border-rouge/50' : 'border-dark/10 focus:border-rouge/50'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-dark/40 transition hover:text-dark/70"
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </span>
      {error ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-rouge">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block font-poppins text-[0.74rem] text-dark/40">{hint}</span>
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
      className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-rouge px-6 py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
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
      className="mb-6 flex items-center gap-2 rounded-2xl border border-rouge/20 bg-rouge/10 px-5 py-4 font-poppins text-[0.8rem] text-rouge shadow-sm"
    >
      <IconAlert />
      <span>{message}</span>
    </p>
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
