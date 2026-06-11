import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <section className="relative h-screen overflow-hidden bg-dark">
        <img
          src="/img/background/background_pizza_hero.webp"
          alt=""
          className="pointer-events-none absolute inset-x-0 top-0 w-full select-none opacity-20"
        />
        <div className="absolute inset-x-0 top-[22%] flex flex-col items-center px-6 text-center">
          <p className="mb-3 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
            Pizzeria artisanale
          </p>
          <h1 className="whitespace-nowrap font-lostar text-[2.9rem] leading-none text-rouge">
            La Dose Pizza
          </h1>
          <p className="mt-3 font-poppins text-[0.7rem] uppercase tracking-[0.25em] text-rouge">
            Finger-Licking Good
          </p>
          <p className="mt-6 max-w-[270px] font-poppins text-[0.85rem] leading-relaxed text-creme/80">
            Des pizzas cuites au feu de bois, préparées avec des produits
            frais et livrées chez vous.
          </p>
          <div className="mt-8 flex w-full max-w-[300px] flex-col gap-3">
            {/* → /menu (pas besoin d'être connecté pour voir la carte) */}
            <button
              onClick={handleCommander}
              className="h-12 rounded-full bg-rouge font-poppins text-sm font-medium tracking-[0.05em] text-creme"
            >
              Commander en ligne
            </button>
            {/* → /reservation si connecté, sinon /connexion */}
            <button
              onClick={handleReserver}
              className="h-12 rounded-full border border-creme/30 font-poppins text-sm font-medium tracking-[0.05em] text-creme"
            >
              Réserver une table
            </button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-2 text-creme/60">
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
        </div>
      </section>

      {/* L'art de la pizza */}
      <section className="bg-creme px-7 pb-16 pt-14 text-dark">
        <h2 className="font-lostar text-[2.4rem] leading-tight text-rouge">
          L&apos;art de la<br />pizza
        </h2>
        <p className="mt-6 font-poppins text-[0.9rem] leading-relaxed tracking-[0.02em]">
          Chez nous, chaque pizza est une création. Une pâte pétrie à la main
          et levée 48 heures, une sauce tomate maison, une mozzarella fondante
          et des ingrédients choisis avec soin. Tout le savoir-faire de notre
          pizzaïolo se retrouve dans chaque bouchée.
        </p>
        <div className="relative mx-auto mt-14 w-[80%]">
          <img
            src="/img/element/pizza_qui_vole.png"
            alt=""
            className="pointer-events-none absolute left-1/2 top-0 z-10 w-32 -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-md"
          />
          <div className="overflow-hidden rounded-t-[999px] rounded-b-[18px]">
            <img
              src="/img/element/pizzaiolo_envoie_pizza.png"
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Nos services */}
      <section className="bg-ambre px-7 pb-32 pt-14 text-dark">
        <h2 className="text-center font-lostar text-[2.4rem] text-rouge">Nos services</h2>
        <p className="mt-1 text-center font-poppins text-[0.72rem] uppercase tracking-[0.2em] text-dark">
          Découvrez nos expériences
        </p>

        <div className="relative mx-auto mt-12 h-80 w-[72%] rounded-t-[999px] rounded-b-[20px] bg-creme">
          <div className="px-6 pt-12 text-center">
            <h3 className="font-lostar text-[1.7rem] text-rouge">Livraison<br />à domicile</h3>
            <p className="mt-3 font-poppins text-[0.74rem] leading-snug text-dark/80">
              Commandez en ligne et faites-vous livrer une pizza encore
              chaude, directement à votre porte.
            </p>
            <button
              onClick={handleCommander}
              className="mt-4 inline-block font-poppins text-[0.7rem] font-medium uppercase tracking-[0.12em] text-rouge"
            >
              Commander →
            </button>
          </div>
          <img
            src="/img/element/scooter.png"
            alt=""
            className="absolute -bottom-6 right-[-6%] w-[40%] drop-shadow-md"
          />
        </div>

        <div className="relative mx-auto mt-14 h-80 w-[72%] rounded-t-[999px] rounded-b-[20px] bg-creme">
          <div className="px-6 pt-12 text-center">
            <h3 className="font-lostar text-[1.7rem] text-rouge">Réserver<br />sur place</h3>
            <p className="mt-3 font-poppins text-[0.74rem] leading-snug text-dark/80">
              Réservez votre table et venez savourer nos pizzas dans une
              ambiance conviviale et chaleureuse.
            </p>
            <button
              onClick={handleReserver}
              className="mt-4 inline-block font-poppins text-[0.7rem] font-medium uppercase tracking-[0.12em] text-rouge"
            >
              Réserver →
            </button>
          </div>
          <img
            src="/img/element/assiette.png"
            alt=""
            className="absolute -bottom-4 left-[-6%] w-[40%] drop-shadow-md"
          />
        </div>
      </section>
    </main>
  )
}
