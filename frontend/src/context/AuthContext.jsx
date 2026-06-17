import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [refresh, setRefresh] = useState(() => localStorage.getItem('refresh'))
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true')
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => localStorage.getItem('is_superadmin') === 'true')

  const login = (accessToken, refreshToken, admin, superAdmin) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh', refreshToken)
    localStorage.setItem('is_admin', admin ? 'true' : 'false')
    localStorage.setItem('is_superadmin', superAdmin ? 'true' : 'false')
    setToken(accessToken)
    setRefresh(refreshToken)
    setIsAdmin(!!admin)
    setIsSuperAdmin(!!superAdmin)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('is_admin')
    localStorage.removeItem('is_superadmin')
    setToken(null)
    setRefresh(null)
    setIsAdmin(false)
    setIsSuperAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ token, refresh, isAdmin, isSuperAdmin, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
