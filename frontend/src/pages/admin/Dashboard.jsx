// Tableau de bord admin — GET /api/admin/stats/
// Résumé : nb commandes du jour, réservations en attente, etc.
export default function Dashboard() {
  // stats = { orders_today, pending_reservations, total_clients }
  // GET /api/admin/stats/
  const stats = { orders_today: 0, pending_reservations: 0, total_clients: 0 }

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Dashboard Admin</h1>

      <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#2a0400] rounded-2xl p-6 text-center">
          <p className="text-ambre text-3xl font-bold">{stats.orders_today}</p>
          <p className="text-creme/60 text-sm mt-1">Commandes aujourd'hui</p>
        </div>
        <div className="bg-[#2a0400] rounded-2xl p-6 text-center">
          <p className="text-ambre text-3xl font-bold">{stats.pending_reservations}</p>
          <p className="text-creme/60 text-sm mt-1">Réservations en attente</p>
        </div>
        <div className="bg-[#2a0400] rounded-2xl p-6 text-center">
          <p className="text-ambre text-3xl font-bold">{stats.total_clients}</p>
          <p className="text-creme/60 text-sm mt-1">Clients inscrits</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        <a href="/admin/commandes" className="bg-[#2a0400] text-creme rounded-xl px-6 py-4 hover:border-rouge border border-transparent transition">
          Voir les commandes →
        </a>
        <a href="/admin/menu" className="bg-[#2a0400] text-creme rounded-xl px-6 py-4 hover:border-rouge border border-transparent transition">
          Gérer le menu →
        </a>
        <a href="/admin/clients" className="bg-[#2a0400] text-creme rounded-xl px-6 py-4 hover:border-rouge border border-transparent transition">
          Fiches clients →
        </a>
        <a href="/admin/reservations" className="bg-[#2a0400] text-creme rounded-xl px-6 py-4 hover:border-rouge border border-transparent transition">
          Réservations →
        </a>
      </div>
    </main>
  )
}
