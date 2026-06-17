// Page panier — contenu géré localement (CartContext), pas d'API
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { MEDIA_BASE } from '../services/api'

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
    <main className="min-h-screen bg-creme pb-32 lg:pb-20">
      {/* ── Héros ── */}
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <img
          src="/img/element/scooter.png"
          alt=""
          className="pointer-events-none absolute right-4 top-1/2 hidden w-40 -translate-y-1/2 select-none opacity-80 drop-shadow-2xl lg:block xl:right-24 xl:w-52"
        />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            Votre commande · La Dose Pizza
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Mon Panier
          </h1>
          {count > 0 && (
            <p className="mx-auto mt-5 max-w-md font-poppins text-sm leading-relaxed text-creme/70 lg:mx-0">
              Vous avez {count} article{count > 1 ? 's' : ''} dans votre panier. Vérifiez votre commande avant de passer à l'étape suivante.
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-lg px-5 lg:mt-10 lg:max-w-6xl lg:px-8">
        {items.length === 0 ? (
          <Vide onMenu={() => navigate('/menu')} />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            {/* Colonne gauche : articles */}
            <div className="flex flex-col gap-6 lg:flex-1">
              {/* Liste des articles */}
              <section className="flex flex-col gap-4">
                {items.map((item) => {
                  const pid = item.id_pizza ?? item.id
                  return (
                    <Ligne
                      key={pid}
                      item={item}
                      onInc={() => addItem(item)}
                      onDec={() => decItem(pid)}
                      onRemove={() => removeItem(pid)}
                    />
                  )
                })}
              </section>

              {/* Lien vers la carte pour ajouter d'autres pizzas */}
              <button
                onClick={() => navigate('/menu')}
                className="mx-auto mt-2 flex items-center justify-center gap-2 font-poppins text-[0.76rem] text-dark/50 transition hover:text-rouge lg:mx-0 lg:justify-start"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Ajouter d'autres pizzas
              </button>
            </div>

            {/* Colonne droite : récap + actions (sticky en desktop) */}
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
                  <div className="space-y-3">
                    <RecapRow label="Sous-total" value={`${total.toFixed(2)} €`} />
                    <RecapRow
                      label="Livraison"
                      value={livraison === 0 ? 'Offerte' : `${livraison.toFixed(2)} €`}
                      highlight={livraison === 0}
                    />
                  </div>

                  {resteOffert > 0 && (
                    <div className="mt-4 rounded-xl bg-ambre/10 px-4 py-3 text-center">
                      <p className="font-poppins text-[0.74rem] text-dark/70">
                        Plus que <span className="font-semibold text-ambre">{resteOffert.toFixed(2)} €</span> pour la livraison offerte
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex items-end justify-between border-t border-dashed border-dark/10 pt-5">
                    <span className="font-poppins text-sm font-medium text-dark/60">Total à payer</span>
                    <span className="font-lostar text-3xl leading-none text-rouge">
                      {aPayer.toFixed(2)} <span className="text-dark">€</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Passer la commande */}
              <button
                onClick={handleCommander}
                className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-rouge px-6 py-4 font-poppins text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90"
              >
                {isLoggedIn ? (
                  <>
                    Commander
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3z" />
                    </svg>
                    Connexion requise
                  </>
                )}
              </button>

              {/* Vider le panier */}
              <button
                onClick={clear}
                className="mt-2 flex w-full items-center justify-center gap-2 font-poppins text-[0.74rem] text-dark/40 underline-offset-4 transition hover:text-rouge hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />
                </svg>
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Une ligne du panier : visuel, nom, prix, stepper, retirer
function Ligne({ item, onInc, onDec, onRemove }) {
  const prix = Number(item.base_price)

  return (
    <article className="flex gap-4 rounded-3xl bg-white p-4 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.15)] ring-1 ring-dark/5 lg:gap-5 lg:p-5">
      {/* Visuel carré */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-creme/50 lg:h-24 lg:w-24 lg:rounded-3xl">
        {item.image_url ? (
          <img 
            src={item.image_url.startsWith('http') ? item.image_url : `${MEDIA_BASE}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`} 
            alt={item.name} 
            loading="lazy" 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="logo-court block h-7 w-12 opacity-20" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-lostar text-lg text-dark lg:text-xl">{item.name}</h3>
          <button
            onClick={onRemove}
            aria-label={`Retirer ${item.name}`}
            className="shrink-0 text-dark/30 transition hover:text-rouge"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <span className="mt-0.5 font-poppins text-[0.74rem] text-dark/50 lg:text-[0.8rem]">{prix.toFixed(2)} € l'unité</span>

        <div className="mt-auto flex items-center justify-between pt-3">
          {/* Stepper quantité */}
          <div className="flex items-center gap-1 rounded-full border border-dark/10 bg-creme/30 px-1.5 py-1">
            <button
              onClick={onDec}
              aria-label="Retirer une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-dark/60 transition hover:bg-dark/5 hover:text-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="min-w-[1.5rem] text-center font-poppins text-sm font-semibold text-dark">
              {item.qty}
            </span>
            <button
              onClick={onInc}
              aria-label="Ajouter une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-dark/60 transition hover:bg-dark/5 hover:text-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <span className="font-lostar text-lg text-rouge">{(prix * item.qty).toFixed(2)} €</span>
        </div>
      </div>
    </article>
  )
}

function RecapRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between font-poppins text-sm">
      <span className="text-dark/50">{label}</span>
      <span className={highlight ? 'font-semibold text-ambre' : 'font-medium text-dark'}>{value}</span>
    </div>
  )
}

// État vide du panier
function Vide({ onMenu }) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-2xl border border-dashed border-dark/15 bg-creme/40 px-6 py-14 text-center lg:mx-auto lg:max-w-md lg:py-20">
      <span className="logo-court mb-5 block h-12 w-20 opacity-20" />
      <p className="font-poppins text-base font-medium text-dark">Votre panier est vide</p>
      <p className="font-poppins text-[0.8rem] leading-relaxed text-dark/50">
        Parcourez la carte et ajoutez vos pizzas préférées.
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
