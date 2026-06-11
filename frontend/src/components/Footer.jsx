export default function Footer() {
  return (
    <footer className="bg-dark px-7 pb-28 pt-14 text-creme">
      <img src="/img/logo/logo_long.svg" alt="La Dose Pizza" className="mx-auto w-48" />
      <p className="mt-3 text-center font-poppins text-[0.65rem] uppercase tracking-[0.25em] text-ambre">
        Finger-Licking Good
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-lostar text-xl text-ambre">Le restaurant</h4>
          <ul className="mt-3 space-y-2 font-poppins text-sm text-creme/80">
            <li>Notre carte</li>
            <li>Commander en ligne</li>
            <li>Réserver une table</li>
            <li>Points de fidélité</li>
          </ul>
        </div>
        <div>
          <h4 className="font-lostar text-xl text-ambre">Contact</h4>
          <ul className="mt-3 space-y-2 font-poppins text-sm text-creme/80">
            <li>12 rue de la Pizza</li>
            <li>75011 Paris</li>
            <li>01 23 45 67 89</li>
            <li>contact@ladosepizza.fr</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-5 text-center font-poppins text-xs text-creme/60">
        © 2026 La Dose Pizza — Tous droits réservés.
      </div>
    </footer>
  )
}
