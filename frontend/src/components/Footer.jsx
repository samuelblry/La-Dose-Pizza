import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark px-7 pb-28 pt-14 text-creme lg:px-8 lg:pb-14 lg:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
          <div className="lg:max-w-xs lg:text-left">
            <img src="/img/logo/logo_long.svg" alt="La Dose Pizza" className="mx-auto w-48 lg:mx-0" />
            <p className="mt-3 text-center font-poppins text-[0.65rem] uppercase tracking-[0.25em] text-ambre lg:text-left">
              Finger-Licking Good
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 lg:mt-0 lg:gap-16">
            <div>
              <h4 className="font-lostar text-xl text-ambre">Le restaurant</h4>
              <ul className="mt-3 space-y-2 font-poppins text-sm text-creme/80">
                <li><Link to="/menu" className="transition hover:text-ambre">Notre carte</Link></li>
                <li><Link to="/panier" className="transition hover:text-ambre">Commander en ligne</Link></li>
                <li><Link to="/reservation" className="transition hover:text-ambre">Réserver une table</Link></li>
                <li><Link to="/mon-compte" className="transition hover:text-ambre">Points de fidélité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-lostar text-xl text-ambre">Contact</h4>
              <ul className="mt-3 space-y-2 font-poppins text-sm text-creme/80">
                <li>12 rue de la Pizza</li>
                <li>75011 Paris</li>
                <li>01 23 45 67 89</li>
                <li>
                  <a href="mailto:contact@ladosepizza.fr" className="transition hover:text-ambre">
                    contact@ladosepizza.fr
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-center font-poppins text-xs text-creme/60 lg:mt-14">
          © 2026 La Dose Pizza — Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
