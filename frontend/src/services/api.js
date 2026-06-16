const BASE = 'http://localhost:8000/api'

// Racine pour les fichiers media Django (images uploadées)
export const MEDIA_BASE = 'http://localhost:8000'

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

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

export async function apiMe(token) {
  const res = await fetch(`${BASE}/users/me/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

// Modifie email / téléphone / adresse — PATCH /users/me/
export async function apiUpdateMe(token, payload) {
  const res = await fetch(`${BASE}/users/me/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Change le mot de passe — PATCH /users/me/password/
export async function apiChangePassword(token, payload) {
  const res = await fetch(`${BASE}/users/me/password/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

// Supprime le compte — DELETE /users/me/
export async function apiDeleteMe(token) {
  const res = await fetch(`${BASE}/users/me/`, {
    method: 'DELETE',
    headers: headers(token),
  })
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

export async function apiOrders(token) {
  const res = await fetch(`${BASE}/orders/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCreateOrder(token, payload) {
  const res = await fetch(`${BASE}/orders/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiReservations(token) {
  const res = await fetch(`${BASE}/reservations/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCreateReservation(token, payload) {
  const res = await fetch(`${BASE}/reservations/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiGetTablesAvailability(token, date, time) {
  const res = await fetch(`${BASE}/reservations/tables/?date=${date}&time=${time}`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiCancelReservation(token, id) {
  const res = await fetch(`${BASE}/reservations/${id}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status: 'annulee' }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

// Admin
export async function apiAdminStats(token) {
  const res = await fetch(`${BASE}/admin/stats/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminOrders(token) {
  const res = await fetch(`${BASE}/admin/orders/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminClients(token) {
  const res = await fetch(`${BASE}/admin/clients/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminReservations(token) {
  const res = await fetch(`${BASE}/admin/reservations/`, { headers: headers(token) })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPatchOrder(token, id, status) {
  const res = await fetch(`${BASE}/admin/orders/${id}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPatchReservation(token, id, status) {
  const res = await fetch(`${BASE}/admin/reservations/${id}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiAdminPizzas(token) {
  return apiPizzas(token)
}

export async function apiAdminCreatePizza(token, payload) {
  const isFormData = payload instanceof FormData;
  const reqHeaders = headers(token);
  if (isFormData) {
    delete reqHeaders['Content-Type'];
  }
  const res = await fetch(`${BASE}/menu/pizzas/`, {
    method: 'POST',
    headers: reqHeaders,
    body: isFormData ? payload : JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiAdminPatchPizza(token, id, payload) {
  const res = await fetch(`${BASE}/menu/pizzas/${id}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw data
  return data
}

export async function apiAdminDeletePizza(token, id) {
  const res = await fetch(`${BASE}/menu/pizzas/${id}/`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw await res.json()
}
