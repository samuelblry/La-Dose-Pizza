import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [refresh, setRefresh] = useState(() => localStorage.getItem('refresh'))
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('is_admin') === 'true')

  const login = (accessToken, refreshToken, admin) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh', refreshToken)
    localStorage.setItem('is_admin', admin ? 'true' : 'false')
    setToken(accessToken)
    setRefresh(refreshToken)
    setIsAdmin(!!admin)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('is_admin')
    setToken(null)
    setRefresh(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ token, refresh, isAdmin, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
