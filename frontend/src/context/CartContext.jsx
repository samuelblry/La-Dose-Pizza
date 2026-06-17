import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

// Panier stocké localement (localStorage), pas d'appel API tant qu'on ne commande pas
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })

  // Ouverture du mini-panier latéral
  const [isOpen, setIsOpen] = useState(false)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // Ajoute une pizza ou incrémente la quantité si déjà présente
  const addItem = (pizza) => {
    const idPizza = pizza.id_pizza ?? pizza.id
    setItems((prev) => {
      const found = prev.find((i) => (i.id_pizza ?? i.id) === idPizza)
      if (found) {
        return prev.map((i) =>
          (i.id_pizza ?? i.id) === idPizza ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...pizza, id_pizza: idPizza, qty: 1 }]
    })
  }

  // Retire une unité, supprime la ligne si on tombe à 0
  const decItem = (id) => {
    setItems((prev) =>
      prev
        .map((i) => ((i.id_pizza ?? i.id) === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    )
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => (i.id_pizza ?? i.id) !== id))

  const clear = () => setItems([])

  const count = items.reduce((n, i) => n + i.qty, 0)
  const total = items.reduce((n, i) => n + i.base_price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, decItem, removeItem, clear, count, total, isOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
