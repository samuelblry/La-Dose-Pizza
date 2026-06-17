// Page paiement Stripe — /paiement
import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../context/AuthContext'
import { apiCreatePaymentIntent } from '../services/api'

// Initialisation Stripe (clé publique)
const stripePromise = loadStripe('pk_test_51SLN3TGiZlOS2YvBEVFnSZgOds0cmvcDgbVrewNWD50Ns8mzIKocWEzPQ5oR7xYIneV7gAhj8uU0lwod3AQBFgO700keVp3YYP')

// Style de l'élément carte Stripe, adapté à la charte graphique
const CARD_STYLE = {
  style: {
    base: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '14px',
      color: '#1A0200',
      '::placeholder': { color: 'rgba(26,2,0,0.3)' },
    },
    invalid: { color: '#B43024' },
  },
}

export default function Payment() {
  const location = useLocation()
  const confirmationData = location.state?.confirmation

  // Redirige si on arrive sans avoir commandé
  if (!confirmationData) {
    return <Navigate to="/commander" replace />
  }

  return (
    <Elements stripe={stripePromise}>
      <FormulairePaiement confirmationData={confirmationData} />
    </Elements>
  )
}

function FormulairePaiement({ confirmationData }) {
  const { token } = useAuth()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  const [clientSecret, setClientSecret] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const orderId = confirmationData.id_order
  const aPayer = confirmationData.total_amount

  // Récupère le client_secret Stripe au montage
  useEffect(() => {
    apiCreatePaymentIntent(token, orderId)
      .then((data) => {
        setClientSecret(data.client_secret)
        setChargement(false)
      })
      .catch(() => {
        setErreur('Impossible de contacter le service de paiement. Réessayez.')
        setChargement(false)
      })
  }, [token, orderId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setProcessing(true)
    setErreur('')

    const cardElement = elements.getElement(CardElement)
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      setErreur(error.message || 'Le paiement a échoué.')
      setProcessing(false)
    } else if (paymentIntent.status === 'succeeded') {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <Confirmation
        data={confirmationData}
        onCompte={() => navigate('/mon-compte')}
        onMenu={() => navigate('/menu')}
      />
    )
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
        <form
          onSubmit={handleSubmit}
          className="animate-pop flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 motion-reduce:animate-none lg:p-8"
        >
          <div className="mb-2 flex items-center justify-between border-b border-dark/10 pb-5">
            <h2 className="font-poppins text-lg font-semibold text-dark">Informations de paiement</h2>
            {/* Logos cartes */}
            <div className="flex items-center gap-2 text-dark/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
              {/* Logo Stripe */}
              <svg viewBox="0 0 60 25" fill="currentColor" className="h-5 opacity-50">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.72 10.72 0 0 1-4.56.94c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.64zm-5.92-5.15c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.14c-2.18 0-3.46-.93-4.29-1.65L34.97 20H31V1.06L36.1 0l-.01 5.9c.86-.8 2.1-1.7 4.17-1.7 4.03 0 6.87 3.44 6.87 7.83 0 4.83-3.15 8.11-6.18 8.11zm-1.48-11.37c-1.15 0-1.83.42-2.31.98l.02 7.25c.46.52 1.12.96 2.29.96 1.76 0 2.96-1.9 2.96-4.6 0-2.57-1.23-4.59-2.96-4.59zM22.91 7.27V20h-5.17V7.27h5.17zM20.33 5.48C18.6 5.48 17 4.01 17 2.1 17 .37 18.6 0 20.33 0 22.06 0 23.7.37 23.7 2.1c0 1.91-1.64 3.38-3.37 3.38zm-8.4 11.01c1.09 0 2.14-.21 3.11-.64v3.74A10.55 10.55 0 0 1 11 20c-3.44 0-5.35-1.65-5.35-5.65V8.12H2.96V4.5h2.69V.72l5.14-.5V4.5h4.16v3.62h-4.16v5.79c0 1.38.66 2.04 1.94 2.04h.2z"/>
              </svg>
            </div>
          </div>

          {/* Montant à payer */}
          <div className="flex items-center justify-between rounded-2xl bg-dark/5 px-5 py-4">
            <span className="font-poppins text-sm text-dark/60">Total à payer</span>
            <span className="font-lostar text-2xl text-rouge">{aPayer} €</span>
          </div>

          {/* Zone carte Stripe */}
          <div>
            <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-dark/60">
              Carte bancaire <span className="text-rouge">*</span>
            </span>
            {chargement ? (
              <div className="flex h-12 items-center justify-center rounded-xl border border-dark/10 bg-creme/30">
                <Spinner />
                <span className="ml-2 font-poppins text-sm text-dark/40">Connexion au service de paiement…</span>
              </div>
            ) : (
              <div className="rounded-xl border border-dark/10 bg-creme/30 px-4 py-3 focus-within:border-rouge/50 focus-within:ring-2 focus-within:ring-rouge/30 transition">
                <CardElement options={CARD_STYLE} />
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {erreur && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rouge/20 bg-rouge/10 px-4 py-3 font-poppins text-[0.8rem] text-rouge"
            >
              <IconAlert />
              {erreur}
            </p>
          )}

          {/* Bandeau sécurité */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-[0.8rem] text-dark/60 font-poppins">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-emerald-600/70">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              Paiement 100% sécurisé via Stripe. Vos données bancaires ne transitent jamais par nos serveurs.
            </span>
          </div>

          <button
            type="submit"
            disabled={processing || chargement || !stripe}
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

          <p className="text-center font-poppins text-[0.7rem] text-dark/30">
            Pour tester : carte <strong>4242 4242 4242 4242</strong> · exp. future quelconque · CVC 3 chiffres
          </p>
        </form>
      </div>
    </main>
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

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

// Écran de confirmation après paiement validé
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
