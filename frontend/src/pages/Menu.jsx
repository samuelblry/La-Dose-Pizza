import { useEffect, useMemo, useState } from 'react'
import PizzaCard from '../components/PizzaCard'
import { apiPizzas } from '../services/api'

const TRIS = [
  { value: 'defaut', label: 'Par défaut' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc', label: 'Prix décroissant' },
  { value: 'nom', label: 'Nom (A-Z)' },
]

export default function Menu() {
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(null)

  // Liste de base pour extraire les ingrédients/allergènes disponibles
  const [pizzasBase, setPizzasBase] = useState([])

  // Chargement initial pour les filtres
  useEffect(() => {
    let actif = true
    apiPizzas()
      .then((d) => actif && setPizzasBase(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
    return () => { actif = false }
  }, [])

  const [recherche, setRecherche] = useState('')
  const [dispoOnly, setDispoOnly] = useState(false)
  const [tri, setTri] = useState('defaut')
  const [ingredients, setIngredients] = useState([]) // ingrédients à inclure
  const [allergenes, setAllergenes] = useState([]) // allergènes à exclure
  const [showFiltres, setShowFiltres] = useState(false)

  // Chargement des pizzas filtrées
  useEffect(() => {
    let actif = true
    setLoading(true)
    apiPizzas(null, { search: recherche, dispoOnly, ingredients, allergenes, tri })
      .then((d) => actif && setPizzas(Array.isArray(d) ? d : d.results || []))
      .catch(() => actif && setErreur('Impossible de charger la carte.'))
      .finally(() => actif && setLoading(false))
    return () => { actif = false }
  }, [recherche, dispoOnly, ingredients, allergenes, tri])

  const ingredientsDispo = useMemo(() => {
    const set = new Set()
    pizzasBase.forEach((p) => (p.ingredients || []).forEach((i) => {
      const name = typeof i === 'string' ? i : i?.name
      if (name) set.add(name)
    }))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [pizzasBase])

  const allergenesDispo = useMemo(() => {
    const set = new Set()
    pizzasBase.forEach((p) => (p.allergens || []).forEach((a) => {
      const name = typeof a === 'string' ? a : a?.name
      if (name) set.add(name)
    }))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [pizzasBase])

  const toggle = (liste, setListe, val) =>
    setListe(liste.includes(val) ? liste.filter((x) => x !== val) : [...liste, val])

  const resetFiltres = () => {
    setIngredients([])
    setAllergenes([])
  }

  const nbFiltres = ingredients.length + allergenes.length

  const liste = pizzas

  // Écran de chargement
  if (loading) {
    return (
      <main className="min-h-screen bg-dark pb-32">
        <header className="px-6 pt-24 text-center lg:pt-32">
          <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">Pizzeria artisanale</p>
          <h1 className="font-lostar text-[2.6rem] leading-none text-rouge lg:text-[4rem]">Notre Carte</h1>
        </header>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/5 h-64" />
          ))}
        </div>
      </main>
    )
  }

  // Écran d'erreur
  if (erreur) {
    return (
      <main className="min-h-screen bg-dark pb-32">
        <header className="px-6 pt-24 text-center lg:pt-32">
          <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">Pizzeria artisanale</p>
          <h1 className="font-lostar text-[2.6rem] leading-none text-rouge lg:text-[4rem]">Notre Carte</h1>
        </header>
        <div className="mt-16 flex flex-col items-center px-6 text-center">
          <p className="font-poppins text-sm text-rouge">{erreur}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-dark pb-32">
      {/* En-tête */}
      <header className="px-6 pt-24 text-center lg:pt-32">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Pizzeria artisanale
        </p>
        <h1 className="font-lostar text-[2.6rem] leading-none text-rouge lg:text-[4rem]">Notre Carte</h1>
        <p className="mx-auto mt-4 max-w-[280px] font-poppins text-[0.82rem] leading-relaxed text-creme/70 lg:max-w-md lg:text-base">
          Nos pizzas cuites au feu de bois, préparées avec des produits frais.
        </p>
      </header>

      {/* Barre de recherche + filtres */}
      <div className="mx-auto mt-10 max-w-6xl px-5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-creme/40"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3-3" />
          </svg>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une pizza..."
            className="h-12 w-full rounded-full border border-white/10 bg-[#240400] pl-12 pr-4 font-poppins text-sm text-creme placeholder:text-creme/30 focus:border-ambre/50 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {/* Filtre disponibilité */}
          <button
            onClick={() => setDispoOnly((v) => !v)}
            className={`flex h-10 items-center gap-2 rounded-full border px-4 font-poppins text-[0.72rem] font-medium uppercase tracking-[0.1em] transition ${
              dispoOnly ? 'border-rouge bg-rouge text-creme' : 'border-white/15 text-creme/70'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${dispoOnly ? 'bg-creme' : 'bg-ambre'}`} />
            Disponibles
          </button>

          {/* Bouton panneau de filtres */}
          <button
            onClick={() => setShowFiltres((v) => !v)}
            className={`flex h-10 items-center gap-2 rounded-full border px-4 font-poppins text-[0.72rem] font-medium uppercase tracking-[0.1em] transition ${
              nbFiltres > 0 ? 'border-ambre text-ambre' : 'border-white/15 text-creme/70'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            Filtres
            {nbFiltres > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ambre px-1.5 text-[0.62rem] font-semibold text-dark">
                {nbFiltres}
              </span>
            )}
          </button>

          {/* Tri */}
          <div className="relative ml-auto">
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              className="h-10 appearance-none rounded-full border border-white/15 bg-[#240400] pl-4 pr-9 font-poppins text-[0.72rem] font-medium uppercase tracking-[0.1em] text-creme/70 focus:border-ambre/50 focus:outline-none"
            >
              {TRIS.map((t) => (
                <option key={t.value} value={t.value} className="bg-dark">
                  {t.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-creme/50"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Panneau ingrédients / allergènes */}
        {showFiltres && (
          <div className="mt-3 animate-pop rounded-2xl border border-white/10 bg-[#240400] p-4 motion-reduce:animate-none">
            <div>
              <p className="font-poppins text-[0.66rem] uppercase tracking-[0.18em] text-ambre">
                Avec ces ingrédients
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ingredientsDispo.length === 0 && (
                  <span className="font-poppins text-[0.74rem] text-creme/40">Aucun ingrédient</span>
                )}
                {ingredientsDispo.map((ing) => {
                  const actif = ingredients.includes(ing)
                  return (
                    <button
                      key={ing}
                      onClick={() => toggle(ingredients, setIngredients, ing)}
                      className={`rounded-full border px-3 py-1.5 font-poppins text-[0.74rem] transition ${
                        actif ? 'border-rouge bg-rouge text-creme' : 'border-white/15 text-creme/70'
                      }`}
                    >
                      {ing}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-5">
              <p className="font-poppins text-[0.66rem] uppercase tracking-[0.18em] text-ambre">
                Sans ces allergènes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {allergenesDispo.length === 0 && (
                  <span className="font-poppins text-[0.74rem] text-creme/40">Aucun allergène</span>
                )}
                {allergenesDispo.map((al) => {
                  const actif = allergenes.includes(al)
                  return (
                    <button
                      key={al}
                      onClick={() => toggle(allergenes, setAllergenes, al)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-poppins text-[0.74rem] transition ${
                        actif ? 'border-ambre bg-ambre/15 text-ambre' : 'border-white/15 text-creme/70'
                      }`}
                    >
                      {actif && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" d="m6 6 12 12" />
                        </svg>
                      )}
                      {al}
                    </button>
                  )
                })}
              </div>
            </div>

            {nbFiltres > 0 && (
              <button
                onClick={resetFiltres}
                className="mt-5 font-poppins text-[0.72rem] uppercase tracking-[0.12em] text-creme/50 underline-offset-4 hover:text-creme hover:underline"
              >
                Tout effacer
              </button>
            )}
          </div>
        )}

        <p className="mt-4 font-poppins text-[0.7rem] uppercase tracking-[0.15em] text-creme/40">
          {liste.length} pizza{liste.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille des pizzas */}
      {liste.length > 0 ? (
        <div className="mx-auto mt-5 grid max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {liste.map((pizza) => (
            <PizzaCard key={pizza.id ?? pizza.id_pizza} pizza={pizza} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center px-6 text-center">
          <span className="logo-court mb-5 block h-12 w-20 opacity-20" />
          <p className="font-lostar text-xl text-creme">Aucune pizza pour le moment</p>
          <p className="mt-2 max-w-[260px] font-poppins text-[0.78rem] leading-relaxed text-creme/50">
            {pizzas.length === 0
              ? 'La carte arrive bientôt, revenez vite !'
              : 'Aucun résultat ne correspond à votre recherche.'}
          </p>
        </div>
      )}
    </main>
  )
}
