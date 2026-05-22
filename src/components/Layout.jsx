import React from 'react'
import { Sidebar } from './Sidebar'

export const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex min-h-screen bg-dark text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
