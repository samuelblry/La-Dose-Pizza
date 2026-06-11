// Page réservation — POST /api/reservations/
export default function Reservation() {
  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Réserver une table</h1>

      <form className="max-w-lg mx-auto flex flex-col gap-4">
        {/* "reservation_date" → reservation.reservation_date */}
        <input
          type="date"
          name="reservation_date"
          className="w-full bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme focus:outline-none focus:border-rouge"
        />

        {/* "reservation_time" → reservation.reservation_time */}
        <input
          type="time"
          name="reservation_time"
          className="w-full bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme focus:outline-none focus:border-rouge"
        />

        {/* "guest_count" → reservation.guest_count
            Le back doit trouver une table avec capacity >= guest_count */}
        <input
          type="number"
          name="guest_count"
          min="1"
          max="20"
          placeholder="Nombre de personnes"
          className="w-full bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
        />

        {/* POST /api/reservations/ → crée reservation + assigne id_table automatiquement
            Retourne : { id_reservation, status: "confirmée", table_number } */}
        <button
          type="submit"
          className="w-full bg-rouge text-creme font-semibold rounded-xl py-3 mt-2 hover:opacity-90 transition"
        >
          Réserver
        </button>
      </form>
    </main>
  )
}
