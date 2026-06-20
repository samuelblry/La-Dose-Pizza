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
import AdminAccount from './pages/admin/AdminAccount'

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Destination par défaut du staff selon son rôle
function staffHome(isSuperAdmin) {
  return isSuperAdmin ? '/super-admin' : '/admin'
}

// Page client nécessitant d'être connecté ET de ne pas être staff
function ClientRoute({ children }) {
  const { isLoggedIn, isAdmin, isSuperAdmin, isStaff } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (isAdmin || isSuperAdmin || isStaff) return <Navigate to={staffHome(isSuperAdmin)} replace />
  return children
}

// Page client accessible aux invités mais interdite au staff (ex: panier)
function GuestOrClientRoute({ children }) {
  const { isAdmin, isSuperAdmin, isStaff } = useAuth()
  if (isAdmin || isSuperAdmin || isStaff) return <Navigate to={staffHome(isSuperAdmin)} replace />
  return children
}

// Réservé au staff : non connecté → connexion, connecté mais pas admin → accueil
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, isStaff } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (!isAdmin && !isStaff) return <Navigate to="/" replace />
  return children
}

// Réservé au superadmin uniquement
function SuperAdminRoute({ children }) {
  const { isLoggedIn, isSuperAdmin } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  if (!isSuperAdmin) return <Navigate to="/" replace />
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
            <Route path="/panier" element={<GuestOrClientRoute><Cart /></GuestOrClientRoute>} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />

            {/* Pages client : connecté et non-staff */}
            <Route path="/commander" element={<ClientRoute><Checkout /></ClientRoute>} />
            <Route path="/paiement" element={<ClientRoute><Payment /></ClientRoute>} />
            <Route path="/reservation" element={<ClientRoute><Reservation /></ClientRoute>} />
            <Route path="/mon-compte" element={<ClientRoute><Account /></ClientRoute>} />

            {/* Pages admin — réservées au staff */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/menu" element={<AdminRoute><ManageMenu /></AdminRoute>} />
            <Route path="/admin/commandes" element={<AdminRoute><Orders /></AdminRoute>} />
            <Route path="/admin/clients" element={<AdminRoute><Clients /></AdminRoute>} />
            <Route path="/admin/reservations" element={<AdminRoute><Reservations /></AdminRoute>} />
            <Route path="/admin/compte" element={<AdminRoute><AdminAccount /></AdminRoute>} />

            {/* Espace superadmin — réservé au superadmin */}
            <Route path="/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
