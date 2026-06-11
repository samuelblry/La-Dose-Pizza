// Page compte client — GET /api/users/me/  +  GET /api/orders/?user=me
export default function Account() {
  // user = { email, phone, loyalty_points } — GET /api/users/me/
  const user = { email: '', phone: '', loyalty_points: 0 }
  // orders = tableau des commandes — GET /api/orders/?user=me
  const orders = []

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Mon Compte</h1>

      <div className="max-w-lg mx-auto flex flex-col gap-6">

        {/* Infos du compte */}
        <div className="bg-[#2a0400] rounded-2xl p-6">
          <h2 className="text-ambre font-semibold mb-3">Mes informations</h2>
          <p className="text-creme/70 text-sm">Email : <span className="text-creme">{user.email}</span></p>
          <p className="text-creme/70 text-sm mt-1">Téléphone : <span className="text-creme">{user.phone}</span></p>
          {/* loyalty_points → affiché + converti en réductions côté back */}
          <p className="text-creme/70 text-sm mt-1">Points fidélité : <span className="text-ambre font-bold">{user.loyalty_points} pts</span></p>
        </div>

        {/* Historique commandes */}
        <div className="bg-[#2a0400] rounded-2xl p-6">
          <h2 className="text-ambre font-semibold mb-3">Mes commandes</h2>
          {orders.map((order) => (
            <div key={order.id_order} className="flex items-center justify-between py-2 border-b border-rouge/10">
              <div>
                {/* invoice_number affiché pour identifier la commande */}
                <p className="text-creme text-sm">#{order.invoice_number}</p>
                <p className="text-creme/50 text-xs">{order.order_date} — {order.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ambre font-bold text-sm">{order.total_amount} €</span>
                {/* GET /api/orders/{id}/invoice/ → retourne le PDF de la facture */}
                <button className="text-xs text-rouge/70 hover:text-rouge underline">
                  Facture PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Déconnexion — POST /api/auth/logout/ ou suppression du token côté front */}
        <button className="w-full border border-rouge/40 text-rouge/70 rounded-xl py-3 hover:border-rouge hover:text-rouge transition">
          Se déconnecter
        </button>
      </div>
    </main>
  )
}
