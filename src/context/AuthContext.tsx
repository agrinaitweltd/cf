import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    profile: { fullName: string; phone?: string; postcode?: string; address?: string }
  ) => Promise<{ error: string | null; userId: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  verifySignupOtp: (email: string, token: string) => Promise<{ error: string | null }>
  verifyRecoveryOtp: (email: string, token: string) => Promise<{ error: string | null }>
  resendSignupOtp: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp: AuthContextValue['signUp'] = async (email, password, profile) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profile.fullName,
          phone: profile.phone ?? null,
          postcode: profile.postcode ?? null,
          address: profile.address ?? null,
        },
      },
    })
    return { error: error?.message ?? null, userId: data.user?.id ?? null }
  }

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/cleaning/dashboard` },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/cleaning/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  const updatePassword: AuthContextValue['updatePassword'] = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }

  const verifySignupOtp: AuthContextValue['verifySignupOtp'] = async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    return { error: error?.message ?? null }
  }

  const verifyRecoveryOtp: AuthContextValue['verifyRecoveryOtp'] = async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
    return { error: error?.message ?? null }
  }

  const resendSignupOtp: AuthContextValue['resendSignupOtp'] = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    return { error: error?.message ?? null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        verifySignupOtp,
        verifyRecoveryOtp,
        resendSignupOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
