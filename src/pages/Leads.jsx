import React, { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, ExternalLink, Mail, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('All Industries')

  const fetchLeads = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .neq('business_name', 'Success Verification')

      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,business_email.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      }

      if (industryFilter !== 'All Industries') {
        query = query.eq('industry_name', industryFilter)
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Supabase Error:', error)
      } else {
        setLeads(data || [])
        setTotalCount(count || 0)
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    const interval = setInterval(() => {
      fetchLeads()
    }, 10000)
    return () => clearInterval(interval)
  }, [searchTerm, industryFilter])

  const sendSignal = async (signalName) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          organization_id: '00000000-0000-0000-0000-000000000001',
          name: `[SYSTEM_SIGNAL]${signalName}`,
          status: 'draft'
        })
      
      if (error) throw error
      alert(`Signal ${signalName} sent to collector!`)
    } catch (err) {
      console.error('Error sending signal:', err)
      alert('Failed to send signal.')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Lead Management</h1>
          <p className="text-gray-text mt-1">Search, filter and organize your collected business leads. ({totalCount} total)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => sendSignal('RESTART')}
            className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500/20 transition-colors"
          >
            Restart Collector
          </button>
          <button 
            onClick={() => sendSignal('CLEANUP')}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition-colors"
          >
            Clean Duplicates
          </button>
          <button 
            onClick={fetchLeads}
            className="bg-dark text-white border border-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors"
          >
            Refresh List
          </button>
          <button className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            Import Leads
          </button>
        </div>
      </header>

      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" size={18} />
            <input 
              type="text" 
              placeholder="Search leads by name, email or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white hover:bg-white/5 focus:outline-none"
            >
              <option>All Industries</option>
              <option>HVAC</option>
              <option>Plumbing</option>
              <option>Roofing</option>
              <option>Cleaning Services</option>
              <option>Electrical</option>
              <option>Landscaping & Tree</option>
              <option>Pest Control</option>
              <option>Construction & Remodeling</option>
              <option>Mobile Mechanics & Towing</option>
              <option>Restoration & Remediation</option>
              <option>Solar Installation</option>
              <option>Septic & Sewer Services</option>
              <option>Foundation Repair</option>
              <option>Commercial Maintenance</option>
              <option>Fire Sprinkler & Security</option>
              <option>Irrigation Systems</option>
              <option>Excavation & Demolition</option>
              <option>Garage Door & Gate</option>
              <option>Flooring & Carpet Cleaning</option>
              <option>Asphalt Paving</option>
              <option>Appliance Repair</option>
              <option>Painting</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-text">Loading leads...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-text text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Business Name</th>
                  <th className="px-6 py-4 font-semibold">Industry</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Score</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-text">No leads found. Run a collection to find businesses.</td>
                  </tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.business_name}</div>
                      <div className="text-xs text-gray-text flex items-center gap-2 mt-1">
                        <Mail size={12} />
                        <span>{lead.business_email || 'No email found'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80">{lead.industry_name}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{lead.city || 'N/A'}, {lead.state || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        lead.status === 'converted' ? "bg-green-500/20 text-green-500" :
                        lead.status === 'contacted' ? "bg-blue-500/20 text-blue-500" :
                        lead.status === 'interested' ? "bg-primary/20 text-primary" :
                        lead.status === 'suppressed' ? "bg-red-500/20 text-red-500" :
                        "bg-white/10 text-gray-text"
                      )}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 bg-dark rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              lead.quality_score >= 80 ? "bg-green-500" :
                              lead.quality_score >= 60 ? "bg-primary" :
                              "bg-red-500"
                            )}
                            style={{ width: `${lead.quality_score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-white/60">{lead.quality_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                          <Phone size={16} title={lead.phone} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                          <Mail size={16} />
                        </button>
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-text">
          <div>Showing 1-{leads.length} of {totalCount} leads</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-dark border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-dark border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
