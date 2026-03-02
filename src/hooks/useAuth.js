import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setOrg(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) console.error('Profile fetch error:', error.message)
    setProfile(profileData ?? null)

    if (profileData?.org_id) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profileData.org_id)
        .maybeSingle()
      setOrg(orgData ?? null)
    }

    setLoading(false)
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUpAsOwner = async (email, password, fullName, orgName) => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return { error: authError }

    const userId = authData.user.id

    // 2. Call server-side function to create org + profile (bypasses RLS timing)
    const { data, error } = await supabase.rpc('create_org_and_owner', {
      user_id: userId,
      user_name: fullName,
      org_name: orgName
    })
    if (error) return { error }

    return { inviteCode: data.invite_code }
  }

  const signUpAsRep = async (email, password, fullName, inviteCode) => {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return { error: authError }

    const userId = authData.user.id

    // 2. Call server-side function to join org
    const { data, error } = await supabase.rpc('join_org_as_rep', {
      user_id: userId,
      user_name: fullName,
      invite_code: inviteCode
    })
    if (error) return { error: { message: 'Invalid invite code. Please check with your manager.' } }

    return { orgName: data.org_name }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, profile, org, loading, signIn, signUpAsOwner, signUpAsRep, signOut }
}