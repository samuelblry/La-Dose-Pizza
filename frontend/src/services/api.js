const BASE = 'http://localhost:8000/api'

// Racine pour les fichiers media Django (images uploadées)
export const MEDIA_BASE = 'http://localhost:8000'

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

// Rafraîchit le token d'accès via le refresh token ; renvoie le nouveau token ou null
let refreshPromise = null
async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh')
  if (!refresh) return null
  const res = await fetch(`${BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) return null
  const data = await res.json()
  localStorage.setItem('token', data.access)
  if (data.refresh) localStorage.setItem('refresh', data.refresh)
  window.dispatchEvent(new CustomEvent('auth:refreshed', { detail: data }))
  return data.access
}

// fetch authentifié : injecte le token courant et rejoue une fois après refresh sur 401
async function authFetch(url, options = {}) {
  const build = (tok) => ({
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${tok}` },
  })
  let res = await fetch(url, build(localStorage.getItem('token')))
  if (res.status === 401 && localStorage.getItem('refresh')) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
    }
    const nouveau = await refreshPromise
    if (nouveau) {
      res = await fetch(url, build(nouveau))
    } else {
      window.dispatchEvent(new Event('auth:logout'))
    }
  }
  return res
}

export async function apiRegister(payload) {
  const res = await fetch(`${BASE}/auth/register/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiLogout(token, refresh) {
  await fetch(`${BASE}/auth/logout/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ refresh }),
  })
}

export async function apiMe() {
  const res = await authFetch(`${BASE}/users/me/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

// Modifie email / téléphone / adresse — PATCH /users/me/
export async function apiUpdateMe(token, payload) {
  const res = await authFetch(`${BASE}/users/me/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Change le mot de passe — PATCH /users/me/password/
export async function apiChangePassword(token, payload) {
  const res = await authFetch(`${BASE}/users/me/password/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Supprime le compte — DELETE /users/me/
export async function apiDeleteMe() {
  const res = await authFetch(`${BASE}/users/me/`, { method: 'DELETE' })
  if (!res.ok) throw await res.json()
}

export async function apiPizzas(token, params = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.append('search', params.search)
  if (params.dispoOnly) qs.append('dispo_only', 'true')
  if (params.ingredients?.length) qs.append('ingredients', params.ingredients.join(','))
  if (params.allergenes?.length) qs.append('allergenes_exclude', params.allergenes.join(','))
  if (params.tri && params.tri !== 'defaut') qs.append('ordering', params.tri)

  const url = `${BASE}/menu/pizzas/${qs.toString() ? '?' + qs.toString() : ''}`
  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiOrders() {
  const res = await authFetch(`${BASE}/orders/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCreateOrder(token, payload) {
  const res = await authFetch(`${BASE}/orders/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Télécharge la facture PDF (renvoie un blob)
export async function apiDownloadInvoice(orderId) {
  const res = await authFetch(`${BASE}/orders/${orderId}/invoice/`)
  if (!res.ok) throw new Error('Erreur')
  return res.blob()
}

// Crée un PaymentIntent Stripe pour une commande
export async function apiCreatePaymentIntent(token, orderId) {
  const res = await authFetch(`${BASE}/payments/create-intent/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ order_id: orderId }),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiReservations() {
  const res = await authFetch(`${BASE}/reservations/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCreateReservation(token, payload) {
  const res = await authFetch(`${BASE}/reservations/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiGetTablesAvailability(token, date, time) {
  const res = await authFetch(`${BASE}/reservations/tables/?date=${date}&time=${time}`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCancelReservation(token, id) {
  const res = await authFetch(`${BASE}/reservations/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status: 'annulee' }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

// Admin
export async function apiAdminStats() {
  const res = await authFetch(`${BASE}/admin/stats/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminOrders() {
  const res = await authFetch(`${BASE}/admin/orders/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminClients() {
  const res = await authFetch(`${BASE}/admin/clients/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminReservations() {
  const res = await authFetch(`${BASE}/admin/reservations/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPatchOrder(token, id, status) {
  const res = await authFetch(`${BASE}/admin/orders/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPatchReservation(token, id, status) {
  const res = await authFetch(`${BASE}/admin/reservations/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPizzas(token) {
  return apiPizzas(token)
}

export async function apiAdminCreatePizza(token, payload) {
  const isFormData = payload instanceof FormData
  const reqHeaders = isFormData ? {} : headers()
  const res = await authFetch(`${BASE}/menu/pizzas/`, {
    method: 'POST',
    headers: reqHeaders,
    body: isFormData ? payload : JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiAdminPatchPizza(token, id, payload) {
  const res = await authFetch(`${BASE}/menu/pizzas/${id}/`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiAdminDeletePizza(token, id) {
  const res = await authFetch(`${BASE}/menu/pizzas/${id}/`, { method: 'DELETE' })
  if (!res.ok) throw await res.json()
}

// Super Admin
export async function apiSuperAdminStats() {
  const res = await authFetch(`${BASE}/superadmin/stats/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiSuperAdminEmployees() {
  const res = await authFetch(`${BASE}/superadmin/employees/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiSuperAdminCreateEmployee(token, payload) {
  const res = await authFetch(`${BASE}/superadmin/employees/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiSuperAdminDeleteEmployee(token, id) {
  const res = await authFetch(`${BASE}/superadmin/employees/${id}/`, { method: 'DELETE' })
  if (!res.ok) throw await res.json()
}

export async function apiSuperAdminResetPassword(token, id) {
  const res = await authFetch(`${BASE}/superadmin/employees/${id}/reset-password/`, {
    method: 'POST',
    headers: headers(),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiSuperAdminUsers() {
  const res = await authFetch(`${BASE}/superadmin/users/`)
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiSuperAdminLogs() {
  const res = await authFetch(`${BASE}/superadmin/logs/`)
  if (!res.ok) throw await res.json()
  return res.json()
}
