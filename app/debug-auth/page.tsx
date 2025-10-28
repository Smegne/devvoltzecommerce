"use client"

import { useEffect, useState } from 'react'

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      const info: any = {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        user: user ? JSON.parse(user) : null,
        localStorageKeys: Object.keys(localStorage)
      }

      // Test admin API access
      if (token) {
        try {
          const response = await fetch('/api/admin/products', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          info.adminApiStatus = response.status
          info.adminApiOk = response.ok
        } catch (error) {
          info.adminApiError = error
        }
      }

      setDebugInfo(info)
    }

    checkAuth()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}