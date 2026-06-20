import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiLogout } from '../services/api'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isLoggedIn, isAdmin, isSuperAdmin, isStaff, logout, token } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await apiLogout(token, localStorage.getItem('refresh'))
    } catch {
      // déconnexion front même si le serveur échoue
    }
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* barre du haut — cachée au scroll en mobile, persistante en desktop */}
      <header
        className={`fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between px-6 transition-all duration-300 lg:h-20 lg:px-10 lg:translate-y-0 ${
          scrolled ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'lg:bg-dark/85 lg:shadow-lg lg:backdrop-blur-md' : 'lg:bg-transparent'}`}
      >
        <button aria-label="Menu" onClick={() => setOpen(true)} className="flex flex-col gap-[5px] lg:hidden">
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
        </button>
        <Link to="/" aria-label="Accueil"><span className="logo-court block h-6 w-10 lg:h-7 lg:w-11" /></Link>

        {/* navigation horizontale desktop */}
        <nav className="hidden items-center gap-7 lg:flex">
          <DeskLink to="/menu">LA CARTE</DeskLink>
          {isLoggedIn && !isAdmin && !isSuperAdmin && !isStaff && <DeskLink to="/reservation">RESERVER</DeskLink>}
          {isLoggedIn ? (
            <DeskLink to={isSuperAdmin ? '/super-admin' : (isAdmin || isStaff) ? '/admin' : '/mon-compte'}>
              {isSuperAdmin || isAdmin || isStaff ? 'DASHBOARD' : 'MON COMPTE'}
            </DeskLink>
          ) : (
            <>
              <DeskLink to="/connexion">CONNEXION</DeskLink>
              <Link
                to="/inscription"
                className="rounded-full bg-rouge px-5 py-2.5 font-poppins text-sm font-medium text-creme transition hover:bg-rouge/90"
              >
                CREER UN COMPTE
              </Link>
            </>
          )}
          {/* Panier toujours en dernier, à l'extrême droite */}
          {!isAdmin && !isSuperAdmin && !isStaff && (
            <Link
              to="/panier"
              aria-label="Mon panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-creme transition hover:bg-white/10 hover:text-ambre"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.3a1 1 0 001 .7h8.2a1 1 0 001-.8L21 8H6" />
                <circle cx="9" cy="20" r="1.2" />
                <circle cx="18" cy="20" r="1.2" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rouge px-1 font-poppins text-[0.62rem] font-semibold text-creme">
                  {count}
                </span>
              )}
            </Link>
          )}
        </nav>
      </header>

      {/* barre flottante du bas — mobile uniquement */}
      <nav
        className={`fixed bottom-5 left-1/2 z-50 flex h-16 w-[86%] max-w-[360px] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-dark/55 px-7 shadow-lg backdrop-blur-md transition-all duration-300 lg:hidden ${
          scrolled ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'
        }`}
      >
        <button aria-label="Menu" onClick={() => setOpen(true)} className="flex flex-col gap-[5px]">
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
        </button>
        <Link to="/" aria-label="Accueil"><span className="logo-court block h-7 w-11" /></Link>
      </nav>

      {/* Overlay menu */}
      {open && (
        <div className="fixed inset-0 z-[100] flex">
          {/* fond sombre cliquable pour fermer */}
          <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />

          {/* panneau de droite */}
          <div className="flex w-72 flex-col bg-dark px-8 py-10 gap-2">
            <button
              onClick={() => setOpen(false)}
              className="self-end text-creme/50 hover:text-creme mb-6 text-2xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>

            <NavLink to="/menu" onClick={() => setOpen(false)}>La carte</NavLink>
            {!isAdmin && !isSuperAdmin && !isStaff && (
              <NavLink to="/panier" onClick={() => setOpen(false)} badge={count}>Mon panier</NavLink>
            )}

            {isLoggedIn ? (
              <>
                {isSuperAdmin ? (
                  <NavLink to="/super-admin" onClick={() => setOpen(false)}>Dashboard</NavLink>
                ) : (isAdmin || isStaff) ? (
                  <NavLink to="/admin" onClick={() => setOpen(false)}>Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink to="/mon-compte" onClick={() => setOpen(false)}>Mon compte</NavLink>
                    <NavLink to="/reservation" onClick={() => setOpen(false)}>Réserver une table</NavLink>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-4 text-left font-poppins text-sm text-rouge/70 hover:text-rouge"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <NavLink to="/connexion" onClick={() => setOpen(false)}>Se connecter</NavLink>
                <NavLink to="/inscription" onClick={() => setOpen(false)}>Créer un compte</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function DeskLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-poppins text-sm text-creme/80 transition hover:text-ambre"
    >
      {children}
    </Link>
  )
}

function NavLink({ to, onClick, children, badge }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between font-poppins text-base text-creme py-3 border-b border-creme/10 hover:text-ambre transition-colors"
    >
      <span>{children}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rouge px-1.5 font-poppins text-[0.65rem] font-semibold text-creme">
          {badge}
        </span>
      )}
    </Link>
  )
}
