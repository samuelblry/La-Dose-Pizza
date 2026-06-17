import { useEffect, useState } from 'react'
import PizzaCard from '../components/PizzaCard'
import { apiPizzas } from '../services/api'
import { INGREDIENTS_PAR_CATEGORIE, ALLERGENES_PAR_INGREDIENT, TOUS_ALLERGENES } from '../data/ingredients'

const TRIS = [
  { value: 'defaut', label: 'Par défaut' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nom', label: 'Nom (A-Z)' },
]

const ATOUTS = ['Pâte levée 48h', 'Feu de bois', 'Produits frais']

export default function Menu() {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState('defaut')
  const [ingredients, setIngredients] = useState([]) // ingrédients à inclure
  const [allergenes, setAllergenes] = useState([]) // allergènes à exclure
  const [showFiltres, setShowFiltres] = useState(false)

  // Chargement des pizzas filtrées
  useEffect(() => {
    let actif = true
    setLoading(true)
    apiPizzas(null, { search: recherche, ingredients, allergenes, tri })
      .then((d) => {
        if (!actif) return
        const res = Array.isArray(d) ? d : d.results || []
        // On trie : dispo en premier
        const sorted = [...res].sort((a, b) => {
          if (a.is_available === b.is_available) return 0
          return a.is_available ? -1 : 1
        })
        setPizzas(sorted)
      })
      .catch(() => actif && setErreur('Impossible de charger la carte.'))
      .finally(() => actif && setLoading(false))
    return () => { actif = false }
  }, [recherche, ingredients, allergenes, tri])

  // Bloque le scroll du fond quand le drawer est ouvert
  useEffect(() => {
    document.body.style.overflow = showFiltres ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showFiltres])

  const toggle = (liste, setListe, val) =>
    setListe(liste.includes(val) ? liste.filter((x) => x !== val) : [...liste, val])

  const resetFiltres = () => {
    setIngredients([])
    setAllergenes([])
  }

  const nbFiltres = ingredients.length + allergenes.length

  return (
    <main className="min-h-screen bg-creme pb-32">
      {/* ── Héros ── */}
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-16 text-center lg:pt-32 lg:pb-20">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <img
          src="/img/element/assiette.png"
          alt=""
          className="pointer-events-none absolute right-4 top-1/2 hidden w-40 -translate-y-1/2 select-none opacity-80 drop-shadow-2xl lg:block xl:right-24 xl:w-52"
        />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            La carte · La Dose Pizza
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Nos pizzas
          </h1>
          <p className="mx-auto mt-5 max-w-md font-poppins text-sm leading-relaxed text-creme/70 lg:mx-0">
            Cuites au feu de bois et garnies de produits frais. Filtrez par
            ingrédient, écartez un allergène, ajoutez au panier.
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
            {ATOUTS.map((a) => (
              <li key={a} className="flex items-center gap-1.5 font-poppins text-[0.74rem] text-creme/70">
                <IconCheck className="h-3.5 w-3.5 text-ambre" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ── Barre d'outils sticky ── */}
      <div className="sticky top-0 z-30 border-b border-dark/10 bg-creme/95 backdrop-blur-md lg:top-20">
        <div className="mx-auto max-w-6xl px-5 py-4 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Recherche */}
            <div className="relative lg:flex-1">
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-dark/35" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une pizza..."
                className="h-12 w-full rounded-full border border-dark/15 bg-white pl-12 pr-10 font-poppins text-sm text-dark placeholder:text-dark/35 focus:border-rouge focus:outline-none focus:ring-2 focus:ring-rouge/20"
              />
              {recherche && (
                <button
                  onClick={() => setRecherche('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-dark/40 transition hover:bg-dark/5 hover:text-dark"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {/* Tri */}
              <div className="relative">
                <select
                  value={tri}
                  onChange={(e) => setTri(e.target.value)}
                  aria-label="Trier les pizzas"
                  className="h-11 cursor-pointer appearance-none rounded-full border border-dark/15 bg-white pl-4 pr-9 font-poppins text-[0.74rem] font-medium text-dark/70 transition hover:border-dark/35 focus:border-rouge focus:outline-none"
                >
                  {TRIS.map((t) => (
                    <option key={t.value} value={t.value} className="bg-white">
                      {t.label}
                    </option>
                  ))}
                </select>
                <IconChevron className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/45" />
              </div>

              {/* Filtres → drawer */}
              <button
                onClick={() => setShowFiltres(true)}
                className={`flex h-11 items-center gap-2 rounded-full border px-4 font-poppins text-[0.74rem] font-medium transition ${
                  nbFiltres > 0 ? 'border-rouge bg-rouge/10 text-rouge' : 'border-dark/15 bg-white text-dark/65 hover:border-dark/35'
                }`}
              >
                <IconSliders className="h-4 w-4" />
                Filtres
                {nbFiltres > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rouge px-1.5 text-[0.62rem] font-semibold text-creme">
                    {nbFiltres}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Chips de filtres actifs */}
          {nbFiltres > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ingredients.map((ing) => (
                <Chip key={ing} accent="rouge" onRemove={() => toggle(ingredients, setIngredients, ing)}>
                  {ing}
                </Chip>
              ))}
              {allergenes.map((al) => (
                <Chip key={al} accent="ambre" prefix="Sans" onRemove={() => toggle(allergenes, setAllergenes, al)}>
                  {al}
                </Chip>
              ))}
              <button
                onClick={resetFiltres}
                className="ml-1 font-poppins text-[0.72rem] text-dark/45 underline-offset-4 transition hover:text-dark hover:underline"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Résultats ── */}
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <p className="mt-6 font-poppins text-[0.72rem] uppercase tracking-[0.15em] text-dark/45">
          {loading ? 'Chargement…' : `${pizzas.length} pizza${pizzas.length > 1 ? 's' : ''}`}
        </p>

        {erreur ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <p className="font-poppins text-sm text-rouge">{erreur}</p>
          </div>
        ) : loading ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-dark/5" />
            ))}
          </div>
        ) : pizzas.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {pizzas.map((pizza) => (
              <PizzaCard key={pizza.id ?? pizza.id_pizza} pizza={pizza} />
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center px-6 text-center">
            <span className="logo-court mb-5 block h-12 w-20 opacity-25" />
            <p className="font-lostar text-xl text-dark">Aucune pizza trouvée</p>
            <p className="mt-2 max-w-[280px] font-poppins text-[0.78rem] leading-relaxed text-dark/50">
              {recherche || nbFiltres > 0
                ? 'Aucun résultat ne correspond à vos critères.'
                : 'La carte arrive bientôt, revenez vite !'}
            </p>
            {(recherche || nbFiltres > 0) && (
              <button
                onClick={() => { setRecherche(''); resetFiltres() }}
                className="mt-5 rounded-full border border-dark/15 px-5 py-2.5 font-poppins text-[0.74rem] font-medium text-dark/70 transition hover:border-rouge hover:text-rouge"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Drawer de filtres ── */}
      <FilterDrawer
        open={showFiltres}
        onClose={() => setShowFiltres(false)}
        ingredients={ingredients}
        setIngredients={setIngredients}
        allergenes={allergenes}
        setAllergenes={setAllergenes}
        toggle={toggle}
        resetFiltres={resetFiltres}
        nbFiltres={nbFiltres}
        nbResultats={pizzas.length}
        loading={loading}
      />
    </main>
  )
}

// ── Drawer de filtres (latéral desktop · bottom-sheet mobile) ──────────────
function FilterDrawer({
  open, onClose, ingredients, setIngredients, allergenes, setAllergenes,
  toggle, resetFiltres, nbFiltres, nbResultats, loading,
}) {
  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* fond cliquable */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* panneau */}
      <div
        role="dialog"
        aria-label="Filtres"
        className={`absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white transition-transform duration-300 ease-out lg:inset-y-0 lg:left-auto lg:right-0 lg:bottom-0 lg:max-h-none lg:w-full lg:max-w-md lg:rounded-t-none lg:rounded-l-3xl ${
          open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
        }`}
      >
        {/* en-tête */}
        <div className="flex items-center justify-between border-b border-dark/10 px-6 py-5">
          <h2 className="font-lostar text-2xl text-dark">Filtrer</h2>
          <button
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="flex h-9 w-9 items-center justify-center rounded-full text-dark/55 transition hover:bg-dark/5 hover:text-dark"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* corps scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Ingrédients */}
          <p className="font-poppins text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-rouge">
            Avec ces ingrédients
          </p>
          <div className="mt-4 space-y-4">
            {INGREDIENTS_PAR_CATEGORIE.map((cat) => (
              <div key={cat.label}>
                <p className="mb-2 font-poppins text-[0.58rem] uppercase tracking-[0.18em] text-dark/40">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((ing) => {
                    const actif = ingredients.includes(ing)
                    const allergenesContenus = ALLERGENES_PAR_INGREDIENT[ing] || []
                    const allergenesExclus = allergenesContenus.filter((a) => allergenes.includes(a))
                    return (
                      <button
                        key={ing}
                        onClick={() => toggle(ingredients, setIngredients, ing)}
                        aria-pressed={actif}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-poppins text-[0.74rem] transition ${
                          actif
                            ? 'border-rouge bg-rouge text-creme'
                            : 'border-dark/15 text-dark/65 hover:border-rouge/50 hover:text-rouge'
                        }`}
                      >
                        {ing}
                        {allergenesExclus.length > 0 && (
                          <span title={`Contient : ${allergenesExclus.join(', ')}`} className="text-ambre">⚠</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Allergènes */}
          <div className="mt-7 border-t border-dark/10 pt-6">
            <p className="font-poppins text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-rouge">
              Sans ces allergènes
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOUS_ALLERGENES.map((al) => {
                const actif = allergenes.includes(al)
                return (
                  <button
                    key={al}
                    onClick={() => toggle(allergenes, setAllergenes, al)}
                    aria-pressed={actif}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-poppins text-[0.74rem] transition ${
                      actif ? 'border-ambre bg-ambre/20 text-dark' : 'border-dark/15 text-dark/65 hover:border-ambre/60 hover:text-dark'
                    }`}
                  >
                    {actif && <IconNo className="h-3.5 w-3.5 text-rouge" />}
                    {al}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* pied : reset + valider */}
        <div className="flex items-center gap-3 border-t border-dark/10 px-6 py-4">
          <button
            onClick={resetFiltres}
            disabled={nbFiltres === 0}
            className="font-poppins text-[0.74rem] text-dark/55 underline-offset-4 transition hover:text-dark hover:underline disabled:cursor-not-allowed disabled:text-dark/25 disabled:no-underline"
          >
            Réinitialiser
          </button>
          <button
            onClick={onClose}
            className="ml-auto flex-1 rounded-full bg-rouge py-3 font-poppins text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-creme transition hover:bg-rouge/90 lg:flex-none lg:px-8"
          >
            {loading ? 'Voir les pizzas' : `Voir ${nbResultats} pizza${nbResultats > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Chip de filtre actif ───────────────────────────────────────────────────
function Chip({ children, prefix, accent, onRemove }) {
  const styles = accent === 'ambre'
    ? 'border-ambre/50 bg-ambre/15 text-dark'
    : 'border-rouge/30 bg-rouge/10 text-rouge'
  return (
    <span className={`flex items-center gap-1.5 rounded-full border py-1 pl-3 pr-1.5 font-poppins text-[0.72rem] ${styles}`}>
      {prefix && <span className="opacity-50">{prefix}</span>}
      {children}
      <button
        onClick={onRemove}
        aria-label={`Retirer ${children}`}
        className="flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-dark/10"
      >
        <IconClose className="h-3 w-3" />
      </button>
    </span>
  )
}

// ── Icônes ─────────────────────────────────────────────────────────────────
function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m20 20-3-3" />
    </svg>
  )
}

function IconSliders({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  )
}

function IconChevron({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function IconClose({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  )
}

function IconNo({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="m6 6 12 12" />
    </svg>
  )
}

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
