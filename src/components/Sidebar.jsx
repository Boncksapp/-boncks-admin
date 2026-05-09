import React from 'react'
import { LayoutDashboard, Users, Send, FileText, ShieldAlert, LogOut } from 'lucide-react'
import { cn } from '../utils/cn'

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
      active ? "bg-primary text-black font-bold" : "text-gray-text hover:bg-surface hover:text-white"
    )}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
)

export const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-dark border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-black">B</div>
        <span className="text-xl font-bold">Boncks Admin</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem 
          icon={LayoutDashboard} 
          label="Analytics" 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
        />
        <NavItem 
          icon={Users} 
          label="Leads" 
          active={activeTab === 'leads'} 
          onClick={() => setActiveTab('leads')} 
        />
        <NavItem 
          icon={Send} 
          label="Campaigns" 
          active={activeTab === 'campaigns'} 
          onClick={() => setActiveTab('campaigns')} 
        />
        <NavItem 
          icon={FileText} 
          label="Templates" 
          active={activeTab === 'templates'} 
          onClick={() => setActiveTab('templates')} 
        />
        <NavItem 
          icon={ShieldAlert} 
          label="Suppression" 
          active={activeTab === 'suppression'} 
          onClick={() => setActiveTab('suppression')} 
        />
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-white">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">admin@boncks.com</p>
            <p className="text-xs text-gray-text truncate">Administrator</p>
          </div>
          <button className="text-gray-text hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
