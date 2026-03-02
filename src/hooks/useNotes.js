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
    const { data } = await supabase
      .from('notes')
      .select('*, author:profiles(full_name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  const addNote = async (leadId, authorId, content) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ lead_id: leadId, author_id: authorId, content })
      .select('*, author:profiles(full_name)')
      .single()
    if (!error) setNotes(prev => [data, ...prev])
    return { error }
  }

  return { notes, loading, addNote }
}