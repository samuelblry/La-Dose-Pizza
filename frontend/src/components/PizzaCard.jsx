import { useCart } from '../context/CartContext'
import { MEDIA_BASE } from '../services/api'

export default function PizzaCard({ pizza }) {
  const { items, addItem, decItem, openCart } = useCart()
  const dispo = pizza.is_available
  const pid = pizza.id ?? pizza.id_pizza
  // image_url est un chemin relatif Django (ex: "media/pizzas/xxx.jpg")
  const image = pizza.image_url ? `${MEDIA_BASE}/${pizza.image_url}` : null
  const qty = items.find((i) => i.id_pizza === pid)?.qty || 0

  // Ajoute au panier et ouvre le mini-panier
  const handleAdd = () => { addItem(pizza); openCart() }

  const ingredients = Array.isArray(pizza.ingredients) ? pizza.ingredients : []
  const allergens = Array.isArray(pizza.allergens) ? pizza.allergens : []

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-dark/5 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.3)] transition duration-300 ${
        dispo ? 'hover:-translate-y-1 hover:shadow-[0_14px_40px_-16px_rgba(26,2,0,0.45)]' : 'opacity-70'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-creme">
        {image ? (
          <img
            src={image}
            alt={pizza.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="logo-court block h-12 w-20 opacity-20" />
          </div>
        )}

        {!dispo && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/55 backdrop-blur-[2px]">
            <span className="rounded-full border border-creme/40 px-4 py-1 font-poppins text-[0.62rem] uppercase tracking-[0.2em] text-creme">
              Indisponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 lg:p-5">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="font-poppins text-[0.95rem] font-semibold leading-tight text-dark">{pizza.name}</h3>
          <span className="shrink-0 font-poppins text-base font-bold tabular-nums text-rouge">
            {Number(pizza.base_price).toFixed(2)} €
          </span>
        </div>

        {/* vrais ingrédients plutôt qu'une description générique */}
        <p className="mt-1.5 line-clamp-2 min-h-[2.4em] font-poppins text-[0.74rem] leading-relaxed text-dark/55">
          {ingredients.length > 0
            ? ingredients.map((i) => i.name).join(' · ')
            : pizza.description || 'Pizza artisanale cuite au feu de bois.'}
        </p>

        {allergens.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 font-poppins text-[0.6rem] uppercase tracking-[0.08em] text-dark/40">
            <IconAllergen className="h-3 w-3 shrink-0 text-ambre" />
            {allergens.join(', ')}
          </p>
        )}

        <div className="mt-auto pt-4">
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!dispo}
              className="flex h-11 w-full animate-pop items-center justify-center gap-2 rounded-full bg-rouge font-poppins text-[0.78rem] font-medium uppercase tracking-[0.12em] text-creme transition hover:bg-rouge/90 motion-reduce:animate-none disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-dark/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Ajouter
            </button>
          ) : (
            <div className="flex h-11 w-full animate-pop items-center justify-between rounded-full bg-rouge px-1.5 motion-reduce:animate-none">
              <button
                onClick={() => decItem(pid)}
                aria-label="Retirer une pizza"
                className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/15"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="font-poppins text-sm font-semibold text-creme">{qty}</span>
              <button
                onClick={handleAdd}
                aria-label="Ajouter une pizza"
                className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/15"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// petit picto épi de blé pour les allergènes
function IconAllergen({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22V8M12 8c0-2-1.5-4-4-4 0 2 1.5 4 4 4zM12 8c0-2 1.5-4 4-4 0 2-1.5 4-4 4z" />
      <path d="M12 14c0-2-1.5-3.5-4-3.5 0 2 1.5 3.5 4 3.5zM12 14c0-2 1.5-3.5 4-3.5 0 2-1.5 3.5-4 3.5z" />
    </svg>
  )
}
