import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { Analytics } from './pages/Analytics'
import { Leads } from './pages/Leads'
import { Campaigns } from './pages/Campaigns'

function App() {
  const [activeTab, setActiveTab] = useState('analytics')

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />
      case 'leads':
        return <Leads />
      case 'campaigns':
        return <Campaigns />
      case 'templates':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Email Templates</h1>
            <p className="text-gray-text mt-1">Manage your professional email outreach templates.</p>
            <div className="mt-8 bg-surface p-12 rounded-xl border border-white/5 text-center">
              <p className="text-gray-text">Template management coming soon.</p>
            </div>
          </div>
        )
      case 'suppression':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Suppression List</h1>
            <p className="text-gray-text mt-1">Manage unsubscribed and bounced email addresses.</p>
            <div className="mt-8 bg-surface p-12 rounded-xl border border-white/5 text-center">
              <p className="text-gray-text">Suppression list management coming soon.</p>
            </div>
          </div>
        )
      default:
        return <Analytics />
    }
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

export default App
