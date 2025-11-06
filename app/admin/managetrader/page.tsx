'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface Trader {
  id: number;
  user_id: number;
  shop_name: string;
  phone: string;
  shop_address: string;
  shop_description: string;
  shop_logo: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
  user_created_at: string;
}

export default function ManageTradersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Check if user is admin and redirect if not (same pattern as your dashboard)
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Fetch traders data only if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTraders();
    }
  }, [user]);

  const fetchTraders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const response = await fetch('/api/admin/traders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Unauthorized - Please login as admin');
        } else if (response.status === 403) {
          setError('Forbidden - Admin access required');
        } else {
          setError('Failed to fetch traders');
        }
        return;
      }

      const data = await response.json();
      setTraders(data);
    } catch (err) {
      setError('Network error - Failed to fetch traders');
      console.error('Fetch traders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (traderId: number, action: string) => {
    try {
      setActionLoading(traderId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const response = await fetch('/api/admin/traders', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traderId, action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} trader`);
      }

      // Refresh the traders list
      await fetchTraders();
      
    } catch (err) {
      setError(`Failed to ${action} trader`);
      console.error('Action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (traderId: number) => {
    if (!confirm('Are you sure you want to delete this trader? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(traderId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login as admin');
        return;
      }

      const response = await fetch(`/api/admin/traders?traderId=${traderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete trader');
      }

      // Refresh the traders list
      await fetchTraders();
      
    } catch (err) {
      setError('Failed to delete trader');
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'blocked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading traders...</p>
        </div>
      </div>
    );
  }

  // If not admin, don't render anything (will redirect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Matching your admin dashboard style */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <img src="../logow.jpg" alt="DevVoltz" className="w-8 h-8 rounded-lg object-cover" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  DevVoltz
                </span>
                <span className="text-sm text-muted-foreground ml-2">Admin • Manage Traders</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Traders</h1>
          <p className="text-gray-600 mt-2">Approve, reject, or manage trader accounts</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Summary - Matching your dashboard style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-0 group hover:shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-gray-900">{traders.length}</div>
            <div className="text-sm text-gray-600">Total Traders</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-0 group hover:shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-green-600">
              {traders.filter(t => t.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-0 group hover:shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-600">
              {traders.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-0 group hover:shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-red-600">
              {traders.filter(t => t.status === 'rejected' || t.status === 'blocked').length}
            </div>
            <div className="text-sm text-gray-600">Rejected/Blocked</div>
          </div>
        </div>

        {/* Traders Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border-0">
          {traders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Traders Found</h3>
              <p className="text-gray-600">No trader applications have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop & Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {traders.map((trader) => (
                    <tr key={trader.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {trader.shop_logo && (
                            <img
                              src={trader.shop_logo}
                              alt={trader.shop_name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {trader.shop_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {trader.owner_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{trader.owner_email}</div>
                        <div className="text-sm text-gray-500">{trader.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trader.status)}`}>
                          {trader.status.charAt(0).toUpperCase() + trader.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(trader.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {trader.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(trader.id, 'approve')}
                              disabled={actionLoading === trader.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(trader.id, 'reject')}
                              disabled={actionLoading === trader.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {trader.status === 'approved' && (
                          <button
                            onClick={() => handleAction(trader.id, 'block')}
                            disabled={actionLoading === trader.id}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50 px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                          >
                            Block
                          </button>
                        )}
                        {trader.status === 'blocked' && (
                          <button
                            onClick={() => handleAction(trader.id, 'unblock')}
                            disabled={actionLoading === trader.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Unblock
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(trader.id)}
                          disabled={actionLoading === trader.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}