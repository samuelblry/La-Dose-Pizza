// Page menu — GET /api/menu/pizzas/
// Affiche toutes les pizzas (is_available=true en priorité)
export default function Menu() {
  // pizzas = tableau récupéré depuis GET /api/menu/pizzas/
  // chaque pizza : { id_pizza, name, description, base_price, image_url, is_available }
  const pizzas = [
    { id_pizza: 1, name: 'PIZZA1', base_price: 20 },
    { id_pizza: 2, name: 'PIZZA2', base_price: 15 },
  ]

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Notre Carte</h1>

      <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
        {pizzas.map((pizza) => (
          <div key={pizza.id_pizza} className="bg-[#2a0400] rounded-2xl p-4 flex gap-4">
            {/* image_url → chemin vers l'image de la pizza */}
            <img src={pizza.image_url} alt={pizza.name} className="w-24 h-24 rounded-xl object-cover" />

            <div className="flex-1">
              <h2 className="text-creme font-semibold text-lg">{pizza.name}</h2>
              <p className="text-creme/50 text-sm">{pizza.description}</p>
              <p className="text-ambre font-bold mt-1">{pizza.base_price} €</p>
            </div>

            {/* Ajouter au panier — stocké localement (CartContext), pas d'appel API direct */}
            <button className="bg-rouge text-creme rounded-xl px-4 self-center hover:opacity-90 transition">
              +
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
