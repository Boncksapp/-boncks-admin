import React, { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, ExternalLink, Mail, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setLeads([
        { 
          id: '1', 
          business_name: 'Ace Roofing', 
          industry_name: 'Roofing', 
          city: 'Austin', 
          state: 'TX', 
          status: 'contacted',
          email_status: 'opened',
          quality_score: 85
        },
        { 
          id: '2', 
          business_name: 'Elite HVAC', 
          industry_name: 'HVAC', 
          city: 'Dallas', 
          state: 'TX', 
          status: 'new',
          email_status: 'pending',
          quality_score: 70
        },
        { 
          id: '3', 
          business_name: 'Sparky\'s Electric', 
          industry_name: 'Electrical', 
          city: 'Houston', 
          state: 'TX', 
          status: 'converted',
          email_status: 'clicked',
          quality_score: 95
        },
        { 
          id: '4', 
          business_name: 'Sunshine Cleaning', 
          industry_name: 'Cleaning Services', 
          city: 'San Antonio', 
          state: 'TX', 
          status: 'interested',
          email_status: 'opened',
          quality_score: 60
        },
      ])
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-gray-text mt-1">Search, filter and organize your collected business leads.</p>
        </div>
        <button className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          Import Leads
        </button>
      </header>

      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-text" size={18} />
            <input 
              type="text" 
              placeholder="Search leads by name, email or city..." 
              className="w-full bg-dark border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white hover:bg-white/5">
              <Filter size={16} />
              <span>Filters</span>
            </button>
            <select className="bg-dark border border-white/10 rounded-lg px-4 py-2 text-sm text-white hover:bg-white/5 focus:outline-none">
              <option>All Industries</option>
              <option>HVAC</option>
              <option>Plumbing</option>
              <option>Roofing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{lead.business_name}</div>
                    <div className="text-xs text-gray-text flex items-center gap-2 mt-1">
                      <Mail size={12} />
                      <span>contact@{lead.business_name.toLowerCase().replace(' ', '')}.com</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80">{lead.industry_name}</td>
                  <td className="px-6 py-4 text-sm text-white/80">{lead.city}, {lead.state}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                      lead.status === 'converted' ? "bg-green-500/20 text-green-500" :
                      lead.status === 'contacted' ? "bg-blue-500/20 text-blue-500" :
                      lead.status === 'interested' ? "bg-primary/20 text-primary" :
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
                        <Phone size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                        <Mail size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-text">
          <div>Showing 1-4 of 1,248 leads</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-dark border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-dark border border-white/10 rounded hover:bg-white/5">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
