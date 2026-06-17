import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiAdminPizzas, apiAdminCreatePizza, apiAdminPatchPizza, apiAdminDeletePizza, MEDIA_BASE } from '../../services/api'
import AdminLayout, { SearchBar } from '../../components/AdminLayout'
import { Vide } from './Orders'
import { INGREDIENTS_PAR_CATEGORIE } from '../../data/ingredients'

export default function ManageMenu() {
  const { token } = useAuth()
  const [pizzas, setPizzas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')
  const [ajout, setAjout] = useState(false)
  const [ingredientsCoches, setIngredientsCoches] = useState([])
  const [confirmSuppr, setConfirmSuppr] = useState(null)
  const [busy, setBusy] = useState(null)
  const [recherche, setRecherche] = useState('')

  const toggleIng = (nom) =>
    setIngredientsCoches((prev) =>
      prev.includes(nom) ? prev.filter((x) => x !== nom) : [...prev, nom],
    )

  const fermerFormulaire = () => {
    setAjout(false)
    setIngredientsCoches([])
  }

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    if (!q) return pizzas
    return pizzas.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        (p.ingredients || []).some((i) =>
          (typeof i === 'string' ? i : i?.name)?.toLowerCase().includes(q),
        ),
    )
  }, [pizzas, recherche])

  useEffect(() => {
    let actif = true
    apiAdminPizzas(token)
      .then((d) => actif && setPizzas(Array.isArray(d) ? d : d.results || []))
      .catch(() => actif && setErreur('Impossible de charger la carte.'))
      .finally(() => actif && setLoading(false))
    return () => {
      actif = false
    }
  }, [token])

  const ajouter = async (e) => {
    e.preventDefault()
    setErreur('')
    const f = new FormData(e.target)
    if (f.get('image_url') && f.get('image_url').size === 0) {
      f.delete('image_url')
    }
    ingredientsCoches.forEach((ing) => f.append('ingredients', ing))
    try {
      const pizza = await apiAdminCreatePizza(token, f)
      setPizzas((prev) => [pizza, ...prev])
      e.target.reset()
      setIngredientsCoches([])
      setAjout(false)
    } catch {
      setErreur("Échec de l'ajout de la pizza.")
    }
  }

  const basculerDispo = async (pizza) => {
    const pid = pizza.id_pizza ?? pizza.id
    setBusy(pid)
    try {
      await apiAdminPatchPizza(token, pid, { is_available: !pizza.is_available })
      setPizzas((prev) =>
        prev.map((p) => ((p.id_pizza ?? p.id) === pid ? { ...p, is_available: !p.is_available } : p)),
      )
    } catch {
      setErreur('Échec de la mise à jour.')
    } finally {
      setBusy(null)
    }
  }

  const supprimer = async (id) => {
    setBusy(id)
    try {
      await apiAdminDeletePizza(token, id)
      setPizzas((prev) => prev.filter((p) => (p.id_pizza ?? p.id) !== id))
      setConfirmSuppr(null)
    } catch {
      setErreur('Échec de la suppression.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <AdminLayout title="La carte" subtitle="Ajoutez, modifiez la disponibilité ou retirez des pizzas.">
      {erreur && (
        <p className="mb-5 rounded-2xl border border-rouge/30 bg-rouge/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-rouge">
          {erreur}
        </p>
      )}

      {/* bouton + formulaire d'ajout */}
      <div className="mb-6">
        {!ajout ? (
          <button
            onClick={() => setAjout(true)}
            className="flex items-center gap-2 rounded-full bg-rouge px-5 py-3 font-poppins text-[0.78rem] font-semibold text-creme transition hover:bg-rouge/90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Ajouter une pizza
          </button>
        ) : (
          <form onSubmit={ajouter} className="animate-pop rounded-3xl border border-white/10 bg-[#240400] p-6 motion-reduce:animate-none">
            <h2 className="mb-4 font-poppins text-base font-semibold text-ambre">Nouvelle pizza</h2>
            <div className="space-y-4">
              <Field label="Nom" name="name" placeholder="Margherita" required />

              {/* Sélection des ingrédients */}
              <div>
                <span className="mb-2 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-creme/50">
                  Ingrédients
                  {ingredientsCoches.length > 0 && (
                    <span className="ml-2 rounded-full bg-rouge px-2 py-0.5 text-[0.6rem] text-creme">
                      {ingredientsCoches.length} sélectionné{ingredientsCoches.length > 1 ? 's' : ''}
                    </span>
                  )}
                </span>
                <div className="space-y-3 rounded-xl border border-white/10 bg-dark p-4">
                  {INGREDIENTS_PAR_CATEGORIE.map((cat) => (
                    <div key={cat.label}>
                      <p className="mb-1.5 font-poppins text-[0.58rem] uppercase tracking-[0.18em] text-ambre/60">
                        {cat.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map((ing) => {
                          const coche = ingredientsCoches.includes(ing)
                          return (
                            <button
                              key={ing}
                              type="button"
                              onClick={() => toggleIng(ing)}
                              className={`rounded-full border px-2.5 py-1 font-poppins text-[0.68rem] transition ${
                                coche
                                  ? 'border-rouge bg-rouge text-creme'
                                  : 'border-white/15 text-creme/60 hover:border-white/40 hover:text-creme/90'
                              }`}
                            >
                              {coche && <span className="mr-1 text-[0.6rem]">✓</span>}
                              {ing}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Prix (€)" name="base_price" type="number" step="0.01" placeholder="12.50" required />
                <Field label="Image de la pizza" name="image_url" type="file" accept="image/*" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" className="flex-1 rounded-xl bg-rouge py-3 font-poppins text-[0.78rem] font-semibold text-creme transition hover:bg-rouge/90">
                Ajouter
              </button>
              <button type="button" onClick={fermerFormulaire} className="flex-1 rounded-xl border border-white/15 py-3 font-poppins text-[0.78rem] text-creme/70 transition hover:border-creme hover:text-creme">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {!loading && pizzas.length > 0 && (
        <SearchBar value={recherche} onChange={setRecherche} placeholder="Rechercher une pizza…" />
      )}

      {loading ? (
        <Skeleton />
      ) : pizzas.length === 0 ? (
        <Vide label="Aucune pizza sur la carte pour le moment." />
      ) : liste.length === 0 ? (
        <Vide label="Aucune pizza ne correspond à la recherche." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {liste.map((pizza) => {
            const pid = pizza.id_pizza ?? pizza.id
            return (
            <div key={pid} className="flex gap-4 rounded-3xl border border-white/10 bg-[#240400] p-4">
              {/* visuel */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black/30">
                {pizza.image_url ? (
                  <img src={`${MEDIA_BASE}/${pizza.image_url}`} alt={pizza.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="logo-court absolute left-1/2 top-1/2 block h-7 w-11 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-poppins text-sm font-semibold text-creme">{pizza.name}</p>
                  <span className="shrink-0 font-lostar text-lg text-ambre">{pizza.base_price} €</span>
                </div>
                <span
                  className={`mt-1 inline-flex w-fit items-center gap-1.5 font-poppins text-[0.7rem] ${
                    pizza.is_available ? 'text-emerald-400' : 'text-creme/40'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${pizza.is_available ? 'bg-emerald-400' : 'bg-creme/40'}`} />
                  {pizza.is_available ? 'Disponible' : 'Indisponible'}
                </span>

                {confirmSuppr === pid ? (
                  <div className="mt-auto flex gap-2 pt-3">
                    <button
                      onClick={() => supprimer(pid)}
                      disabled={busy === pid}
                      className="flex-1 rounded-lg bg-rouge py-2 font-poppins text-[0.7rem] font-semibold text-creme transition hover:bg-rouge/90 disabled:opacity-50"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setConfirmSuppr(null)}
                      className="flex-1 rounded-lg border border-white/15 py-2 font-poppins text-[0.7rem] text-creme/70 transition hover:border-creme hover:text-creme"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto flex gap-2 pt-3">
                    <button
                      onClick={() => basculerDispo(pizza)}
                      disabled={busy === pid}
                      className="flex-1 rounded-lg border border-white/15 py-2 font-poppins text-[0.7rem] text-creme/70 transition hover:border-ambre hover:text-ambre disabled:opacity-50"
                    >
                      {pizza.is_available ? 'Rendre indispo' : 'Rendre dispo'}
                    </button>
                    <button
                      onClick={() => setConfirmSuppr(pid)}
                      className="rounded-lg border border-rouge/30 px-3 py-2 font-poppins text-[0.7rem] text-rouge/80 transition hover:bg-rouge hover:text-creme"
                      aria-label="Supprimer la pizza"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

function Field({ label, name, type = 'text', step, placeholder, required, accept }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-poppins text-[0.66rem] uppercase tracking-[0.15em] text-creme/50">
        {label}
        {required && <span className="text-rouge"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        required={required}
        accept={accept}
        className="w-full rounded-xl border border-white/10 bg-dark px-4 py-3 font-poppins text-sm text-creme placeholder-creme/30 focus:border-ambre/50 focus:outline-none"
      />
    </label>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-[#240400]" />
      ))}
    </div>
  )
}
