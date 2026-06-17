import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { MEDIA_BASE } from '../services/api'

// Livraison offerte au-dessus de ce montant (cohérent avec la page panier)
const SEUIL_OFFERT = 25

export default function CartDrawer() {
  const { items, addItem, decItem, removeItem, count, total, isOpen, closeCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Bloque le scroll du fond quand le drawer est ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const resteOffert = Math.max(0, SEUIL_OFFERT - total)

  const go = (path, state) => { closeCart(); navigate(path, state) }
  const handleCommander = () =>
    go(isLoggedIn ? '/commander' : '/connexion', { state: { from: '/commander' } })

  return (
    <div className={`fixed inset-0 z-[70] ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      {/* fond cliquable */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* panneau */}
      <div
        role="dialog"
        aria-label="Mon panier"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-creme transition-transform duration-300 ease-out lg:inset-y-0 lg:left-auto lg:right-0 lg:bottom-0 lg:max-h-none lg:w-full lg:max-w-md lg:rounded-t-none lg:rounded-l-3xl ${
          isOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
        }`}
      >
        {/* en-tête */}
        <div className="flex items-center justify-between border-b border-dark/10 px-6 py-5">
          <h2 className="flex items-center gap-2.5 font-lostar text-2xl text-dark">
            Mon panier
            {count > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-rouge px-2 font-poppins text-[0.7rem] font-semibold text-creme">
                {count}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="flex h-9 w-9 items-center justify-center rounded-full text-dark/55 transition hover:bg-dark/5 hover:text-dark"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* panier vide */
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <span className="logo-court mb-5 block h-12 w-20 opacity-25" />
            <p className="font-poppins text-base font-medium text-dark">Votre panier est vide</p>
            <p className="mt-2 max-w-[240px] font-poppins text-[0.8rem] leading-relaxed text-dark/50">
              Parcourez la carte et ajoutez vos pizzas préférées.
            </p>
            <button
              onClick={() => go('/menu')}
              className="mt-6 rounded-full bg-rouge px-6 py-3 font-poppins text-[0.76rem] font-medium uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
            >
              Voir la carte
            </button>
          </div>
        ) : (
          <>
            {/* liste scrollable */}
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
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
            </div>

            {/* pied : récap + actions */}
            <div className="border-t border-dark/10 px-6 py-5">
              {resteOffert > 0 && (
                <p className="mb-4 rounded-2xl bg-ambre/15 px-4 py-3 font-poppins text-[0.74rem] text-dark/70">
                  Plus que <span className="font-semibold text-rouge">{resteOffert.toFixed(2)} €</span> pour la livraison offerte
                </p>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <span className="font-poppins text-sm text-dark/55">Sous-total</span>
                  <p className="font-poppins text-[0.68rem] text-dark/40">Livraison calculée à l'étape suivante</p>
                </div>
                <span className="font-lostar text-2xl leading-none text-rouge">{total.toFixed(2)} €</span>
              </div>

              <button
                onClick={handleCommander}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-rouge py-3.5 font-poppins text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90"
              >
                {isLoggedIn ? (
                  <>
                    Commander
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                ) : (
                  'Se connecter pour commander'
                )}
              </button>
              <button
                onClick={() => go('/panier')}
                className="mt-2.5 w-full rounded-2xl border border-dark/15 py-3 font-poppins text-[0.78rem] font-medium text-dark/65 transition hover:border-rouge hover:text-rouge"
              >
                Voir le panier
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Ligne compacte du mini-panier
function Ligne({ item, onInc, onDec, onRemove }) {
  const prix = Number(item.base_price)
  const src = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `${MEDIA_BASE}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`
    : null

  return (
    <article className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-dark/5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-creme">
        {src ? (
          <img src={src} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="logo-court block h-6 w-10 opacity-20" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-poppins text-sm font-semibold text-dark">{item.name}</h3>
          <button
            onClick={onRemove}
            aria-label={`Retirer ${item.name}`}
            className="shrink-0 text-dark/30 transition hover:text-rouge"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <span className="mt-0.5 font-poppins text-[0.72rem] text-dark/45">{prix.toFixed(2)} € l'unité</span>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 rounded-full bg-rouge px-1 py-0.5">
            <button
              onClick={onDec}
              aria-label="Retirer une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-creme transition hover:bg-white/15"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" d="M5 12h14" />
              </svg>
            </button>
            <span className="min-w-[1.4rem] text-center font-poppins text-sm font-semibold text-creme">{item.qty}</span>
            <button
              onClick={onInc}
              aria-label="Ajouter une pizza"
              className="flex h-7 w-7 items-center justify-center rounded-full text-creme transition hover:bg-white/15"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
          <span className="font-lostar text-base text-rouge">{(prix * item.qty).toFixed(2)} €</span>
        </div>
      </div>
    </article>
  )
}

function IconClose({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  )
}
