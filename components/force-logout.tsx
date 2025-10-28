"use client"

export function ForceLogout() {
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div className="fixed top-4 left-4 bg-red-100 border border-red-400 p-3 rounded-lg shadow-lg z-50">
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
      >
        Force Logout
      </button>
      <p className="text-xs mt-1 text-red-700">Use if stuck</p>
    </div>
  )
}