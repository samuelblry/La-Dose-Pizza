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
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [usePoints, setUsePoints] = useState(0)

  // Pré-remplit l'adresse de livraison avec celle du compte
  useEffect(() => {
    let actif = true
    apiMe(token)
      .then((me) => {
        if (actif && me) {
          if (me.address) {
            setAdresse({
              street: me.address.street || '',
              zip_code: me.address.zip_code || '',
              city: me.address.city || '',
            })
          }
          setLoyaltyPoints(me.loyalty_points || 0)
        }
      })
      .catch(() => {})
    return () => {
      actif = false
    }
  }, [token])

  const livraison = orderType === 'sur_place' || total >= SEUIL_OFFERT ? 0 : FRAIS_LIVRAISON
  const maxPointsPossible = Math.floor((total + livraison) / 0.10)
  const allowedPoints = Math.min(loyaltyPoints, maxPointsPossible)
  const actualUsedPoints = Math.min(usePoints, allowedPoints)
  const discount = actualUsedPoints * 0.10
  const aPayer = total + livraison - discount

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
        use_points: actualUsedPoints,
        delivery_fee: livraison,
        items: items.map((i) => ({ id_pizza: i.id_pizza ?? i.id, quantity: i.qty })),
      })
      clear()
      navigate('/paiement', { state: { confirmation: data } })
    } catch (err) {
      setErreur(err?.error || err?.detail || 'La commande n\'a pas pu être validée.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-creme pb-32 lg:pb-20">
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            Dernière étape · La Dose Pizza
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Commander
          </h1>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-lg px-5 lg:mt-10 lg:max-w-6xl lg:px-8">
        {count === 0 ? (
          <Vide onMenu={() => navigate('/menu')} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Colonne gauche : mode + adresse */}
            <div className="flex min-w-0 flex-col gap-6 lg:flex-1">
              {erreur && (
                <p
                  role="alert"
                  className="flex items-center gap-2 rounded-2xl border border-rouge/20 bg-rouge/10 px-5 py-4 font-poppins text-[0.8rem] text-rouge shadow-sm"
                >
                  <IconAlert />
                  {erreur}
                </p>
              )}

              {/* Choix du mode de commande */}
              <section className="rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rouge/10 text-rouge font-semibold font-poppins text-xs">1</div>
                  <h2 className="font-poppins text-base font-semibold text-dark">Mode de commande</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                <section className="animate-pop rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 motion-reduce:animate-none">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rouge/10 text-rouge font-semibold font-poppins text-xs">2</div>
                    <h2 className="font-poppins text-base font-semibold text-dark">Adresse de livraison</h2>
                  </div>
                  <div className="space-y-4">
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

              {/* Points de fidélité */}
              {loyaltyPoints > 0 && (
                <section className="animate-pop rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 motion-reduce:animate-none">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ambre/20 text-ambre-600 font-semibold font-poppins text-xs">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <h2 className="font-poppins text-base font-semibold text-dark">Vos points de fidélité</h2>
                  </div>
                  <p className="mt-2 font-poppins text-[0.8rem] text-dark/60">
                    Vous avez <strong className="text-rouge">{loyaltyPoints} points</strong> (soit {(loyaltyPoints * 0.10).toFixed(2)} €).
                  </p>
                  <div className="mt-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={usePoints > 0}
                        onChange={(e) => setUsePoints(e.target.checked ? allowedPoints : 0)}
                        className="h-5 w-5 rounded border-dark/20 bg-creme/50 text-rouge focus:ring-rouge"
                      />
                      <span className="font-poppins text-[0.85rem] text-dark">
                        Utiliser pour cette commande (-{(allowedPoints * 0.10).toFixed(2)} €)
                      </span>
                    </label>
                  </div>
                </section>
              )}
            </div>

            {/* Colonne droite : récap + validation (sticky en desktop) */}
            <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0 lg:sticky lg:top-28">
              {/* Récapitulatif ticket */}
              <div className="overflow-hidden rounded-2xl border border-dark/10 bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.2)]">
                <div className="flex items-center gap-2 bg-rouge px-5 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-creme">
                    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
                    <path d="M13 5v2M13 17v2M13 11v2" />
                  </svg>
                  <p className="font-poppins text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-creme">Récapitulatif</p>
                </div>
                
                <div className="px-5 py-5">
                  <ul className="space-y-3 mb-5 border-b border-dashed border-dark/10 pb-5">
                    {items.map((item) => (
                      <li key={item.id_pizza} className="flex items-start justify-between font-poppins text-sm gap-2">
                        <span className="text-dark/70 truncate flex-1">
                          <span className="text-rouge font-medium">{item.qty}×</span> {item.name}
                        </span>
                        <span className="text-dark font-medium shrink-0">{(Number(item.base_price) * item.qty).toFixed(2)} €</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    <RecapRow label="Sous-total" value={`${total.toFixed(2)} €`} />
                    <RecapRow
                      label="Livraison"
                      value={livraison === 0 ? 'Offerte' : `${livraison.toFixed(2)} €`}
                      highlight={livraison === 0}
                    />
                    {actualUsedPoints > 0 && (
                      <RecapRow
                        label={`Fidélité (${actualUsedPoints} pts)`}
                        value={`-${discount.toFixed(2)} €`}
                        highlight={true}
                        isDiscount={true}
                      />
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-dashed border-dark/10 pt-5">
                    <span className="font-poppins text-sm font-medium text-dark/60">Total à payer</span>
                    <span className="font-lostar text-3xl leading-none text-rouge">
                      {aPayer.toFixed(2)} <span className="text-dark">€</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-rouge px-6 py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Spinner />
                    Validation…
                  </>
                ) : (
                  <>
                    Payer {aPayer.toFixed(2)} €
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/panier')}
                className="mt-2 flex w-full items-center justify-center gap-2 font-poppins text-[0.74rem] text-dark/40 underline-offset-4 transition hover:text-rouge hover:underline"
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
        active ? 'border-rouge bg-rouge/5' : 'border-dark/10 bg-creme/30 hover:border-dark/20'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={`h-7 w-7 ${active ? 'text-rouge' : 'text-dark/40'}`}>
        {icon}
      </svg>
      <span className={`font-poppins text-sm font-semibold ${active ? 'text-dark' : 'text-dark/70'}`}>{label}</span>
      <span className="font-poppins text-[0.68rem] text-dark/40">{desc}</span>
    </button>
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

function RecapRow({ label, value, highlight, isDiscount }) {
  return (
    <div className="flex items-center justify-between font-poppins text-sm">
      <span className="text-dark/50">{label}</span>
      <span className={highlight ? (isDiscount ? 'font-semibold text-rouge' : 'font-semibold text-ambre') : 'font-medium text-dark'}>{value}</span>
    </div>
  )
}

// Panier vide → on ne peut pas commander
function Vide({ onMenu }) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-dark/15 bg-creme/40 px-6 py-14 text-center lg:mx-auto lg:max-w-md lg:py-20">
      <span className="logo-court mb-5 block h-12 w-20 opacity-20" />
      <p className="font-poppins text-base font-medium text-dark">Votre panier est vide</p>
      <p className="font-poppins text-[0.8rem] leading-relaxed text-dark/50">
        Ajoutez des pizzas avant de passer commande.
      </p>
      <button
        onClick={onMenu}
        className="mt-4 rounded-full bg-rouge px-6 py-3.5 font-poppins text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90"
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
