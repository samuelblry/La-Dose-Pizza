import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const confirmationData = location.state?.confirmation

  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })

  // Si on accède à /paiement sans avoir passé de commande
  if (!confirmationData) {
    return <Navigate to="/commander" replace />
  }

  const aPayer = confirmationData.total_amount

  const handleSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    
    // Simulation Stripe
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
    }, 2000)
  }

  const champ = (e) => setCard((c) => ({ ...c, [e.target.name]: e.target.value }))

  if (success) {
    return <Confirmation data={confirmationData} onCompte={() => navigate('/mon-compte')} onMenu={() => navigate('/menu')} />
  }

  return (
    <main className="min-h-screen bg-creme pb-32 lg:pb-20">
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            Étape finale · La Dose Pizza
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Paiement sécurisé
          </h1>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-lg px-5 lg:mt-10 lg:max-w-2xl lg:px-8">
        <form onSubmit={handleSubmit} className="animate-pop flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 motion-reduce:animate-none lg:p-8">
          
          <div className="mb-2 flex items-center justify-between border-b border-dark/10 pb-5">
            <h2 className="font-poppins text-lg font-semibold text-dark">Détails de la carte</h2>
            <div className="flex gap-2 text-dark/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            </div>
          </div>

          <div className="space-y-4">
            <Field
              label="Titulaire de la carte"
              name="name"
              value={card.name}
              onChange={champ}
              placeholder="Ex: Jean Dupont"
              required
            />
            
            <Field
              label="Numéro de carte"
              name="number"
              value={card.number}
              onChange={champ}
              placeholder="0000 0000 0000 0000"
              maxLength="19"
              inputMode="numeric"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Date d'expiration"
                name="expiry"
                value={card.expiry}
                onChange={champ}
                placeholder="MM/AA"
                maxLength="5"
                required
              />
              <Field
                label="CVC"
                name="cvc"
                value={card.cvc}
                onChange={champ}
                placeholder="123"
                maxLength="3"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-[0.8rem] text-dark/60 font-poppins">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-emerald-600/70">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              Paiement 100% sécurisé. Vos informations bancaires sont chiffrées de bout en bout.
            </span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-rouge px-6 py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? (
              <>
                <Spinner />
                Traitement…
              </>
            ) : (
              <>
                Payer {aPayer} €
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-dark/60">
        {label}
        {props.required && <span className="text-rouge"> *</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-dark/10 bg-creme/30 px-4 py-3 font-poppins text-sm text-dark placeholder-dark/30 focus:border-rouge/50 focus:outline-none focus:ring-2 focus:ring-rouge/30"
      />
    </label>
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

// Écran de confirmation après commande validée
function Confirmation({ data, onCompte, onMenu }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-creme px-6 pb-20 pt-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-emerald-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="mt-6 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-dark/50">Paiement validé</p>
      <h1 className="mt-2 font-lostar text-[2.4rem] leading-none text-dark">Merci !</h1>
      <p className="mt-3 max-w-xs font-poppins text-[0.84rem] text-dark/60">
        Votre commande est bien enregistrée et payée. Vous pouvez suivre son avancement depuis votre compte.
      </p>

      <div className="mt-7 w-full max-w-xs rounded-3xl border border-dark/10 bg-white p-5 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)]">
        <div className="flex items-center justify-between font-poppins text-sm">
          <span className="text-dark/50">N° de facture</span>
          <span className="font-semibold text-dark">#{data.invoice_number}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-dark/10 pt-3 font-poppins text-sm">
          <span className="text-dark/50">Total payé</span>
          <span className="font-poppins text-base font-semibold text-rouge">{data.total_amount} €</span>
        </div>
      </div>

      <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onCompte}
          className="rounded-2xl bg-rouge py-3.5 font-poppins text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90"
        >
          Suivre ma commande
        </button>
        <button
          onClick={onMenu}
          className="rounded-2xl border border-dark/15 py-3.5 font-poppins text-[0.78rem] text-dark/70 transition hover:border-dark hover:text-dark hover:bg-dark/5"
        >
          Retour à la carte
        </button>
      </div>
    </main>
  )
}
