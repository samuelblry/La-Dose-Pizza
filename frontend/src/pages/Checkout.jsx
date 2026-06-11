// Page finalisation commande — POST /api/orders/
export default function Checkout() {
  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Commander</h1>

      <form className="max-w-lg mx-auto flex flex-col gap-4">
        {/* "street" → stocké dans address.street (créé ou réutilisé) */}
        <input
          type="text"
          name="street"
          placeholder="Adresse de livraison"
          className="w-full bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
        />

        <div className="flex gap-3">
          {/* "zip_code" → address.zip_code */}
          <input
            type="text"
            name="zip_code"
            placeholder="Code postal"
            className="w-1/3 bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
          {/* "city" → address.city */}
          <input
            type="text"
            name="city"
            placeholder="Ville"
            className="flex-1 bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme placeholder-creme/40 focus:outline-none focus:border-rouge"
          />
        </div>

        {/* "order_type" → customer_order.order_type : "livraison" ou "sur_place" */}
        <select
          name="order_type"
          className="w-full bg-[#2a0400] border border-rouge/30 rounded-lg px-4 py-3 text-creme focus:outline-none focus:border-rouge"
        >
          <option value="livraison">Livraison à domicile</option>
          <option value="sur_place">Sur place</option>
        </select>

        {/* POST /api/orders/ → crée customer_order + order_lines à partir du panier
            Retourne : { id_order, invoice_number, total_amount } */}
        <button
          type="submit"
          className="w-full bg-rouge text-creme font-semibold rounded-xl py-3 mt-2 hover:opacity-90 transition"
        >
          Confirmer la commande
        </button>
      </form>
    </main>
  )
}
