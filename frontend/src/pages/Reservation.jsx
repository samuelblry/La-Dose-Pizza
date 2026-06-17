// Page réservation — POST /api/reservations/
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiCreateReservation, apiGetTablesAvailability } from '../services/api'

const CRENEAUX_MIDI = ['12:00', '12:30', '13:00', '13:30']
const CRENEAUX_SOIR = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
const today = new Date().toISOString().split('T')[0]

// Position fixe de chaque table dans le plan (% de la zone de rendu)
// zones : fenêtre-gauche, centre, fond, bar, privatisable
const TABLE_LAYOUT = [
  { num: 1,  cap: 2,  x: 12, y: 18, zone: 'Fenêtre' },
  { num: 2,  cap: 2,  x: 12, y: 42, zone: 'Fenêtre' },
  { num: 3,  cap: 4,  x: 38, y: 20, zone: 'Salle' },
  { num: 4,  cap: 4,  x: 62, y: 20, zone: 'Salle' },
  { num: 5,  cap: 4,  x: 38, y: 50, zone: 'Salle' },
  { num: 6,  cap: 4,  x: 62, y: 50, zone: 'Salle' },
  { num: 7,  cap: 6,  x: 30, y: 78, zone: 'Fond' },
  { num: 8,  cap: 6,  x: 68, y: 78, zone: 'Fond' },
  { num: 9,  cap: 2,  x: 88, y: 35, zone: 'Bar' },
  { num: 10, cap: 8,  x: 88, y: 65, zone: 'Privatisable' },
]

export default function Reservation() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [convives, setConvives] = useState(2)
  const [erreur, setErreur] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [tables, setTables] = useState([])
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [loadingTables, setLoadingTables] = useState(false)

  useEffect(() => {
    if (date && heure) {
      setLoadingTables(true)
      apiGetTablesAvailability(token, date, heure)
        .then((data) => { setTables(data); setSelectedTableId(null) })
        .catch(() => setErreur('Erreur lors du chargement des tables.'))
        .finally(() => setLoadingTables(false))
    } else {
      setTables([])
      setSelectedTableId(null)
    }
  }, [date, heure, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    if (!date) return setErreur('Choisissez une date.')
    if (!heure) return setErreur('Choisissez un créneau horaire.')
    if (!selectedTableId) return setErreur('Choisissez une table sur le plan.')
    setSaving(true)
    try {
      const data = await apiCreateReservation(token, {
        reservation_date: date,
        reservation_time: heure,
        guest_count: convives,
        table_id: selectedTableId,
      })
      setConfirmation(data)
    } catch (err) {
      setErreur(err?.error || err?.detail || 'Aucune table disponible pour ce créneau.')
    } finally {
      setSaving(false)
    }
  }

  if (confirmation) {
    return (
      <PageConfirmation
        data={confirmation}
        date={date}
        heure={heure}
        convives={convives}
        onCompte={() => navigate('/mon-compte')}
        onAccueil={() => navigate('/')}
      />
    )
  }

  // Fusionner données API avec layout fixe
  const tablesMap = Object.fromEntries(tables.map(t => [t.table_number, t]))
  const selectedTable = TABLE_LAYOUT.find(tl => {
    const api = tablesMap[tl.num]
    return api && api.id === selectedTableId
  })

  const planActif = Boolean(date && heure)

  return (
    <main className="min-h-screen bg-creme pb-28 lg:pb-20">

      {/* ── Héros ── */}
      <header className="relative overflow-hidden bg-dark px-6 pt-28 pb-20 text-center lg:pt-32 lg:pb-28">
        <div className="pointer-events-none absolute -left-24 -top-10 h-72 w-72 rounded-full bg-rouge/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-ambre/15 blur-3xl" />
        <img
          src="/img/element/assiette.png"
          alt=""
          className="pointer-events-none absolute right-4 top-1/2 hidden w-40 -translate-y-1/2 select-none opacity-80 drop-shadow-2xl lg:block xl:right-24 xl:w-52"
        />
        <div className="relative mx-auto max-w-xl lg:mx-0 lg:max-w-2xl lg:px-8 lg:text-left">
          <p className="mb-3 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-ambre">
            Sur place · La Dose Pizza
          </p>
          <h1 className="font-lostar text-[2.9rem] leading-[0.95] text-creme lg:text-[4.6rem]">
            Réservez<br className="hidden lg:block" /> votre table
          </h1>
          <p className="mx-auto mt-5 max-w-md font-poppins text-sm leading-relaxed text-creme/70 lg:mx-0">
            Trois étapes, et c'est tout. Choisissez le moment, le nombre de
            convives, puis votre place sur le plan de la salle.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-lg px-5 lg:mt-10 lg:max-w-6xl lg:px-8">

        {erreur && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-rouge/25 bg-rouge/10 px-5 py-4">
            <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-rouge" />
            <p className="font-poppins text-sm font-medium text-rouge">{erreur}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

          {/* ── Colonne des étapes ── */}
          <div className="flex flex-col gap-6 lg:flex-1">

            {/* Étape 1 — Quand */}
            <StepCard num={1} titre="Quand venez-vous ?" icon={<IconCalendar />}>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="font-poppins text-xs font-medium uppercase tracking-wider text-dark/45">Date</span>
                  <input
                    type="date"
                    name="reservation_date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-2 w-full rounded-xl border border-dark/15 bg-creme/40 px-4 py-3 font-poppins text-sm text-dark transition [color-scheme:light] focus:border-rouge focus:outline-none focus:ring-2 focus:ring-rouge/20"
                  />
                </label>
                <div className="hidden items-end sm:flex">
                  <p className="font-poppins text-xs leading-relaxed text-dark/45">
                    Service le midi <span className="text-dark/30">·</span> 12h – 13h30<br />
                    et le soir <span className="text-dark/30">·</span> 19h – 21h30
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <SlotGroup label="Midi" creneaux={CRENEAUX_MIDI} heure={heure} setHeure={setHeure} />
                <SlotGroup label="Soir" creneaux={CRENEAUX_SOIR} heure={heure} setHeure={setHeure} />
              </div>
            </StepCard>

            {/* Étape 2 — Combien */}
            <StepCard num={2} titre="Combien serez-vous ?" icon={<IconUsers />}>
              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-creme/50 p-4">
                <div className="font-poppins">
                  <p className="font-lostar text-[2.4rem] leading-none text-rouge">{convives}</p>
                  <p className="mt-1 text-xs text-dark/50">convive{convives > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <StepBtn
                    onClick={() => setConvives(n => Math.max(1, n - 1))}
                    disabled={convives <= 1}
                    aria-label="Retirer un convive"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                      <path strokeLinecap="round" d="M5 12h14" />
                    </svg>
                  </StepBtn>
                  <StepBtn
                    onClick={() => setConvives(n => Math.min(20, n + 1))}
                    disabled={convives >= 20}
                    aria-label="Ajouter un convive"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </StepBtn>
                </div>
              </div>
              <p className="mt-3 font-poppins text-xs text-dark/40">
                Plus de 20 personnes ? Contactez-nous, on privatise la salle.
              </p>
            </StepCard>

            {/* Étape 3 — Où */}
            <StepCard num={3} titre="Choisissez votre table" icon={<IconPin />}>
              {planActif ? (
                <>
                  <div className="mb-4 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Dot color="bg-beige" label="Libre" />
                    <Dot color="bg-rouge/60" label="Réservée" />
                    <Dot color="bg-ambre" label="Choisie" />
                  </div>

                  {loadingTables ? (
                    <div className="flex h-56 items-center justify-center rounded-2xl bg-[#23100a]">
                      <Spinner className="h-6 w-6 text-ambre" />
                    </div>
                  ) : (
                    <FloorPlan
                      layout={TABLE_LAYOUT}
                      tablesMap={tablesMap}
                      convives={convives}
                      selectedTableId={selectedTableId}
                      onSelect={setSelectedTableId}
                    />
                  )}

                  <p className="mt-3 text-center font-poppins text-sm">
                    {selectedTable ? (
                      <span className="text-rouge">
                        <span className="font-semibold">Table {selectedTable.num}</span>
                        {' · '}{selectedTable.zone}{' · '}{selectedTable.cap} places
                      </span>
                    ) : (
                      <span className="text-dark/45">Touchez une table libre pour la sélectionner.</span>
                    )}
                  </p>
                </>
              ) : (
                <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dark/15 bg-creme/40 px-6 py-10 text-center">
                  <IconPin className="h-7 w-7 text-rouge/40" />
                  <p className="max-w-xs font-poppins text-sm text-dark/50">
                    Sélectionnez d'abord une date et un créneau pour découvrir
                    les tables disponibles.
                  </p>
                </div>
              )}
            </StepCard>
          </div>

          {/* ── Récap + CTA (desktop : sticky) ── */}
          <aside className="lg:w-80 lg:shrink-0 lg:sticky lg:top-28">
            <RecapTicket
              date={date}
              heure={heure}
              convives={convives}
              selectedTable={selectedTable}
            />
            <button
              type="submit"
              disabled={saving}
              className="group mt-4 hidden w-full items-center justify-center gap-2.5 rounded-2xl bg-rouge px-6 py-4 font-poppins text-sm font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90 disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
            >
              {saving ? (
                <><Spinner className="h-4 w-4" /> Réservation…</>
              ) : (
                <>
                  Réserver ma table
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </aside>
        </form>
      </div>

      {/* ── Barre CTA mobile ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-dark/10 bg-creme/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0 flex-1 font-poppins">
            <p className="truncate text-xs text-dark/50">
              {selectedTable
                ? `Table ${selectedTable.num} · ${convives} pers.`
                : `${convives} convive${convives > 1 ? 's' : ''}`}
            </p>
            <p className="truncate font-lostar text-base text-rouge">
              {date && heure ? `${fmtDate(date)} · ${heure}` : 'Complétez les étapes'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-rouge px-6 py-3.5 font-poppins text-sm font-semibold uppercase tracking-[0.08em] text-creme transition hover:bg-rouge/90 disabled:opacity-50"
          >
            {saving ? <Spinner className="h-4 w-4" /> : 'Réserver'}
          </button>
        </div>
      </div>
    </main>
  )
}

// ── Plan de salle ──────────────────────────────────────────────────────────

// % de largeur container pour chaque capacité
const TABLE_IMG = {
  2: { src: '/img/tables/table2.png', wPct: 11, hPct: 18 },
  4: { src: '/img/tables/table4.png', wPct: 14, hPct: 22 },
  6: { src: '/img/tables/table6.png', wPct: 19, hPct: 20 },
  8: { src: '/img/tables/table8.png', wPct: 23, hPct: 21 },
}

function FloorPlan({ layout, tablesMap, convives, selectedTableId, onSelect }) {
  return (
    <div
      className="relative mt-5 overflow-hidden rounded-2xl border border-[#3a1c10] bg-[#23100a] shadow-inner"
      style={{ paddingBottom: '61.7%' }}
    >
      {/* Fond SVG — salle simple : bar, toilettes, entrée */}
      <svg
        viewBox="0 0 600 370"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect width="600" height="370" fill="#23100a" />
        <rect x="2" y="2" width="596" height="366" fill="none" stroke="#5a2a18" strokeWidth="2.5" rx="12" />

        {/* Bar — mur droit */}
        <line x1="595" y1="152" x2="595" y2="218" stroke="#E6A557" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
        <text x="565" y="189" fill="#E0BB93" fillOpacity="0.6" fontSize="10" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2">BAR</text>

        {/* Toilettes — mur gauche */}
        <line x1="5" y1="212" x2="5" y2="278" stroke="#E0BB93" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
        <text x="46" y="248" fill="#E0BB93" fillOpacity="0.55" fontSize="9" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">TOILETTES</text>

        {/* Entrée — mur du bas */}
        <rect x="238" y="361" width="124" height="7" fill="#B43024" rx="3.5" />
        <text x="300" y="353" fill="#E6A557" fillOpacity="0.8" fontSize="8.5" fontFamily="sans-serif" textAnchor="middle" letterSpacing="2.5">ENTRÉE</text>
      </svg>

      {/* Tables — img HTML positionnées absolument */}
      {layout.map(tl => {
        const api = tablesMap[tl.num]
        const isReserved = api?.is_reserved ?? false
        const tooSmall = tl.cap < convives
        const disabled = isReserved || tooSmall
        const isSelected = api && api.id === selectedTableId
        const img = TABLE_IMG[tl.cap] ?? TABLE_IMG[4]

        let imgFilter
        if (isSelected)      imgFilter = 'drop-shadow(0 0 5px #e6a557) drop-shadow(0 0 11px rgba(230,165,87,0.55))'
        else if (isReserved) imgFilter = 'grayscale(0.6) sepia(0.5) saturate(1.6) hue-rotate(320deg) brightness(0.5) opacity(0.5)'
        else if (tooSmall)   imgFilter = 'grayscale(1) brightness(0.4) opacity(0.32)'

        return (
          <button
            key={tl.num}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && api && onSelect(api.id)}
            aria-label={`Table ${tl.num}, ${tl.cap} places${isReserved ? ', réservée' : tooSmall ? ', trop petite' : ', libre'}`}
            aria-pressed={isSelected}
            title={`Table ${tl.num} · ${tl.zone} · ${tl.cap} places`}
            className="group"
            style={{
              position: 'absolute',
              left: `${tl.x}%`,
              top: `${tl.y}%`,
              width: `${img.wPct}%`,
              height: `${img.hPct}%`,
              transform: 'translate(-50%, -50%)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: 0,
              background: 'none',
              border: 'none',
            }}
          >
            <span
              className={`block h-full w-full transition-transform duration-200 ease-out ${
                disabled ? '' : 'group-hover:scale-110 group-focus-visible:scale-110'
              } ${isSelected ? 'scale-110' : ''}`}
            >
              <img
                src={img.src}
                alt=""
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: imgFilter }}
              />
            </span>

            {/* Numéro */}
            <span style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              color: isSelected ? '#e6a557' : disabled ? '#ffffff35' : '#e0bb93aa',
              whiteSpace: 'nowrap',
            }}>
              T{tl.num}
            </span>

            {/* Badge réservée */}
            {isReserved && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '19px', height: '19px',
                borderRadius: '50%',
                background: '#b43024',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#fff',
                pointerEvents: 'none',
              }}>✕</span>
            )}

            {/* Badge sélectionnée */}
            {isSelected && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '21px', height: '21px',
                borderRadius: '50%',
                background: '#e6a557',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', color: '#1A0200', fontWeight: 'bold',
                pointerEvents: 'none',
                boxShadow: '0 0 0 3px rgba(230,165,87,0.25)',
              }}>✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Confirmation ────────────────────────────────────────────────────────────

function PageConfirmation({ data, date, heure, convives, onCompte, onAccueil }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-creme px-6 pb-16 pt-28 text-center">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 m-auto h-40 w-40 rounded-full bg-ambre/25 blur-3xl" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rouge text-creme shadow-lg shadow-rouge/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-9 w-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <p className="mt-6 font-poppins text-[0.7rem] uppercase tracking-[0.32em] text-rouge">Réservation confirmée</p>
      <h1 className="mt-2 font-lostar text-[3rem] leading-none text-dark">À bientôt !</h1>
      <p className="mt-3 max-w-sm font-poppins text-sm leading-relaxed text-dark/55">
        Votre table vous attend. Retrouvez le récapitulatif à tout moment
        dans votre compte.
      </p>

      <div className="mt-8 w-full max-w-xs">
        <Ticket
          date={date}
          heure={heure}
          convives={convives}
          tableLabel={data?.table_number != null ? `N° ${data.table_number}` : null}
        />
      </div>

      <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={onCompte}
          className="rounded-2xl bg-rouge py-3.5 font-poppins text-sm font-semibold uppercase tracking-[0.1em] text-creme shadow-lg shadow-rouge/25 transition hover:bg-rouge/90"
        >
          Voir mes réservations
        </button>
        <button
          onClick={onAccueil}
          className="rounded-2xl border border-dark/15 py-3.5 font-poppins text-sm text-dark/60 transition hover:border-dark/35 hover:text-dark"
        >
          Retour à l'accueil
        </button>
      </div>
    </main>
  )
}

// ── Composants UI ─────────────────────────────────────────────────────────

function StepCard({ num, titre, icon, children }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_4px_30px_-14px_rgba(26,2,0,0.3)] ring-1 ring-dark/5 lg:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rouge font-lostar text-base text-creme">
          {num}
        </span>
        <h2 className="flex items-center gap-2 font-lostar text-xl text-dark lg:text-2xl">
          {titre}
        </h2>
        <span className="ml-auto text-rouge/30">{icon}</span>
      </div>
      {children}
    </section>
  )
}

function SlotGroup({ label, creneaux, heure, setHeure }) {
  return (
    <div>
      <p className="mb-2 font-poppins text-xs font-medium uppercase tracking-wider text-dark/45">{label}</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {creneaux.map(c => {
          const active = heure === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setHeure(c)}
              aria-pressed={active}
              className={`rounded-xl border py-2.5 font-poppins text-sm tabular-nums transition ${
                active
                  ? 'border-rouge bg-rouge text-creme shadow-sm shadow-rouge/30'
                  : 'border-dark/15 bg-white text-dark/70 hover:border-rouge/50 hover:text-rouge'
              }`}
            >
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepBtn({ children, onClick, disabled, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-rouge/30 bg-white text-rouge transition hover:border-rouge hover:bg-rouge hover:text-creme disabled:cursor-not-allowed disabled:border-dark/10 disabled:text-dark/20 disabled:hover:bg-white"
      {...props}
    >
      {children}
    </button>
  )
}

function Dot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-poppins text-xs text-dark/55">{label}</span>
    </div>
  )
}

// Ticket récap affiché pendant la saisie (carte sombre, accent ambre)
function RecapTicket({ date, heure, convives, selectedTable }) {
  return (
    <Ticket
      date={date}
      heure={heure}
      convives={convives}
      tableLabel={selectedTable ? `N° ${selectedTable.num} · ${selectedTable.zone}` : null}
      titre="Votre réservation"
    />
  )
}

// Ticket réutilisable (récap + confirmation)
function Ticket({ date, heure, convives, tableLabel, titre = 'Votre table' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-rouge/15 bg-white shadow-[0_4px_30px_-14px_rgba(26,2,0,0.3)]">
      <div className="flex items-center gap-2 bg-rouge px-5 py-3">
        <IconTicket className="h-4 w-4 text-creme" />
        <p className="font-poppins text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-creme">{titre}</p>
      </div>
      <div className="space-y-3 px-5 py-5 text-left">
        <TicketRow label="Date" value={date ? fmtDate(date) : '—'} />
        <TicketRow label="Heure" value={heure || '—'} />
        <TicketRow label="Convives" value={`${convives} personne${convives > 1 ? 's' : ''}`} />
        <TicketRow label="Table" value={tableLabel || '—'} accent />
      </div>
    </div>
  )
}

function TicketRow({ label, value, accent }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-dark/10 pb-3 font-poppins text-sm last:border-0 last:pb-0">
      <span className="text-dark/45">{label}</span>
      <span className={accent ? 'font-lostar text-lg text-rouge' : 'font-medium text-dark'}>{value}</span>
    </div>
  )
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function IconAlert({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

function IconCalendar({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconUsers({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconPin({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconArrow({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function IconTicket({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  )
}

const fmtDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return d
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
}
