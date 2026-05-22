import React, { useEffect, useState } from 'react'
import { Zap, Play, Pause, RefreshCw, Activity, ShieldCheck, AlertTriangle, Terminal, Globe } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const SystemStatus = () => {
  const [heartbeats, setHeartbeats] = useState([])
  const [settings, setSettings] = useState({
    is_sending_active: false,
    is_collection_active: false,
    daily_email_limit: 300,
    min_time_between_emails_ms: 2000,
    tracking_domain: 'https://boncks.com'
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setRefreshing(true)
    try {
      // Fetch Heartbeats
      const { data: hbData } = await supabase
        .from('process_heartbeats')
        .select('*')
        .order('process_name')
      
      if (hbData) setHeartbeats(hbData)

      // Fetch System Settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('*')
      
      if (settingsData) {
        const mappedSettings = {}
        settingsData.forEach(s => {
          // Check if value is object with .value or just the value
          mappedSettings[s.key] = s.value?.value !== undefined ? s.value.value : s.value
        })
        setSettings(prev => ({ ...prev, ...mappedSettings }))
      }
    } catch (err) {
      console.error('Error fetching system status:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const updateSetting = async (key, newValue) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value: { value: newValue } })
      
      if (error) throw error
      setSettings(prev => ({ ...prev, [key]: newValue }))
    } catch (err) {
      console.error(`Error updating ${key}:`, err)
      alert(`Failed to update ${key}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleSetting = async (key, currentValue) => {
    await updateSetting(key, !currentValue)
  }

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
      alert(`Signal ${signalName} sent to system!`)
    } catch (err) {
      console.error('Error sending signal:', err)
      alert('Failed to send signal.')
    }
  }

  const getProcessStatus = (heartbeat, status) => {
    if (status === 'dead') return 'Dead'
    const lastHb = new Date(heartbeat)
    const diffSec = Math.floor((new Date() - lastHb) / 1000)
    if (diffSec > 300) return 'Stalled'
    return 'Active'
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-primary" />
            System Status & Control
          </h1>
          <p className="text-gray-text mt-1">Monitor core processes and manage global automation switches.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-dark text-white border border-white/10 px-4 py-2 rounded-lg font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn(refreshing && "animate-spin")} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
          <button 
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('campaigns')
                  .insert({
                    organization_id: '00000000-0000-0000-0000-000000000001',
                    name: '[SYSTEM_SIGNAL]WAKE_UP',
                    status: 'draft'
                  })
                if (error) throw error
                alert('Wake up signal sent to system watchdog!')
              } catch (err) {
                console.error('Error sending wake signal:', err)
                alert('Failed to send wake signal.')
              }
            }}
            className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            <Zap size={18} />
            <span>Wake Up System</span>
          </button>
        </div>
      </header>

      {/* Global Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ControlCard
          title="Email Sending Engine"
          description="Global switch to enable or pause all outbound email campaigns."
          active={settings.is_sending_active}
          onToggle={() => toggleSetting('is_sending_active', settings.is_sending_active)}
          onTrigger={() => sendSignal('OUTREACH_BATCH')}
          triggerLabel="Force Batch"
          icon={Play}
          pauseIcon={Pause}
        >
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-text">Daily Send Limit</span>
              <input
                type="number"
                value={settings.daily_email_limit}
                onChange={(e) => setSettings({...settings, daily_email_limit: parseInt(e.target.value)})}
                onBlur={(e) => updateSetting('daily_email_limit', parseInt(e.target.value))}
                className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white w-20 text-right"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-text">Min Delay (ms)</span>
              <input
                type="number"
                value={settings.min_time_between_emails_ms}
                onChange={(e) => setSettings({...settings, min_time_between_emails_ms: parseInt(e.target.value)})}
                onBlur={(e) => updateSetting('min_time_between_emails_ms', parseInt(e.target.value))}
                className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white w-20 text-right"
              />
            </div>
          </div>
        </ControlCard>
        <ControlCard
          title="Lead Collection Engine"
          description="Enable or pause automated scraping and lead discovery across all industries."
          active={settings.is_collection_active}
          onToggle={() => toggleSetting('is_collection_active', settings.is_collection_active)}
          onTrigger={() => sendSignal('COLLECT_NOW')}
          triggerLabel="Trigger Scan"
          icon={Zap}
          pauseIcon={Pause}
        >
          <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-text">Daily Lead Limit</span>
              <input
                type="number"
                value={settings.daily_lead_limit}
                onChange={(e) => setSettings({...settings, daily_lead_limit: parseInt(e.target.value)})}
                onBlur={(e) => updateSetting('daily_lead_limit', parseInt(e.target.value))}
                className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white w-20 text-right"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs text-gray-text block">Tracking Domain</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.tracking_domain}
                  onChange={(e) => setSettings({...settings, tracking_domain: e.target.value})}
                  onBlur={(e) => updateSetting('tracking_domain', e.target.value)}
                  placeholder="https://boncks.com"
                  className="flex-1 bg-dark border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                />
                <Globe size={14} className="text-gray-text self-center" />
              </div>
            </div>
          </div>
        </ControlCard>
      </div>


      {/* System Health */}
      <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-500" />
            Process Heartbeats
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-text text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Process Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Heartbeat</th>
                <th className="px-6 py-4 font-semibold">Uptime Signal</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {heartbeats.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-text">No active processes detected. Check PM2 on the server.</td>
                </tr>
              ) : heartbeats.map((proc) => {
                const status = getProcessStatus(proc.last_heartbeat, proc.status)
                return (
                  <tr key={proc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-dark border border-white/10 flex items-center justify-center">
                          <Terminal size={14} className="text-gray-text" />
                        </div>
                        <span className="font-medium text-white">{proc.process_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit",
                        status === 'Active' ? "bg-green-500/10 text-green-500" :
                        status === 'Stalled' ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === 'Active' ? "bg-green-500 animate-pulse" :
                          status === 'Stalled' ? "bg-yellow-500" : "bg-red-500"
                        )}></span>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80">
                      {new Date(proc.last_heartbeat).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={cn("w-1 h-3 rounded-full", status === 'Active' ? "bg-green-500/40" : "bg-white/5")}></div>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-text">Healthy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-primary hover:underline">View Logs</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts */}
      <div className="mt-8 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6 flex gap-4">
        <AlertTriangle className="text-yellow-500 shrink-0" size={24} />
        <div>
          <h4 className="text-yellow-500 font-bold mb-1">System Notice</h4>
          <p className="text-sm text-yellow-500/70">
            Process heartbeats are updated every 60 seconds. If a process shows 'Stalled' for more than 5 minutes, the Watchdog will automatically attempt a restart.
          </p>
        </div>
      </div>
    </div>
  )
}

const ControlCard = ({ title, description, active, onToggle, onTrigger, icon, pauseIcon, triggerLabel, children }) => {
  const Icon = icon
  const PauseIcon = pauseIcon
  return (
    <div className={cn(
      "p-6 rounded-xl border transition-all",
      active ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(249,168,37,0.05)]" : "bg-surface border-white/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          active ? "bg-primary text-black" : "bg-white/5 text-gray-text"
        )}>
          {active ? <Icon size={24} /> : <PauseIcon size={24} />}
        </div>
        <div className="flex items-center gap-4">
          {active && onTrigger && (
            <button 
              onClick={onTrigger}
              className="text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 text-white transition-colors"
            >
              {triggerLabel || 'Trigger Now'}
            </button>
          )}
          <button 
            onClick={onToggle}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none",
              active ? "bg-primary" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
              active ? "translate-x-6" : "translate-x-0"
            )}></div>
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-text leading-relaxed">{description}</p>
      
      {children}
  
      <div className="mt-4 flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          active ? "bg-green-500 animate-pulse" : "bg-gray-text"
        )}></div>
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          active ? "text-green-500" : "text-gray-text"
        )}>
          {active ? 'Active' : 'Paused'}
        </span>
      </div>
    </div>
  )
}
