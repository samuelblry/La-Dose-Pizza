// Page panier — contenu géré localement (CartContext), pas d'API
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // items = liste des articles dans le panier (state local)
  const items = []
  const total = 0

  // Si pas connecté → /connexion avec état from=/panier pour revenir après login
  const handleCommander = () => navigate(isLoggedIn ? '/commander' : '/connexion', {
    state: { from: '/commander' }
  })

  return (
    <main className="min-h-screen bg-dark px-4 py-12">
      <h1 className="font-lostar text-rouge text-4xl text-center mb-8">Mon Panier</h1>

      <div className="max-w-lg mx-auto flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-[#2a0400] rounded-2xl p-4 flex items-center gap-4">
            <span className="text-creme flex-1">{item.name}</span>
            <span className="text-ambre font-bold">{item.unit_price} €</span>

            {/* Modifier la quantité — mise à jour du CartContext uniquement */}
            <div className="flex items-center gap-2">
              <button className="bg-rouge/30 text-creme rounded-lg w-8 h-8">−</button>
              <span className="text-creme">{item.quantity}</span>
              <button className="bg-rouge text-creme rounded-lg w-8 h-8">+</button>
            </div>

            {/* Retirer l'article du panier */}
            <button className="text-rouge/60 hover:text-rouge text-sm">Retirer</button>
          </div>
        ))}

        <div className="text-right text-creme font-semibold text-lg mt-2">
          Total : <span className="text-ambre">{total} €</span>
        </div>

        {/* Connecté → /commander | non connecté → /connexion */}
        <button
          onClick={handleCommander}
          className="w-full bg-rouge text-creme font-semibold rounded-xl py-3 text-center hover:opacity-90 transition"
        >
          {isLoggedIn ? 'Passer la commande' : 'Se connecter pour commander'}
        </button>
      </div>
    </main>
  )
}
