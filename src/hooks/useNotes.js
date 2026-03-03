import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useNotes(leadId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!leadId) return
    fetchNotes()
  }, [leadId])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*, author:profiles(full_name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) console.error('fetchNotes error:', error.message)
    setNotes(data || [])
    setLoading(false)
  }

  const addNote = async (leadId, authorId, content, orgId) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ lead_id: leadId, author_id: authorId, content, org_id: orgId })
      .select('*, author:profiles(full_name)')
      .single()
    if (error) {
      console.error('addNote error:', error.message, error.details, error.hint)
      return { error }
    }
    setNotes(prev => [data, ...prev])
    return { data }
  }

  return { notes, loading, addNote }
}