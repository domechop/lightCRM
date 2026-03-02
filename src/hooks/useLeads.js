import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useLeads(profile) {
  const [leads, setLeads] = useState([])
  const [reps, setReps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = useCallback(async () => {
    if (!profile?.org_id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('leads')
      .select('*, rep:profiles(id, full_name)')
      .eq('org_id', profile.org_id)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setLeads(data || [])
    setLoading(false)
  }, [profile?.org_id])

  const fetchReps = useCallback(async () => {
    if (!profile?.org_id) return
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('org_id', profile.org_id)
      .order('full_name')
    setReps(data || [])
  }, [profile?.org_id])

  useEffect(() => {
    if (profile?.org_id) {
      fetchLeads()
      fetchReps()
    }
  }, [fetchLeads, fetchReps])

  const addLead = async (lead) => {
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...lead, org_id: profile.org_id })
      .select('*, rep:profiles(id, full_name)')
      .single()
    if (error) return { error }
    setLeads(prev => [data, ...prev])
    return { data }
  }

  const updateStage = async (id, stage) => {
    const { error } = await supabase
      .from('leads')
      .update({ stage, last_contact: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
      .eq('org_id', profile.org_id)
    if (!error) setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l))
    return { error }
  }

  const updateLead = async (id, updates) => {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('org_id', profile.org_id)
    if (error) {
      console.error('updateLead error:', error.message)
      return { error }
    }
    // Merge updates into local state + re-resolve rep name if rep_id changed
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      const updatedRep = updates.rep_id
        ? reps.find(r => r.id === updates.rep_id) || l.rep
        : l.rep
      return { ...l, ...updates, rep: updatedRep ? { id: updatedRep.id, full_name: updatedRep.full_name } : l.rep }
    }))
    return { data: { id, ...updates } }
  }

  const deleteLead = async (id) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('org_id', profile.org_id)
    if (!error) setLeads(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  return { leads, reps, loading, error, addLead, updateStage, updateLead, deleteLead, refresh: fetchLeads }
}