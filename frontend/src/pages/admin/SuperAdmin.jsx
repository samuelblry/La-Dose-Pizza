import { useState } from 'react'

const DUMMY_STATS = {
  revenue: '15 420 €',
  reservations: 124,
}

const INITIAL_EMPLOYEES = [
  { id: 1, first_name: 'Jean', last_name: 'Dupont', email: 'jean.dupont@ladosespizza.fr', role: 'Staff' },
  { id: 2, first_name: 'Alice', last_name: 'Martin', email: 'alice.martin@ladosespizza.fr', role: 'Chef' },
]

export default function SuperAdmin() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [tempPasswordMsg, setTempPasswordMsg] = useState('')
  const [newEmp, setNewEmp] = useState({ first_name: '', last_name: '', email: '', role: 'Staff' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [modalConfig, setModalConfig] = useState(null)

  const generatePassword = () => Math.random().toString(36).slice(-8)

  const handleAddEmployee = (e) => {
    e.preventDefault()
    if (!newEmp.first_name || !newEmp.last_name || !newEmp.email) return
    const pwd = generatePassword()
    const emp = {
      id: Date.now(),
      ...newEmp
    }
    setEmployees([...employees, emp])
    setTempPasswordMsg(`Nouvel employé ajouté. Mot de passe temporaire pour ${emp.first_name} : ${pwd}`)
    setNewEmp({ first_name: '', last_name: '', email: '', role: 'Staff' })
    setShowAddForm(false)
  }

  const handleRemoveEmployee = (id) => {
    setModalConfig({
      title: "Supprimer l'employé",
      message: "Voulez-vous vraiment supprimer cet employé ?",
      onConfirm: () => {
        setEmployees(employees.filter(e => e.id !== id))
        setTempPasswordMsg('')
        setModalConfig(null)
      }
    })
  }

  const handleResetPassword = (emp) => {
    setModalConfig({
      title: "Réinitialiser le mot de passe",
      message: `Voulez-vous réinitialiser le mot de passe de ${emp.first_name} ?`,
      onConfirm: () => {
        const pwd = generatePassword()
        setTempPasswordMsg(`Mot de passe réinitialisé pour ${emp.first_name}. Nouveau mot de passe temporaire : ${pwd}`)
        setModalConfig(null)
      }
    })
  }

  return (
    <main className="min-h-screen bg-dark pb-32">
      <header className="px-6 pt-24 text-center">
        <p className="mb-2 font-poppins text-[0.62rem] uppercase tracking-[0.3em] text-ambre">
          Espace Administrateur
        </p>
        <h1 className="font-lostar text-[2.4rem] leading-none text-rouge lg:text-[3rem]">Tableau de bord Admin</h1>
        <p className="mx-auto mt-3 max-w-md font-poppins text-[0.82rem] text-creme/55">
          Gestion des employés et statistiques globales.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-6xl px-5 lg:px-8">
        {/* Stats */}
        <h2 className="mb-4 font-poppins text-base font-semibold text-ambre">Statistiques Globales</h2>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#240400] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rouge/15 text-ambre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-4 font-lostar text-4xl leading-none text-creme">{DUMMY_STATS.revenue}</p>
            <p className="mt-2 font-poppins text-[0.78rem] text-creme/55">Chiffre d'affaires</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#240400] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rouge/15 text-ambre">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4M16 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            </div>
            <p className="mt-4 font-lostar text-4xl leading-none text-creme">{DUMMY_STATS.reservations}</p>
            <p className="mt-2 font-poppins text-[0.78rem] text-creme/55">Nombre de réservations</p>
          </div>
        </div>

        {/* Employés */}
        <div className="mb-4 flex items-center justify-between mt-10">
          <h2 className="font-poppins text-base font-semibold text-ambre">Gestion des employés</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-rouge px-4 py-2 font-poppins text-xs text-white transition hover:bg-rouge/80"
          >
            {showAddForm ? 'Annuler' : '+ Ajouter un employé'}
          </button>
        </div>

        {tempPasswordMsg && (
          <div className="mb-5 rounded-2xl border border-ambre/30 bg-ambre/10 px-4 py-3 text-center font-poppins text-[0.8rem] text-ambre">
            {tempPasswordMsg}
          </div>
        )}

        {showAddForm && (
          <form onSubmit={handleAddEmployee} className="mb-6 rounded-3xl border border-white/10 bg-[#240400] p-6">
            <h3 className="mb-4 font-poppins text-sm font-semibold text-creme">Nouvel employé</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Prénom"
                value={newEmp.first_name}
                onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-poppins text-sm text-creme outline-none focus:border-ambre"
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={newEmp.last_name}
                onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-poppins text-sm text-creme outline-none focus:border-ambre"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-poppins text-sm text-creme outline-none focus:border-ambre"
                required
              />
              <select
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2 font-poppins text-sm text-creme outline-none focus:border-ambre"
              >
                <option value="Staff" className="bg-dark text-creme">Staff</option>
                <option value="Chef" className="bg-dark text-creme">Chef</option>
              </select>
            </div>
            <button type="submit" className="mt-4 rounded-full bg-ambre px-5 py-2 font-poppins text-xs font-semibold text-dark transition hover:bg-ambre/80">
              Confirmer l'ajout
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {employees.map((emp) => (
            <div key={emp.id} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-[#240400] p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rouge font-lostar text-xl text-creme">
                {emp.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-poppins text-sm font-semibold text-creme">
                    {emp.first_name} {emp.last_name}
                  </p>
                  <span className="shrink-0 rounded-full bg-ambre/15 px-2.5 py-1 font-poppins text-[0.68rem] font-semibold text-ambre">
                    {emp.role}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-poppins text-[0.74rem] text-creme/55">{emp.email}</p>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleResetPassword(emp)}
                    className="rounded-full border border-ambre/30 px-3 py-1.5 font-poppins text-[0.7rem] text-ambre transition hover:bg-ambre hover:text-dark"
                  >
                    Réinitialiser MDP
                  </button>
                  <button
                    onClick={() => handleRemoveEmployee(emp.id)}
                    className="rounded-full border border-rouge/30 px-3 py-1.5 font-poppins text-[0.7rem] text-rouge transition hover:bg-rouge hover:text-creme"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="col-span-full rounded-3xl border border-white/10 bg-[#240400] py-10 text-center font-poppins text-sm text-creme/40">
              Aucun employé n'est enregistré.
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#240400] p-6 shadow-2xl">
            <h3 className="mb-2 font-poppins text-lg font-semibold text-rouge">{modalConfig.title}</h3>
            <p className="mb-6 font-poppins text-sm text-creme/70">{modalConfig.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalConfig(null)}
                className="rounded-full border border-creme/20 px-4 py-2 font-poppins text-xs text-creme transition hover:bg-creme/10"
              >
                Annuler
              </button>
              <button
                onClick={modalConfig.onConfirm}
                className="rounded-full bg-rouge px-4 py-2 font-poppins text-xs text-white transition hover:bg-rouge/80"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
