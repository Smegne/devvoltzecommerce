"use client"

import { useEffect, useState } from 'react'

export function CurrentUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return null

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 p-3 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-sm">Logged in as:</h3>
      <p className="text-xs"><strong>Name:</strong> {user.name}</p>
      <p className="text-xs"><strong>Email:</strong> {user.email}</p>
      <p className="text-xs"><strong>Role:</strong> 
        <span className={`ml-1 px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
          {user.role}
        </span>
      </p>
    </div>
  )
}