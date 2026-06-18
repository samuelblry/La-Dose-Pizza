import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [refresh, setRefresh] = useState(() => localStorage.getItem('refresh'))
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true')
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => localStorage.getItem('is_superadmin') === 'true')
  const [isStaff, setIsStaff] = useState(() => localStorage.getItem('is_staff') === 'true')

  const login = (accessToken, refreshToken, admin, superAdmin, staff) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh', refreshToken)
    localStorage.setItem('is_admin', admin ? 'true' : 'false')
    localStorage.setItem('is_superadmin', superAdmin ? 'true' : 'false')
    localStorage.setItem('is_staff', staff ? 'true' : 'false')
    setToken(accessToken)
    setRefresh(refreshToken)
    setIsAdmin(!!admin)
    setIsSuperAdmin(!!superAdmin)
    setIsStaff(!!staff)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('is_admin')
    localStorage.removeItem('is_superadmin')
    localStorage.removeItem('is_staff')
    setToken(null)
    setRefresh(null)
    setIsAdmin(false)
    setIsSuperAdmin(false)
    setIsStaff(false)
  }

  // Synchro avec le wrapper api : token rafraîchi ou refresh expiré (déconnexion)
  useEffect(() => {
    const onRefreshed = (e) => {
      setToken(e.detail.access)
      if (e.detail.refresh) setRefresh(e.detail.refresh)
    }
    window.addEventListener('auth:refreshed', onRefreshed)
    window.addEventListener('auth:logout', logout)
    return () => {
      window.removeEventListener('auth:refreshed', onRefreshed)
      window.removeEventListener('auth:logout', logout)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ token, refresh, isAdmin, isSuperAdmin, isStaff, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
