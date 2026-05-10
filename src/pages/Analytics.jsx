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
    sent: 0,
    openRate: '0%',
    clickRate: '0%',
    conversions: 0
  })
  const [industryStats, setIndustryStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch lead counts by industry
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('industry_name')
        .neq('business_name', 'Success Verification')

      if (leadsError) throw leadsError

      const industryCounts = leads.reduce((acc, lead) => {
        const name = lead.industry_name || 'Uncategorized'
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})

      const sortedIndustries = Object.entries(industryCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      setIndustryStats(sortedIndustries)

      // Fetch email logs for global stats
      const { count: sentCount } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })

      const { count: openCount } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'opened')

      const openRate = logsSentCount > 0 ? ((openCount / logsSentCount) * 100).toFixed(1) + '%' : '0%'

      // Fetch emails sent count (leads with status 'contacted')
      const { count: contactedCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'contacted')

      setStats({
        leadsFound: leads.length,
        sent: contactedCount || 0,
        openRate: openRate,
        clickRate: '0%',
        conversions: 0
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-text mt-1">Real-time performance across all service industries.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="bg-dark text-white border border-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors"
        >
          Refresh
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Leads Found" value={stats.leadsFound} change={loading ? "..." : ""} icon={TrendingUp} />
        <StatCard label="Emails Sent" value={stats.sent} change="Today" icon={Users} />
        <StatCard label="Average Open Rate" value={stats.openRate} change="0%" icon={Users} />
        <StatCard label="Trial Signups" value={stats.conversions} change="0%" icon={Zap} />
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
                progress={Math.min(100, (ind.count / stats.sent) * 100)} 
                rate={`${ind.count} leads`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            {industryStats.length > 0 ? (
              <ActivityItem 
                title="Lead Collection Successful" 
                subtitle={`${stats.sent} leads found in Phoenix, AZ`} 
                time="Just now" 
                highlight
              />
            ) : (
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
