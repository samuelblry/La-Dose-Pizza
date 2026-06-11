import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function BurgerIcon() {
  return (
    <button aria-label="Menu" className="flex flex-col gap-[5px]">
      <span className="block h-[2px] w-7 rounded bg-creme" />
      <span className="block h-[2px] w-7 rounded bg-creme" />
      <span className="block h-[2px] w-7 rounded bg-creme" />
    </button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      {/* barre du haut */}
      <header
        className={`fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between px-6 transition-transform duration-300 ${
          scrolled ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <button aria-label="Menu" onClick={() => setOpen(true)} className="flex flex-col gap-[5px]">
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
          <span className="block h-[2px] w-7 rounded bg-creme" />
        </button>
        <Link to="/" aria-label="Accueil"><span className="logo-court block h-7 w-11" /></Link>
      </header>

      {/* barre flottante du bas */}
      <nav
        className={`fixed bottom-5 left-1/2 z-50 flex h-16 w-[86%] max-w-[360px] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-dark/55 px-7 shadow-lg backdrop-blur-md transition-all duration-300 ${
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
            <NavLink to="/panier" onClick={() => setOpen(false)}>Mon panier</NavLink>

            {isLoggedIn ? (
              <>
                <NavLink to="/mon-compte" onClick={() => setOpen(false)}>Mon compte</NavLink>
                <NavLink to="/reservation" onClick={() => setOpen(false)}>Réserver une table</NavLink>
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

function NavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="font-poppins text-base text-creme py-3 border-b border-creme/10 hover:text-ambre transition-colors"
    >
      {children}
    </Link>
  )
}
