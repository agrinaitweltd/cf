import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <main style={{ minHeight: '60vh' }} />
  }

  if (!user) {
    return <Navigate to="/cleaning/sign-in" replace />
  }

  return <>{children}</>
}
