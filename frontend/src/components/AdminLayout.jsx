import { NavLink } from 'react-router-dom'

const TABS = [
  {
    to: '/admin',
    end: true,
    label: 'Tableau de bord',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z" />,
  },
  {
    to: '/admin/commandes',
    label: 'Commandes',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6a1 1 0 011 1v0a1 1 0 001 1h1a1 1 0 011 1v11a1 1 0 01-1 1H6a1 1 0 01-1-1V8a1 1 0 011-1h1a1 1 0 001-1a1 1 0 011-1zM9 12h6M9 16h4" />,
  },
  {
    to: '/admin/menu',
    label: 'La carte',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 5a1 1 0 00-1 1v13a1 1 0 001 1h16a1 1 0 001-1V6a1 1 0 00-1-1M8 9h8M8 13h8M8 17h5" />,
  },
  {
    to: '/admin/clients',
    label: 'Clients',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  },
  {
    to: '/admin/reservations',
    label: 'Réservations',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />,
  },
]

// Coquille commune des pages staff : en-tête + nav par onglets (mobile-first)
export default function AdminLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-dark pb-32">
      <header className="px-6 pt-24 text-center">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Espace staff
        </p>
        <h1 className="font-lostar text-[2.4rem] leading-none text-rouge lg:text-[3rem]">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-md font-poppins text-[0.82rem] text-creme/55">{subtitle}</p>
        )}
      </header>

      {/* onglets — scroll horizontal sur mobile, centrés sur desktop */}
      <nav className="mx-auto mt-8 max-w-6xl px-5 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-poppins text-[0.76rem] font-medium transition ${
                  isActive
                    ? 'border-rouge bg-rouge text-creme'
                    : 'border-white/10 bg-[#240400] text-creme/70 hover:border-ambre/50 hover:text-ambre'
                }`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4">
                {t.icon}
              </svg>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mx-auto mt-6 max-w-6xl px-5 lg:mt-8 lg:px-8">{children}</div>
    </main>
  )
}

// Barre de recherche réutilisable des pages staff
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-creme/40">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#240400] py-3 pl-11 pr-4 font-poppins text-sm text-creme placeholder-creme/30 focus:border-ambre/50 focus:outline-none"
      />
    </div>
  )
}
