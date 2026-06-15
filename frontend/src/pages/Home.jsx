import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ATOUTS = ['Pâte levée 48h', 'Cuisson feu de bois', 'Produits frais']

const CHIFFRES = [
  { valeur: '48h', label: 'de levée de pâte' },
  { valeur: '100%', label: 'fait maison' },
  { valeur: '~30min', label: 'de livraison' },
]

const PLUS_LIVRAISON = ['Suivi de commande en temps réel', 'Commande en quelques clics']
const PLUS_RESERVATION = ['Confirmation immédiate', 'Jusqu\'à 20 convives']

export default function Home() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Réserver : connecté → /reservation, sinon → /connexion
  const handleReserver = () => navigate(isLoggedIn ? '/reservation' : '/connexion')

  // Commander : va sur la carte, le panier gère ensuite l'auth
  const handleCommander = () => navigate('/menu')

  return (
    <main>
      {/* Hero */}
      <section id="accueil" className="relative h-screen overflow-hidden bg-dark">
        {/* halos chauds pour la profondeur */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-rouge/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-ambre/10 blur-3xl" />
        {/* image ancrée en haut : on voit le haut de la pizza, le bas est rogné */}
        <img
          src="/img/background/background_pizza_hero.webp"
          alt=""
          className="pointer-events-none absolute inset-x-0 top-0 w-full select-none opacity-20 lg:left-auto lg:right-0 lg:w-[46%] lg:max-w-2xl lg:opacity-100"
        />
        {/* dégradé gauche : fond le bord coupé de l'image dans le noir (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] max-w-2xl bg-[linear-gradient(to_right,#1A0200,transparent_42%)] lg:block" />
        {/* dégradé bas : fond l'image dans le noir et garde les CTA lisibles */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-dark via-dark/70 to-transparent" />

        <div className="absolute inset-x-0 top-[22%] lg:inset-y-0">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center px-6 text-center lg:items-start lg:justify-center lg:px-8 lg:text-left">
            <p className="mb-3 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre lg:text-xs">
              Pizzeria artisanale
            </p>
            <h1 className="whitespace-nowrap font-lostar text-[2.9rem] leading-none text-rouge lg:text-[6rem]">
              La Dose Pizza
            </h1>
            <p className="mt-3 font-poppins text-[0.7rem] uppercase tracking-[0.25em] text-rouge lg:mt-4 lg:text-sm">
              Finger-Licking Good
            </p>
            <p className="mt-6 max-w-[270px] font-poppins text-[0.85rem] leading-relaxed text-creme/80 lg:mt-7 lg:max-w-md lg:text-base">
              Des pizzas cuites au feu de bois, préparées avec des produits
              frais et livrées chez vous.
            </p>
            <div className="mt-8 flex w-full max-w-[300px] flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center lg:mt-10 lg:justify-start">
              {/* → /menu (pas besoin d'être connecté pour voir la carte) */}
              <button
                onClick={handleCommander}
                className="h-12 rounded-full bg-rouge px-6 font-poppins text-sm font-medium tracking-[0.05em] text-creme shadow-lg shadow-rouge/30 transition hover:bg-rouge/90 hover:shadow-rouge/40 sm:flex-1 lg:flex-none lg:px-9"
              >
                Commander en ligne
              </button>
              {/* → /reservation si connecté, sinon /connexion */}
              <button
                onClick={handleReserver}
                className="h-12 rounded-full border border-creme/30 px-6 font-poppins text-sm font-medium tracking-[0.05em] text-creme transition hover:border-creme hover:bg-creme/5 sm:flex-1 lg:flex-none lg:px-9"
              >
                Réserver une table
              </button>
            </div>

            {/* atouts artisanaux */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:mt-9 lg:justify-start">
              {ATOUTS.map((a) => (
                <li key={a} className="flex items-center gap-1.5 font-poppins text-[0.72rem] text-creme/70 lg:text-[0.8rem]">
                  <IconCheck className="h-3.5 w-3.5 text-ambre" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ancre vers la section suivante */}
        <a
          href="#art"
          aria-label="Découvrir"
          className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-2 text-creme/60 transition hover:text-ambre lg:bottom-10"
        >
          <span className="font-poppins text-[0.6rem] uppercase tracking-[0.25em]">
            Ouvert tous les jours · 11h – 23h
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5 animate-bounce motion-reduce:animate-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* L'art de la pizza */}
      <section id="art" className="scroll-mt-16 bg-creme pb-16 pt-14 text-dark lg:py-28">
        <div className="mx-auto w-full max-w-6xl px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div className="lg:order-2">
            <h2 className="font-lostar text-[2.4rem] leading-tight text-rouge lg:text-[3.6rem]">
              L&apos;art de la<br />pizza
            </h2>
            <p className="mt-6 font-poppins text-[0.9rem] leading-relaxed tracking-[0.02em] lg:mt-8 lg:max-w-md lg:text-base">
              Chez nous, chaque pizza est une création. Une pâte pétrie à la main
              et levée 48 heures, une sauce tomate maison, une mozzarella fondante
              et des ingrédients choisis avec soin. Tout le savoir-faire de notre
              pizzaïolo se retrouve dans chaque bouchée.
            </p>

            {/* chiffres-clés */}
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-dark/10 pt-6 lg:mt-10 lg:max-w-md lg:gap-6 lg:pt-8">
              {CHIFFRES.map((c) => (
                <div key={c.valeur}>
                  <dt className="font-lostar text-[2rem] leading-none text-rouge lg:text-[2.6rem]">{c.valeur}</dt>
                  <dd className="mt-1.5 font-poppins text-[0.68rem] leading-snug text-dark/60 lg:text-[0.78rem]">{c.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto mt-14 w-[80%] lg:order-1 lg:mt-0 lg:w-full lg:max-w-md">
            <img
              src="/img/element/pizza_qui_vole.png"
              alt=""
              className="pointer-events-none absolute left-1/2 top-0 z-10 w-32 -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-md lg:w-44"
            />
            <div className="overflow-hidden rounded-t-[999px] rounded-b-[18px]">
              <img
                src="/img/element/pizzaiolo_envoie_pizza.png"
                alt=""
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nos services */}
      <section id="services" className="scroll-mt-16 bg-ambre pb-32 pt-14 text-dark lg:pb-28 lg:pt-24">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
          <h2 className="text-center font-lostar text-[2.4rem] text-rouge lg:text-[3.4rem]">Nos services</h2>
          <p className="mt-1 text-center font-poppins text-[0.72rem] uppercase tracking-[0.2em] text-dark lg:mt-2 lg:text-sm">
            Découvrez nos expériences
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-16 lg:mt-16 lg:grid-cols-2 lg:gap-12">
            <ServiceCard
              titre={<>Livraison<br />à domicile</>}
              texte="Commandez en ligne et faites-vous livrer une pizza encore chaude, directement à votre porte en un temps record."
              plus={PLUS_LIVRAISON}
              cta="Commander"
              onCta={handleCommander}
              img="/img/element/scooter.png"
              imgClass="-bottom-6 right-[-6%]"
            />
            <ServiceCard
              titre={<>Réserver<br />sur place</>}
              texte="Réservez votre table et venez savourer nos pizzas dans une ambiance conviviale et chaleureuse, en famille ou entre amis."
              plus={PLUS_RESERVATION}
              cta="Réserver"
              onCta={handleReserver}
              img="/img/element/assiette.png"
              imgClass="-bottom-4 left-[-6%]"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

// Carte arche d'un service
function ServiceCard({ titre, texte, plus, cta, onCta, img, imgClass }) {
  return (
    <div className="relative mx-auto flex min-h-[24rem] w-[78%] flex-col rounded-t-[999px] rounded-b-[20px] bg-creme pb-10 sm:w-[62%] lg:w-full lg:max-w-sm">
      <div className="flex flex-1 flex-col px-7 pt-12 text-center">
        <h3 className="font-lostar text-[1.7rem] text-rouge lg:text-3xl">{titre}</h3>
        <p className="mt-3 font-poppins text-[0.74rem] leading-snug text-dark/80 lg:text-[0.82rem]">{texte}</p>

        <ul className="mx-auto mt-4 flex w-fit flex-col gap-1.5 text-left">
          {plus.map((p) => (
            <li key={p} className="flex items-center gap-2 font-poppins text-[0.72rem] text-dark/70 lg:text-[0.78rem]">
              <IconCheck className="h-3.5 w-3.5 shrink-0 text-rouge" />
              {p}
            </li>
          ))}
        </ul>

        <button
          onClick={onCta}
          className="mt-auto self-center pt-5 font-poppins text-[0.7rem] font-medium uppercase tracking-[0.12em] text-rouge transition hover:text-dark"
        >
          {cta} →
        </button>
      </div>
      <img src={img} alt="" className={`absolute w-[40%] drop-shadow-md ${imgClass}`} />
    </div>
  )
}

function IconCheck({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
