import React, { useEffect, useState } from 'react'
import { Eye, Mail, Tag, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const Templates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('industry_name', { ascending: true })

      if (error) throw error
      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  if (selectedTemplate) {
    return (
      <div className="p-8">
        <button 
          onClick={() => setSelectedTemplate(null)}
          className="flex items-center gap-2 text-gray-text hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Templates</span>
        </button>
        
        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
            <p className="text-gray-text mt-1">Subject: {selectedTemplate.subject}</p>
          </div>
          <div className="p-0 bg-white">
            <iframe 
              title="Template Preview"
              srcDoc={selectedTemplate.body_html}
              className="w-full h-[600px] border-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Email Templates</h1>
        <p className="text-gray-text mt-1">Manage and preview your professional outreach assets.</p>
      </header>

      {loading ? (
        <div className="p-12 text-center text-gray-text bg-surface rounded-xl border border-white/5">
          Loading templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-surface rounded-xl border border-white/5 overflow-hidden group hover:border-primary/20 transition-all flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-text">{template.industry_name || 'General'}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-text line-clamp-2">{template.subject}</p>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-text">
                  <Tag size={12} />
                  <span>{template.template_type}</span>
                </div>
                <button 
                  onClick={() => setSelectedTemplate(template)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
