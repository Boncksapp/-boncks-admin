import React, { useEffect, useState } from 'react'
import { Search, ShieldAlert, Trash2, UserMinus, MailX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const Suppression = () => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearcherTerm] = useState('')

  const fetchSuppressionList = async () => {
    try {
      let query = supabase.from('suppression_list').select('*').order('suppressed_at', { ascending: false })
      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`)
      }
      const { data, error } = await query.limit(100)
      if (data) setList(data)
    } catch (err) {
      console.error('Error fetching suppression list:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppressionList()
  }, [searchTerm])

  const removeSuppression = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the suppression list?`)) return
    try {
      const { error } = await supabase.from('suppression_list').delete().eq('email', email)
      if (error) throw error
      setList(prev => prev.filter(item => item.email !== email))
    } catch (err) {
      alert('Failed to remove email')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <MailX className="text-red-500" />
            Suppression List
          </h1>
          <p className="text-gray-text mt-1">Manage global opt-outs, bounces, and complaints.</p>
        </div>
        <button 
          onClick={async () => {
            const email = prompt('Enter email to suppress:')
            if (!email) return
            const { error } = await supabase.from('suppression_list').insert({
              organization_id: '00000000-0000-0000-0000-000000000001',
              email: email.toLowerCase().trim(),
              suppression_type: 'manual',
              suppressed_at: new Date().toISOString()
            })
            if (error) alert(error.message)
            else fetchSuppressionList()
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <UserMinus size={18} />
          Add Email
        </button>
      </header>

      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" size={18} />
            <input 
              type="text" 
              placeholder="Search suppressed emails..." 
              value={searchTerm}
              onChange={(e) => setSearcherTerm(e.target.value)}
              className="w-full bg-dark border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-text text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date Added</th>
                <th className="px-6 py-4 font-semibold">Reason / Detail</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-text">Loading suppression list...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-text">No suppressed emails found.</td></tr>
              ) : list.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">{item.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                      item.suppression_type === 'unsubscribed' ? "bg-yellow-500/20 text-yellow-500" :
                      item.suppression_type === 'bounced' ? "bg-red-500/20 text-red-500" :
                      "bg-purple-500/20 text-purple-500"
                    )}>
                      {item.suppression_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{new Date(item.suppressed_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-text">{item.notes || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeSuppression(item.email)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-gray-text hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
