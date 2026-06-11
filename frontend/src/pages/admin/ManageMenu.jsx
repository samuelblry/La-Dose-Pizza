// Gestion du menu admin
// GET /api/menu/pizzas/  |  POST /api/menu/pizzas/  |  PATCH /api/menu/pizzas/{id}/  |  DELETE /api/menu/pizzas/{id}/
export default function ManageMenu() {
  const pizzas = []

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Gestion du Menu</h1>

      <div className="max-w-2xl mx-auto">

        {/* Formulaire ajout pizza — POST /api/menu/pizzas/ */}
        <div className="bg-[#2a0400] rounded-2xl p-6 mb-6">
          <h2 className="text-ambre font-semibold mb-4">Ajouter une pizza</h2>
          <form className="flex flex-col gap-3">
            {/* "name" → pizza.name */}
            <input
              type="text"
              name="name"
              placeholder="Nom de la pizza"
              className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
            />
            {/* "description" → pizza.description */}
            <textarea
              name="description"
              placeholder="Description"
              rows={2}
              className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge resize-none"
            />
            {/* "base_price" → pizza.base_price */}
            <input
              type="number"
              name="base_price"
              step="0.01"
              placeholder="Prix (€)"
              className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
            />
            {/* "image_url" → pizza.image_url */}
            <input
              type="text"
              name="image_url"
              placeholder="URL de l'image"
              className="w-full bg-dark border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
            />
            <button
              type="submit"
              className="bg-rouge text-creme font-semibold rounded-lg py-3 hover:opacity-90 transition"
            >
              Ajouter
            </button>
          </form>
        </div>

        {/* Liste des pizzas existantes */}
        <div className="flex flex-col gap-3">
          {pizzas.map((pizza) => (
            <div key={pizza.id_pizza} className="bg-[#2a0400] rounded-2xl p-4 flex items-center gap-4">
              <span className="text-creme flex-1">{pizza.name}</span>
              <span className="text-ambre font-bold">{pizza.base_price} €</span>

              {/* PATCH /api/menu/pizzas/{id}/ avec { is_available: false/true } */}
              <button className="text-xs text-creme/50 hover:text-creme border border-creme/20 rounded-lg px-3 py-1">
                {pizza.is_available ? 'Indispo' : 'Dispo'}
              </button>

              {/* DELETE /api/menu/pizzas/{id}/ */}
              <button className="text-xs text-rouge/60 hover:text-rouge border border-rouge/20 rounded-lg px-3 py-1">
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
