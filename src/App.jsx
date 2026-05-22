import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { Analytics } from './pages/Analytics'
import { Leads } from './pages/Leads'
import { Campaigns } from './pages/Campaigns'
import { Templates } from './pages/Templates'
import { Suppression } from './pages/Suppression'
import { SystemStatus } from './pages/SystemStatus'

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
        return <Templates />
      case 'suppression':
        return <Suppression />
      case 'system-status':
        return <SystemStatus />
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
