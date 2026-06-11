// Réservations admin — GET /api/admin/reservations/
export default function Reservations() {
  // reservations = toutes les réservations
  // chaque resa : { id_reservation, reservation_date, reservation_time, guest_count, status, user_email, table_number }
  const reservations = []

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Réservations</h1>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {reservations.map((resa) => (
          <div key={resa.id_reservation} className="bg-[#2a0400] rounded-2xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-creme font-semibold">{resa.reservation_date} à {resa.reservation_time}</p>
              <p className="text-creme/50 text-xs">
                {resa.guest_count} pers. · Table n°{resa.table_number} · {resa.user_email}
              </p>
            </div>

            {/* PATCH /api/admin/reservations/{id}/ avec { status: valeur }
                Statuts possibles : "en_attente", "confirmee", "annulee" */}
            <select
              defaultValue={resa.status}
              className="bg-dark border border-rouge/30 text-creme text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rouge"
            >
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        ))}
      </div>
    </main>
  )
}
