// Fiches clients admin — GET /api/admin/clients/
export default function Clients() {
  // clients = liste des user_account (is_admin=false)
  // chaque client : { id_user, email, phone, loyalty_points, address }
  const clients = []

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Fiches Clients</h1>

      <div className="max-w-3xl mx-auto flex flex-col gap-3">
        {clients.map((client) => (
          <div key={client.id_user} className="bg-[#2a0400] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-creme font-semibold">{client.email}</p>
                <p className="text-creme/50 text-xs">{client.phone}</p>
                {/* address → JOIN sur address.id_user */}
                {client.address && (
                  <p className="text-creme/50 text-xs">{client.address.street}, {client.address.city}</p>
                )}
              </div>
              {/* loyalty_points → affiché, modifiable via PATCH /api/admin/clients/{id}/ */}
              <span className="text-ambre font-bold text-sm">{client.loyalty_points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
