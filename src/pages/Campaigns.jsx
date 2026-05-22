import React, { useEffect, useState } from 'react'
import { Plus, Play, Pause, BarChart3, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
    const interval = setInterval(fetchCampaigns, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .not('name', 'ilike', '[SYSTEM_SIGNAL]%')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCampaigns(data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaignStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    } catch (err) {
      console.error('Error toggling campaign status:', err)
      alert('Failed to update campaign status.')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Campaigns</h1>
          <p className="text-gray-text mt-1">Manage and monitor your automated email outreach campaigns.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          <Plus size={20} />
          <span>New Campaign</span>
        </button>
      </header>

      {loading && campaigns.length === 0 ? (
        <div className="p-12 text-center text-gray-text bg-surface rounded-xl border border-white/5">
          Loading campaigns...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.length === 0 ? (
            <div className="p-12 text-center text-gray-text bg-surface rounded-xl border border-white/5">
              No campaigns found. Create your first campaign to start outreach.
            </div>
          ) : campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-surface rounded-xl border border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
                      campaign.status === 'active' ? "bg-green-500/10 text-green-500" :
                      campaign.status === 'paused' ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-white/5 text-gray-text"
                    )}>
                      <Send size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{campaign.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-text">
                        <span className="flex items-center gap-1">
                          <BarChart3 size={14} />
                          {campaign.industry_name || 'All Industries'}
                        </span>
                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Daily Limit: {campaign.daily_limit || 100}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                      campaign.status === 'active' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                      campaign.status === 'paused' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                      "bg-white/5 text-gray-text border border-white/10"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        campaign.status === 'active' ? "bg-green-500" :
                        campaign.status === 'paused' ? "bg-yellow-500" :
                        "bg-gray-text"
                      )}></div>
                      {campaign.status}
                    </span>
                    <div className="flex bg-dark rounded-lg p-1 border border-white/5">
                      <button 
                        onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                        className="p-1.5 hover:bg-white/5 rounded text-gray-text hover:text-white transition-colors"
                        title={campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric label="Emails Sent" value={campaign.emails_sent || 0} />
                  <Metric label="Open Rate" value={campaign.emails_sent > 0 ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1) + '%' : '0%'} />
                  <Metric label="Click Rate" value={campaign.emails_sent > 0 ? ((campaign.emails_clicked / campaign.emails_sent) * 100).toFixed(1) + '%' : '0%'} />
                  <Metric label="Unsubscribes" value={campaign.unsubscribes || 0} color="red" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Metric = ({ label, value, color }) => (
  <div className="bg-dark p-4 rounded-lg border border-white/5">
    <div className="text-gray-text text-[10px] uppercase tracking-widest font-bold mb-1">{label}</div>
    <div className={cn(
      "text-xl font-bold tracking-tight",
      color === 'red' ? "text-red-400" : "text-white"
    )}>{value}</div>
  </div>
)

const Send = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
)
