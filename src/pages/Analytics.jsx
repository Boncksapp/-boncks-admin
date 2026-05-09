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

  useEffect(() => {
    setStats({
      sent: '1,248',
      openRate: '24.5%',
      clickRate: '8.1%',
      conversions: '42'
    })
  }, [])

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-text mt-1">Real-time performance across all service industries.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Emails Sent Today" value={stats.sent} change="+12%" icon={TrendingUp} />
        <StatCard label="Average Open Rate" value={stats.openRate} change="+2.3%" icon={Users} />
        <StatCard label="Click-Through Rate" value={stats.clickRate} change="+0.5%" icon={MousePointer2} />
        <StatCard label="Trial Signups" value={stats.conversions} change="+15%" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Industry Performance</h3>
          <div className="space-y-6">
            <IndustryProgress name="HVAC" progress={85} rate="12.4%" />
            <IndustryProgress name="Plumbing" progress={72} rate="10.2%" />
            <IndustryProgress name="Roofing" progress={68} rate="9.8%" />
            <IndustryProgress name="Cleaning" progress={55} rate="7.5%" />
            <IndustryProgress name="Electrical" progress={48} rate="6.1%" />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-bold mb-6 text-white">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem 
              title="HVAC Lead Opened Email" 
              subtitle="Dallas, TX • 'Introduction to Boncks'" 
              time="2m ago" 
            />
            <ActivityItem 
              title="New Trial Signup" 
              subtitle="Elite Plumbing • Austin, TX" 
              time="15m ago" 
              highlight 
            />
            <ActivityItem 
              title="Link Clicked: Pricing" 
              subtitle="Sparky's Electric • Houston, TX" 
              time="45m ago" 
            />
            <ActivityItem 
              title="Campaign Started" 
              subtitle="'Texas Spring Outreach' • 500 leads" 
              time="1h ago" 
            />
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
