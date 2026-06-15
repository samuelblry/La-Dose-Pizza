// Page finalisation commande — POST /api/orders/
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiMe, apiCreateOrder } from '../services/api'

const FRAIS_LIVRAISON = 2.9
const SEUIL_OFFERT = 25

export default function Checkout() {
  const { token } = useAuth()
  const { items, total, count, clear } = useCart()
  const navigate = useNavigate()

  const [orderType, setOrderType] = useState('livraison')
  const [adresse, setAdresse] = useState({ street: '', zip_code: '', city: '' })
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  // Pré-remplit l'adresse de livraison avec celle du compte
  useEffect(() => {
    let actif = true
    apiMe(token)
      .then((me) => {
        if (actif && me.address) {
          setAdresse({
            street: me.address.street || '',
            zip_code: me.address.zip_code || '',
            city: me.address.city || '',
          })
        }
      })
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [token])

  const livraison = orderType === 'sur_place' || total >= SEUIL_OFFERT ? 0 : FRAIS_LIVRAISON
  const aPayer = total + livraison

  const champ = (e) => setAdresse((a) => ({ ...a, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    if (orderType === 'livraison' && (!adresse.street || !adresse.zip_code || !adresse.city)) {
      return setErreur('Merci de renseigner votre adresse de livraison.')
    }
    setSaving(true)
    try {
      const data = await apiCreateOrder(token, {
        street: adresse.street,
        zip_code: adresse.zip_code,
        city: adresse.city,
        order_type: orderType,
        items: items.map((i) => ({ id_pizza: i.id_pizza, quantity: i.qty })),
      })
      clear()
      setConfirmation(data)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'La commande n\'a pas pu être validée.')
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return <Confirmation data={confirmation} onCompte={() => navigate('/mon-compte')} onMenu={() => navigate('/menu')} />
  }

  return (
    <main className="min-h-screen bg-dark pb-32">
      <header className="px-6 pt-24 text-center">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Dernière étape
        </p>
        <h1 className="font-lostar text-[2.6rem] leading-none text-rouge">Commander</h1>
      </header>

      <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5 px-5 lg:max-w-5xl">
        {count === 0 ? (
          <Vide onMenu={() => navigate('/menu')} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-start lg:gap-10">
            {erreur && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-rouge/40 bg-rouge/10 px-4 py-3 font-poppins text-[0.8rem] text-rouge lg:w-full"
              >
                <IconAlert />
                {erreur}
              </p>
            )}

            {/* Colonne gauche : mode + adresse */}
            <div className="flex min-w-0 flex-col gap-5 lg:flex-1">
            {/* Choix du mode de commande */}
            <section className="rounded-3xl border border-white/10 bg-[#240400] p-6">
              <h2 className="font-poppins text-base font-semibold text-ambre">Mode de commande</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ModeBtn
                  active={orderType === 'livraison'}
                  onClick={() => setOrderType('livraison')}
                  label="Livraison"
                  desc="Chez vous"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3 9h11v8H3zM14 12h4l3 3v2h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z" />}
                />
                <ModeBtn
                  active={orderType === 'sur_place'}
                  onClick={() => setOrderType('sur_place')}
                  label="Sur place"
                  desc="À emporter"
                  icon={<path strokeLinecap="round" strokeLinejoin="round" d="M4 21V10l8-6 8 6v11M9 21v-6h6v6" />}
                />
              </div>
            </section>

            {/* Adresse de livraison (uniquement si livraison) */}
            {orderType === 'livraison' && (
              <section className="animate-pop rounded-3xl border border-white/10 bg-[#240400] p-6 motion-reduce:animate-none">
                <h2 className="font-poppins text-base font-semibold text-ambre">Adresse de livraison</h2>
                <div className="mt-4 space-y-4">
                  <Field
                    label="Adresse"
                    name="street"
                    value={adresse.street}
                    onChange={champ}
                    placeholder="12 rue de la Pizza"
                    autoComplete="street-address"
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      label="Code postal"
                      name="zip_code"
                      value={adresse.zip_code}
                      onChange={champ}
                      placeholder="75011"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      required
                    />
                    <div className="col-span-2">
                      <Field
                        label="Ville"
                        name="city"
                        value={adresse.city}
                        onChange={champ}
                        placeholder="Paris"
                        autoComplete="address-level2"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}
            </div>

            {/* Colonne droite : récap + validation (sticky en desktop) */}
            <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0 lg:sticky lg:top-28">
            {/* Récapitulatif de la commande */}
            <section className="rounded-3xl border border-ambre/20 bg-gradient-to-br from-[#3a0a04] to-[#240400] p-6">
              <h2 className="font-poppins text-base font-semibold text-ambre">Votre commande</h2>

              <ul className="mt-5 space-y-3 border-t border-white/10 pt-5">
                {items.map((item) => (
                  <li key={item.id_pizza} className="flex items-center justify-between font-poppins text-sm">
                    <span className="text-creme/70">
                      <span className="text-ambre">{item.qty}×</span> {item.name}
                    </span>
                    <span className="text-creme">{(Number(item.base_price) * item.qty).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                <RecapRow label="Sous-total" value={`${total.toFixed(2)} €`} />
                <RecapRow
                  label="Livraison"
                  value={livraison === 0 ? 'Offerte' : `${livraison.toFixed(2)} €`}
                  highlight={livraison === 0}
                />
              </div>

              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
                <span className="font-poppins text-sm font-medium text-creme">Total</span>
                <span className="font-lostar text-3xl leading-none text-creme">
                  {aPayer.toFixed(2)} <span className="text-ambre">€</span>
                </span>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rouge py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner />
                  Validation…
                </>
              ) : (
                <>
                  Confirmer la commande
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/panier')}
              className="flex w-full items-center justify-center gap-2 font-poppins text-[0.74rem] text-creme/50 transition hover:text-ambre"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6-6l-6 6 6 6" />
              </svg>
              Retour au panier
            </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

// Bouton de sélection du mode de commande
function ModeBtn({ active, onClick, label, desc, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 rounded-2xl border py-5 transition ${
        active ? 'border-ambre bg-rouge/10' : 'border-white/10 bg-dark hover:border-white/25'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={`h-7 w-7 ${active ? 'text-ambre' : 'text-creme/50'}`}>
        {icon}
      </svg>
      <span className={`font-poppins text-sm font-semibold ${active ? 'text-creme' : 'text-creme/70'}`}>{label}</span>
      <span className="font-poppins text-[0.68rem] text-creme/40">{desc}</span>
    </button>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-creme/50">
        {label}
        {props.required && <span className="text-rouge"> *</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 font-poppins text-sm text-creme placeholder-creme/30 focus:border-ambre/50 focus:outline-none focus:ring-2 focus:ring-ambre/30"
      />
    </label>
  )
}

function RecapRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between font-poppins text-sm">
      <span className="text-creme/60">{label}</span>
      <span className={highlight ? 'font-semibold text-ambre' : 'text-creme'}>{value}</span>
    </div>
  )
}

// Écran de confirmation après commande validée
function Confirmation({ data, onCompte, onMenu }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark px-6 pb-20 pt-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="mt-6 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">Commande confirmée</p>
      <h1 className="mt-2 font-lostar text-[2.4rem] leading-none text-creme">Merci !</h1>
      <p className="mt-3 max-w-xs font-poppins text-[0.84rem] text-creme/60">
        Votre commande est bien enregistrée. Vous pouvez suivre son avancement depuis votre compte.
      </p>

      <div className="mt-7 w-full max-w-xs rounded-3xl border border-ambre/20 bg-[#240400] p-5">
        <div className="flex items-center justify-between font-poppins text-sm">
          <span className="text-creme/50">N° de facture</span>
          <span className="font-semibold text-creme">#{data.invoice_number}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-poppins text-sm">
          <span className="text-creme/50">Total payé</span>
          <span className="font-poppins text-base font-semibold text-ambre">{data.total_amount} €</span>
        </div>
      </div>

      <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onCompte}
          className="rounded-2xl bg-rouge py-3.5 font-poppins text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
        >
          Suivre ma commande
        </button>
        <button
          onClick={onMenu}
          className="rounded-2xl border border-white/15 py-3.5 font-poppins text-[0.78rem] text-creme/70 transition hover:border-creme hover:text-creme"
        >
          Retour à la carte
        </button>
      </div>
    </main>
  )
}

// Panier vide → on ne peut pas commander
function Vide({ onMenu }) {
  return (
    <section className="flex w-full flex-col items-center rounded-3xl border border-white/10 bg-[#240400] px-6 py-14 text-center lg:mx-auto lg:max-w-md lg:py-20">
      <span className="logo-court mb-5 block h-12 w-20 opacity-20" />
      <p className="font-poppins text-base font-medium text-creme">Votre panier est vide</p>
      <p className="mt-2 font-poppins text-[0.8rem] leading-relaxed text-creme/50">
        Ajoutez des pizzas avant de passer commande.
      </p>
      <button
        onClick={onMenu}
        className="mt-6 rounded-full bg-rouge px-6 py-3 font-poppins text-[0.76rem] font-medium uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
      >
        Voir la carte
      </button>
    </section>
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
