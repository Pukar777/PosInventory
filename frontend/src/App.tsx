import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Restaurant Inventory</h1>
        <p className="mt-2 text-gray-500 mb-6">shadcn + Vite + React + TypeScript ready.</p>
        <Button>Click me</Button>
      </div>
    </div>
  )
}

export default App
