const BASE = 'http://localhost:8000/api'

const headers = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function apiRegister(email, password, phone) {
  const res = await fetch(`${BASE}/auth/register/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password, phone }),
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

export async function apiPizzas(token) {
  const res = await fetch(`${BASE}/menu/pizzas/`, { headers: headers(token) })
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
  const res = await fetch(`${BASE}/menu/pizzas/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(payload),
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
