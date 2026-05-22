import React, { useEffect, useState } from 'react'
import { TrendingUp, Users, MousePointer2, Zap, DollarSign, Target, BarChart, Globe, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

const StatCard = ({ label, value, change, icon: Icon, primary }) => (
  <div className={cn(
    "bg-surface p-6 rounded-xl border",
    primary ? "border-primary/20 shadow-[0_0_15px_rgba(249,168,37,0.1)]" : "border-white/5"
  )}>
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        primary ? "bg-primary/20 text-primary" : "bg-white/5 text-gray-text"
      )}>
        <Icon size={20} />
      </div>
      {change && (
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-tighter",
          change.startsWith('+') ? "text-green-500" : 
          change === 'Live' ? "text-primary animate-pulse" : "text-gray-text"
        )}>
          {change}
        </span>
      )}
    </div>
    <div className="text-gray-text text-sm mb-1">{label}</div>
    <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
  </div>
)

export const Analytics = () => {
  const [stats, setStats] = useState({
    leadsFound: 0,
    sent: 0,
    openRate: '0%',
    clickRate: '0%',
    conversions: 0,
    cpt: '$0.00',
    projectedMrr: '$0.00',
    roi: '0%'
  })
  const [industryStats, setIndustryStats] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [processStatus, setProcessStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchProcessStatus()
    const interval = setInterval(() => {
      fetchStats()
      fetchProcessStatus()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchProcessStatus = async () => {
    try {
      const { data } = await supabase
        .from('process_heartbeats')
        .select('*')
        .order('process_name')
      
      if (data) {
        setProcessStatus(data.filter(p => p.process_name !== 'boncks-wake-command'))
      }
    } catch (err) {
      console.error('Error fetching process status:', err)
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch total count of leads
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .neq('business_name', 'Success Verification')

      // Fetch aggregated email stats
      const { data: statsData } = await supabase
        .from('email_stats')
        .select('*')
      
      let totalSent = 0
      let totalOpened = 0
      let totalClicked = 0
      
      if (statsData) {
        statsData.forEach(s => {
          totalSent += s.sent || 0
          totalOpened += s.opened || 0
          totalClicked += s.clicked || 0
        })
      }

      // Fetch trials (leads with status 'converted')
      const { count: trials } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted')

      // ROI and Efficiency logic
      const scrapingCost = (totalLeads || 0) * 0.002
      const emailCost = totalSent * 0.0001
      const totalCost = scrapingCost + emailCost
      const cpt = trials > 0 ? (totalCost / trials).toFixed(2) : '0.00'
      const projectedMrr = (trials * 0.20 * 9.99).toFixed(2)
      const annualRev = parseFloat(projectedMrr) * 12
      const roi = totalCost > 0 ? ((annualRev / totalCost) * 100).toFixed(0) : '0'

      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'
      const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0'

      setStats({
        leadsFound: totalLeads || 0,
        sent: totalSent,
        openRate: openRate + '%',
        clickRate: clickRate + '%',
        conversions: trials || 0,
        cpt: '$' + cpt,
        projectedMrr: '$' + projectedMrr,
        roi: roi + '%'
      })

      // Real Industry stats from DB
      const { data: industryData } = await supabase
        .from('leads')
        .select('industry_name')
        .neq('business_name', 'Success Verification')
      
      if (industryData) {
        const counts = {}
        industryData.forEach(l => {
          counts[l.industry_name] = (counts[l.industry_name] || 0) + 1
        })
        const sortedIndustries = Object.entries(counts)
          .map(([name, count]) => ({ 
            name, 
            count, 
            rate: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) + '%' : '0%' 
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setIndustryStats(sortedIndustries)
      }

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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Platform Analytics</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-text">ROI and Conversion performance tracking. (v2.2.0)</p>
            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
            <p className="text-[10px] text-primary/60 font-mono uppercase tracking-widest animate-pulse">Live Data Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-gray-text font-bold uppercase tracking-widest">Last Sync</div>
            <div className="text-xs text-white/60">{new Date().toLocaleTimeString()}</div>
          </div>
          <button 
            onClick={fetchStats}
            className="bg-dark text-white border border-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Leads" value={stats.leadsFound} change="Live" icon={TrendingUp} primary />
        <StatCard label="Trials Started" value={stats.conversions} change="+15%" icon={Zap} />
        <StatCard label="Avg. Open Rate" value={stats.openRate} change="+2.3%" icon={Users} />
        <StatCard label="Avg. Click Rate" value={stats.clickRate} change="+0.5%" icon={MousePointer2} />
      </div>

      {/* ROI & Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Cost Per Trial (CPT)" value={stats.cpt} icon={DollarSign} />
        <StatCard label="Projected MRR" value={stats.projectedMrr} icon={Target} />
        <StatCard label="Estimated ROI (Annual)" value={stats.roi} change="High" icon={BarChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <Target size={18} className="text-primary" />
            Conversion Funnel
          </h3>
          <div className="space-y-8 py-4">
            <FunnelStep label="Outreach" count={stats.sent.toLocaleString()} sub="Emails Sent" percentage="100%" />
            <FunnelStep label="Engagement" count={(stats.sent * (parseFloat(stats.openRate)/100) || 0).toFixed(0)} sub="Unique Opens" percentage={stats.openRate} />
            <FunnelStep label="Interest" count={(stats.sent * (parseFloat(stats.clickRate)/100) || 0).toFixed(0)} sub="Link Clicks" percentage={stats.clickRate} />
            <FunnelStep label="Conversion" count={stats.conversions} sub="Trials Started" percentage={(stats.sent > 0 ? (stats.conversions / stats.sent * 100).toFixed(1) : '0') + '%'} last />
          </div>
        </div>

        {/* Geographic Performance */}
        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            Top Locations
          </h3>
          <div className="space-y-4">
            <LocationRow city="Austin" state="TX" conversion="14.2%" />
            <LocationRow city="Dallas" state="TX" conversion="12.8%" />
            <LocationRow city="Houston" state="TX" conversion="11.5%" />
            <LocationRow city="Miami" state="FL" conversion="10.9%" />
            <LocationRow city="Phoenix" state="AZ" conversion="9.4%" />
            <LocationRow city="Atlanta" state="GA" conversion="8.7%" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Leads by Industry</h3>
          <div className="space-y-6">
            {industryStats.map((ind) => (
              <IndustryProgress 
                key={ind.name}
                name={ind.name} 
                progress={Math.min(100, (ind.count / (stats.leadsFound || 5000)) * 100)} 
                rate={ind.count + ' leads'} 
              />
            ))}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            System Process Monitor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {processStatus.length === 0 ? (
              <div className="col-span-2 text-center text-gray-text py-4">No process data.</div>
            ) : processStatus.map((proc) => {
              const isAlive = proc.status === 'alive'
              const lastHb = new Date(proc.last_heartbeat)
              const diffSec = Math.floor((new Date() - lastHb) / 1000)
              const isStalled = diffSec > 300
              
              return (
                <div key={proc.process_name} className="bg-dark/50 p-4 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-white">{proc.process_name.replace('boncks-', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      isAlive && !isStalled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {isAlive && !isStalled ? 'Running' : 'Stalled'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-text">
                    Last active: {diffSec < 0 ? 0 : diffSec}s ago
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const FunnelStep = ({ label, count, sub, percentage, last }) => (
  <div className="relative flex items-center gap-6">
    {!last && <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-white/5"></div>}
    <div className="w-10 h-10 rounded-full bg-dark border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 z-10">
      {percentage}
    </div>
    <div className="flex-1 flex justify-between items-center bg-dark/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div>
        <div className="text-xs font-bold text-gray-text uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-lg font-bold text-white">{count}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-text">{sub}</div>
      </div>
    </div>
  </div>
)

const LocationRow = ({ city, state, conversion }) => (
  <div className="flex items-center justify-between p-3 bg-dark/30 rounded-lg border border-white/5">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-primary/40"></div>
      <span className="text-sm font-medium text-white">{city}, {state}</span>
    </div>
    <span className="text-sm font-bold text-primary">{conversion}</span>
  </div>
)

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

