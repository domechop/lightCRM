import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStages(profile) {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStages = useCallback(async () => {
    if (!profile?.org_id) return
    const { data } = await supabase
      .from('stages')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('position')
    setStages(data || [])
    setLoading(false)
  }, [profile?.org_id])

  useEffect(() => {
    if (profile?.org_id) fetchStages()
  }, [fetchStages])

  const addStage = async (name, color) => {
    const position = stages.length
    const { data, error } = await supabase
      .from('stages')
      .insert({ org_id: profile.org_id, name, color, position })
      .select()
      .single()
    if (!error) setStages(prev => [...prev, data])
    return { error }
  }

  const updateStage = async (id, updates) => {
    const { error } = await supabase
      .from('stages')
      .update(updates)
      .eq('id', id)
      .eq('org_id', profile.org_id)
    if (!error) setStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    return { error }
  }

  const deleteStage = async (id) => {
    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', id)
      .eq('org_id', profile.org_id)
    if (!error) {
      setStages(prev => {
        const filtered = prev.filter(s => s.id !== id)
        return filtered.map((s, i) => ({ ...s, position: i }))
      })
    }
    return { error }
  }

  const reorderStages = async (reordered) => {
    setStages(reordered)
    // Update positions in DB
    await Promise.all(reordered.map((s, i) =>
      supabase.from('stages').update({ position: i }).eq('id', s.id)
    ))
  }

  return { stages, loading, addStage, updateStage, deleteStage, reorderStages, refresh: fetchStages }
}