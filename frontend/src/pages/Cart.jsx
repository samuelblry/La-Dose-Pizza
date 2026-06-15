// Page panier — contenu géré localement (CartContext), pas d'API
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// Frais de livraison offerts au-dessus de ce montant
const FRAIS_LIVRAISON = 2.9
const SEUIL_OFFERT = 25

export default function Cart() {
  const { isLoggedIn } = useAuth()
  const { items, addItem, decItem, removeItem, clear, count, total } = useCart()
  const navigate = useNavigate()

  // Si pas connecté → /connexion avec état from=/commander pour revenir après login
  const handleCommander = () =>
    navigate(isLoggedIn ? '/commander' : '/connexion', { state: { from: '/commander' } })

  const livraison = total >= SEUIL_OFFERT || total === 0 ? 0 : FRAIS_LIVRAISON
  const aPayer = total + livraison
  const resteOffert = Math.max(0, SEUIL_OFFERT - total)

  return (
    <main className="min-h-screen bg-dark pb-32 lg:pb-16">
      {/* En-tête */}
      <header className="px-6 pt-24 text-center lg:pt-32">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Votre commande
        </p>
        <h1 className="font-lostar text-[2.6rem] leading-none text-rouge lg:text-[4rem]">Mon Panier</h1>
        {count > 0 && (
          <p className="mt-3 font-poppins text-[0.8rem] text-creme/50 lg:text-sm">
            {count} article{count > 1 ? 's' : ''} dans votre panier
          </p>
        )}
      </header>

      <div className="mx-auto mt-10 flex max-w-lg flex-col gap-5 px-5 lg:max-w-6xl lg:flex-row lg:items-start lg:gap-10 lg:px-8">
        {items.length === 0 ? (
          <Vide onMenu={() => navigate('/menu')} />
        ) : (
          <>
            {/* Colonne gauche : articles */}
            <div className="flex flex-col gap-5 lg:flex-1">
            {/* Liste des articles */}
            <section className="flex flex-col gap-3">
              {items.map((item) => (
                <Ligne
                  key={item.id_pizza}
                  item={item}
                  onInc={() => addItem(item)}
                  onDec={() => decItem(item.id_pizza)}
                  onRemove={() => removeItem(item.id_pizza)}
                />
              ))}
            </section>

            {/* Lien vers la carte pour ajouter d'autres pizzas */}
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center justify-center gap-2 font-poppins text-[0.76rem] text-creme/60 transition hover:text-ambre"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Ajouter d'autres pizzas
            </button>
            </div>

            {/* Colonne droite : récap + actions (sticky en desktop) */}
            <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0 lg:sticky lg:top-28">
            {/* Récapitulatif */}
            <section className="rounded-3xl border border-ambre/20 bg-gradient-to-br from-[#3a0a04] to-[#240400] p-6">
              <h2 className="font-lostar text-xl text-ambre">Récapitulatif</h2>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                <RecapRow label="Sous-total" value={`${total.toFixed(2)} €`} />
                <RecapRow
                  label="Livraison"
                  value={livraison === 0 ? 'Offerte' : `${livraison.toFixed(2)} €`}
                  highlight={livraison === 0}
                />
              </div>

              {resteOffert > 0 && (
                <p className="mt-4 rounded-2xl bg-black/20 px-4 py-3 font-poppins text-[0.74rem] text-creme/60">
                  Plus que{' '}
                  <span className="font-semibold text-ambre">{resteOffert.toFixed(2)} €</span> pour la
                  livraison offerte
                </p>
              )}

              <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
                <span className="font-poppins text-sm font-medium text-creme">Total</span>
                <span className="font-lostar text-3xl leading-none text-creme">
                  {aPayer.toFixed(2)} <span className="text-ambre">€</span>
                </span>
              </div>
            </section>

            {/* Passer la commande */}
            <button
              onClick={handleCommander}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rouge py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
            >
              {isLoggedIn ? (
                <>
                  Passer la commande
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3z" />
                  </svg>
                  Se connecter pour commander
                </>
              )}
            </button>

            {/* Vider le panier */}
            <button
              onClick={clear}
              className="flex w-full items-center justify-center gap-2 font-poppins text-[0.74rem] text-creme/40 transition hover:text-rouge"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />
              </svg>
              Vider le panier
            </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

// Une ligne du panier : visuel, nom, prix, stepper, retirer
function Ligne({ item, onInc, onDec, onRemove }) {
  const prix = Number(item.base_price)

  return (
    <article className="flex gap-4 rounded-3xl border border-white/5 bg-[#240400] p-4 lg:gap-5 lg:p-5">
      {/* Visuel carré (image ou monogramme) */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-dark lg:h-24 lg:w-24 lg:rounded-3xl">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="logo-court block h-7 w-12 opacity-20" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-poppins text-sm font-semibold text-creme lg:text-base">{item.name}</h3>
          <button
            onClick={onRemove}
            aria-label={`Retirer ${item.name}`}
            className="shrink-0 text-creme/30 transition hover:text-rouge"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <span className="mt-0.5 font-poppins text-[0.74rem] text-creme/50 lg:text-[0.8rem]">{prix.toFixed(2)} € l'unité</span>

        <div className="mt-auto flex items-center justify-between pt-3">
          {/* Stepper quantité */}
          <div className="flex items-center gap-1 rounded-full bg-rouge px-1.5 py-1">
            <button
              onClick={onDec}
              aria-label="Retirer une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-creme transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="min-w-[1.5rem] text-center font-poppins text-sm font-semibold text-creme">
              {item.qty}
            </span>
            <button
              onClick={onInc}
              aria-label="Ajouter une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-creme transition hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <span className="font-lostar text-lg text-ambre">{(prix * item.qty).toFixed(2)} €</span>
        </div>
      </div>
    </article>
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

// État vide du panier
function Vide({ onMenu }) {
  return (
    <section className="flex w-full flex-col items-center rounded-3xl border border-white/10 bg-[#240400] px-6 py-14 text-center lg:mx-auto lg:max-w-md lg:py-20">
      <span className="logo-court mb-5 block h-12 w-20 opacity-20" />
      <p className="font-poppins text-base font-medium text-creme">Votre panier est vide</p>
      <p className="mt-2 font-poppins text-[0.8rem] leading-relaxed text-creme/50">
        Parcourez la carte et ajoutez vos pizzas préférées.
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
