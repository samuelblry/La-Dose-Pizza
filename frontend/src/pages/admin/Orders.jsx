// Gestion commandes admin — GET /api/admin/orders/
export default function Orders() {
  // orders = toutes les commandes — GET /api/admin/orders/
  // chaque order : { id_order, invoice_number, order_date, status, total_amount, order_type, user_email }
  const orders = []

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Commandes</h1>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id_order} className="bg-[#2a0400] rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-creme font-semibold">#{order.invoice_number}</p>
              <p className="text-creme/50 text-xs">{order.order_date} · {order.order_type} · {order.user_email}</p>
            </div>
            <span className="text-ambre font-bold">{order.total_amount} €</span>

            {/* PATCH /api/admin/orders/{id}/ avec { status: valeur }
                Statuts possibles : "en_attente", "en_preparation", "en_livraison", "livree", "annulee" */}
            <select
              defaultValue={order.status}
              className="bg-dark border border-rouge/30 text-creme text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rouge"
            >
              <option value="en_attente">En attente</option>
              <option value="en_preparation">En préparation</option>
              <option value="en_livraison">En livraison</option>
              <option value="livree">Livrée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  )
}
