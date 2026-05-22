import React, { useEffect, useState } from 'react'
import { Search, Plus, FileText, Eye, Copy, BarChart2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { cn } from '../utils/cn'

export const Templates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data based on email_templates_ingest.json
    setTimeout(() => {
      setTemplates([
        { id: '1', name: 'HVAC Cold Outreach', industry: 'HVAC', subject: 'Stop chasing paperwork - simplify your operations', type: 'cold', performance: '24.5%' },
        { id: '2', name: 'Plumbing Cold Outreach', industry: 'Plumbing', subject: 'Get your plumbing crew organized', type: 'cold', performance: '22.1%' },
        { id: '3', name: 'Roofing Specific Outreach', industry: 'Roofing', subject: 'Manage your roofing crews and job sites from anywhere', type: 'cold', performance: '19.8%' },
        { id: '4', name: 'Cleaning Specific Outreach', industry: 'Cleaning', subject: 'Smarter scheduling for your cleaning teams', type: 'cold', performance: '18.2%' },
        { id: '5', name: 'Solar Installation Cold Outreach', industry: 'Solar', subject: 'Real-time crew tracking for Solar Installers', type: 'cold', performance: '21.4%' },
        { id: '6', name: 'Septic & Sewer Outreach', industry: 'Septic', subject: 'Fast dispatching for your septic emergency calls', type: 'cold', performance: '23.1%' },
        { id: '7', name: 'Foundation Repair Outreach', industry: 'Foundation', subject: 'Professional estimates for structural jobs', type: 'cold', performance: '17.5%' },
        { id: '8', name: 'Commercial Maintenance Outreach', industry: 'Commercial', subject: 'Manage recurring service contracts with ease', type: 'cold', performance: '20.2%' },
        { id: '9', name: 'General Follow-up', industry: 'Global', subject: 'Quick question about {{business_name}}', type: 'follow-up', performance: '12.4%' },
      ])
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="text-primary" />
            Email Templates
          </h1>
          <p className="text-gray-text mt-1">Design and manage your high-converting outreach messages.</p>
        </div>
        <button className="bg-primary text-dark px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Create Template
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col group hover:border-primary/30 transition-all">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                  template.type === 'cold' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                )}>
                  {template.type}
                </span>
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                  <BarChart2 size={12} />
                  {template.performance} CTR
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{template.name}</h3>
              <div className="text-xs text-gray-text font-medium mb-4 flex items-center gap-2">
                <span>Industry: {template.industry}</span>
              </div>
              <div className="bg-dark/50 p-3 rounded-lg border border-white/5 italic text-sm text-gray-text line-clamp-2">
                "{template.subject}"
              </div>
            </div>
            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                  <Eye size={16} />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-text hover:text-white transition-colors">
                  <Copy size={16} />
                </button>
              </div>
              <button className="text-xs font-bold text-primary hover:underline">Edit Template</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
