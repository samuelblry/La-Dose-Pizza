import { useCart } from '../context/CartContext'

export default function PizzaCard({ pizza }) {
  const { items, addItem, decItem } = useCart()
  const dispo = pizza.is_available
  const qty = items.find((i) => i.id_pizza === pizza.id_pizza)?.qty || 0

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#240400] transition-transform duration-300 ${
        dispo ? 'hover:-translate-y-1' : 'opacity-60'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-dark">
        {pizza.image_url ? (
          <img
            src={pizza.image_url}
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
          <div className="absolute inset-0 flex items-center justify-center bg-dark/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-creme/30 px-4 py-1 font-poppins text-[0.62rem] uppercase tracking-[0.2em] text-creme">
              Indisponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-poppins text-base font-semibold leading-tight text-creme">{pizza.name}</h3>
        <span className="mt-1 font-poppins text-lg font-bold text-ambre">
          {Number(pizza.base_price).toFixed(2)} €
        </span>

        <p className="mt-2 line-clamp-2 font-poppins text-[0.78rem] leading-relaxed text-creme/60">
          {pizza.description || 'Pizza artisanale préparée au feu de bois.'}
        </p>

        <div className="mt-5 h-11">
          {qty === 0 ? (
            <button
              onClick={() => addItem(pizza)}
              disabled={!dispo}
              className="flex h-11 w-full animate-pop items-center justify-center gap-2 rounded-full bg-rouge font-poppins text-[0.78rem] font-medium uppercase tracking-[0.12em] text-creme transition hover:opacity-90 motion-reduce:animate-none disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-creme/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              Ajouter
            </button>
          ) : (
            <div className="flex h-11 w-full animate-pop items-center justify-between rounded-full bg-rouge px-1.5 motion-reduce:animate-none">
              <button
                onClick={() => decItem(pizza.id_pizza)}
                aria-label="Retirer une pizza"
                className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="font-poppins text-sm font-semibold text-creme">{qty}</span>
              <button
                onClick={() => addItem(pizza)}
                aria-label="Ajouter une pizza"
                className="flex h-8 w-8 items-center justify-center rounded-full text-creme transition hover:bg-white/10"
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
