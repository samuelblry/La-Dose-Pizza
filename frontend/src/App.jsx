import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Payment from './pages/Payment'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Reservation from './pages/Reservation'
import Dashboard from './pages/admin/Dashboard'
import ManageMenu from './pages/admin/ManageMenu'
import Orders from './pages/admin/Orders'
import Clients from './pages/admin/Clients'
import Reservations from './pages/admin/Reservations'
import SuperAdmin from './pages/admin/SuperAdmin'

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Redirige vers /connexion si pas connecté, en mémorisant la page voulue
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  return children
}

// Réservé au staff : non connecté → connexion, connecté mais pas admin → accueil
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Navbar />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/panier" element={<Cart />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />

            {/* Pages nécessitant d'être connecté */}
            <Route path="/commander" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/paiement" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/reservation" element={<ProtectedRoute><Reservation /></ProtectedRoute>} />
            <Route path="/mon-compte" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            {/* Pages admin — réservées au staff */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute><ManageMenu /></AdminRoute>} />
            <Route path="/admin/commandes" element={<AdminRoute><Orders /></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />
            <Route path="/admin/reservations" element={<AdminRoute><Reservations /></AdminRoute>} />

            {/* Accès Admin Global pour test via URL directe */}
            <Route path="/super-admin" element={<SuperAdmin />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
