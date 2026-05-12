import React, { useEffect, useState } from 'react'
import { TrendingUp, Users, MousePointer2, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

const StatCard = ({ label, value, change, icon: Icon }) => (
  <div className="bg-surface p-6 rounded-xl border border-white/5">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon size={20} />
      </div>
      {change && (
        <span className={change.startsWith('+') ? "text-green-500 text-sm font-medium" : "text-red-500 text-sm font-medium"}>
          {change}
        </span>
      )}
    </div>
    <div className="text-gray-text text-sm mb-1">{label}</div>
    <div className="text-3xl font-bold tracking-tight">{value}</div>
  </div>
)

export const Analytics = () => {
  const [stats, setStats] = useState({
    leadsFound: 0,
    sent: 0,
    openRate: '0%',
    clickRate: '0%',
    conversions: 0
  })
  const [industryStats, setIndustryStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total count explicitly to avoid 1000 row limit
      const { count: totalLeads, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .neq('business_name', 'Success Verification')

      if (countError) throw countError

      // Fetch lead counts by industry in batches to bypass 1000 row limit
      let allLeads = []
      let page = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore && page < 20) { // Limit to 20k leads for performance
        const { data: pageData, error: pageError } = await supabase
          .from('leads')
          .select('industry_name')
          .neq('business_name', 'Success Verification')
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (pageError) throw pageError
        if (!pageData || pageData.length === 0) {
          hasMore = false
        } else {
          allLeads = [...allLeads, ...pageData]
          hasMore = pageData.length === pageSize
          page++
        }
      }

      const industryCounts = allLeads.reduce((acc, lead) => {
        let name = lead.industry_name ? lead.industry_name.trim() : 'Uncategorized'
        // Simple normalization: "Cleaning" and "Cleaning Services" map to "Cleaning"
        if (name === 'Cleaning Services') name = 'Cleaning'
        
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})

      const sortedIndustries = Object.entries(industryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      setIndustryStats(sortedIndustries)

      // Fetch campaign stats for global metrics
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('emails_sent, emails_opened, emails_clicked')
        .not('name', 'ilike', '[SYSTEM_SIGNAL]%')

      const totals = (campaignData || []).reduce((acc, c) => {
        acc.sent += c.emails_sent || 0
        acc.opened += c.emails_opened || 0
        acc.clicked += c.emails_clicked || 0
        return acc
      }, { sent: 0, opened: 0, clicked: 0 })

      const openRate = totals.sent > 0 
        ? ((totals.opened / totals.sent) * 100).toFixed(1) + '%' 
        : '0%'
      const clickRate = totals.sent > 0 
        ? ((totals.clicked / totals.sent) * 100).toFixed(1) + '%' 
        : '0%'

      // Fetch emails sent count (leads with status 'contacted')
      const { count: contactedCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'contacted')

      // Fetch conversion count (trial signups)
      const { count: conversionCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .or('boncks_trial_started.eq.true,status.eq.converted')

      setStats({
        leadsFound: totalLeads ?? leads.length ?? 0,
        sent: contactedCount || totals.sent || 0,
        openRate: openRate,
        clickRate: clickRate,
        conversions: conversionCount || 0
      })

      // Fetch recent activity
      const { data: logs } = await supabase
        .from('email_logs')
        .select('*, leads(business_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (logs) {
        setRecentActivity(logs.map(log => ({
          title: `Email ${log.status.charAt(0).toUpperCase() + log.status.slice(1)}`,
          subtitle: `Target: ${log.leads?.business_name || log.to_email}`,
          time: new Date(log.created_at).toLocaleTimeString(),
          highlight: log.status === 'opened' || log.status === 'clicked'
        })))
      }

    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const wakeUpSystem = async () => {
    try {
      const now = new Date().toISOString()
      const { data: existing } = await supabase
        .from('process_heartbeats')
        .select('id')
        .eq('process_name', 'boncks-wake-command')
        .maybeSingle()

      if (existing) {
        await supabase
          .from('process_heartbeats')
          .update({ status: 'pending', last_heartbeat: now })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('process_heartbeats')
          .insert({ process_name: 'boncks-wake-command', status: 'pending', last_heartbeat: now })
      }
      
      alert('Wake up signal sent! All systems (Leads & Emails) will restart in ~30 seconds.')
    } catch (err) {
      console.error('Error waking up system:', err)
      alert('Failed to send wake up signal.')
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Live Stats Overview</h1>
          <p className="text-gray-text mt-1">Real-time performance across all service industries. (v2.1.4)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={wakeUpSystem}
            className="bg-primary text-dark px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(249,168,37,0.3)] flex items-center gap-2"
          >
            <Zap size={16} />
            Wake Up System
          </button>
          <button 
            onClick={fetchStats}
            className="bg-dark text-white border border-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(249,168,37,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <TrendingUp size={20} />
            </div>
            <span className="text-primary text-[10px] font-bold uppercase tracking-tighter animate-pulse">Live</span>
          </div>
          <div className="text-gray-text text-sm mb-1">Total Verified Leads</div>
          <div className="text-3xl font-bold tracking-tight text-white">{stats.leadsFound}</div>
        </div>
        <StatCard label="Emails Sent" value={stats.sent} change="Total" icon={Users} />
        <StatCard label="Open Rate" value={stats.openRate} icon={Users} />
        <StatCard label="Click Rate" value={stats.clickRate} icon={MousePointer2} />
        <StatCard label="Trial Signups" value={stats.conversions} icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Leads by Industry</h3>
          <div className="space-y-6">
            {industryStats.length === 0 ? (
              <div className="text-center text-gray-text py-8">No industry data yet.</div>
            ) : industryStats.map((ind) => (
              <IndustryProgress 
                key={ind.name}
                name={ind.name} 
                progress={Math.min(100, (ind.count / (stats.leadsFound || 1)) * 100)} 
                rate={`${ind.count} leads`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <ActivityItem 
                key={idx}
                title={activity.title} 
                subtitle={activity.subtitle} 
                time={activity.time} 
                highlight={activity.highlight}
              />
            )) : (
              <div className="text-center text-gray-text py-8">No recent activity.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const IndustryProgress = ({ name, progress, rate }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-white">{name}</span>
      <span className="text-sm text-primary font-bold">{rate}</span>
    </div>
    <div className="h-2 bg-dark rounded-full overflow-hidden border border-white/5">
      <div 
        className="h-full bg-primary transition-all duration-500" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
)

const ActivityItem = ({ title, subtitle, time, highlight }) => (
  <div className="flex gap-4">
    <div className={cn(
      "w-2 h-2 rounded-full mt-2 shrink-0",
      highlight ? "bg-primary shadow-[0_0_8px_rgba(249,168,37,0.5)]" : "bg-white/20"
    )}></div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <p className={cn("text-sm font-medium truncate", highlight ? "text-white" : "text-white/80")}>{title}</p>
        <span className="text-[10px] text-gray-text whitespace-nowrap ml-2 uppercase tracking-wider font-semibold">{time}</span>
      </div>
      <p className="text-xs text-gray-text truncate mt-0.5">{subtitle}</p>
    </div>
  </div>
)
