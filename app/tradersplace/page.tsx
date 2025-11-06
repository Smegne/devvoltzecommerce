'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TraderData {
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

export default function TradersPlacePage() {
  const router = useRouter();
  const [traderData, setTraderData] = useState<TraderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        console.log('🔐 Checking auth - Token:', token ? 'Present' : 'Missing');
        console.log('👤 User data:', userData);
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('✅ User found:', parsedUser.email);
          fetchTraderData(parsedUser.id);
        } else {
          console.log('❌ No auth token or user data found');
          setLoading(false);
          setError('Please login to access trader dashboard');
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
        setLoading(false);
        setError('Authentication error. Please login again.');
      }
    };

    const fetchTraderData = async (userId: number) => {
      try {
        console.log('🔄 Fetching trader data for user ID:', userId);
        const response = await fetch(`/api/trader?userId=${userId}`);
        
        console.log('📨 Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Trader account not found. Please apply as a trader first.');
          } else {
            setError('Failed to fetch trader data');
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        console.log('📊 Trader API response:', result);

        if (result.success && result.trader) {
          setTraderData(result.trader);
          console.log('✅ Trader data loaded:', result.trader.shop_name);
        } else {
          setError(result.message || 'Trader data not found');
        }
      } catch (err) {
        console.error('❌ Fetch trader data error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/traderlogin');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trader dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <a 
              href="/traderlogin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Login
            </a>
            <a 
              href="/tradershop"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 inline-block"
            >
              Apply as Trader
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!traderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trader Account Found</h3>
          <p className="text-gray-600 mb-4">
            You have successfully registered, but your trader application is being processed.
            {user && <span><br />User ID: {user.id} | Email: {user.email}</span>}
          </p>
          <div className="space-x-4">
            <a 
              href="/tradershop"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Check Application Status
            </a>
            <button 
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 inline-block"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              {traderData.shop_logo && (
                <img
                  src={traderData.shop_logo}
                  alt={traderData.shop_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{traderData.shop_name}</h1>
                <p className="text-gray-600">Welcome back, {traderData.owner_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(traderData.status)}`}>
                {traderData.status.charAt(0).toUpperCase() + traderData.status.slice(1)}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg border border-gray-300 hover:border-gray-400 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trader Menu</h3>
              <nav className="space-y-2">
                <a href="#" className="block px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                  Dashboard
                </a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Products
                </a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Orders
                </a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Analytics
                </a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Settings
                </a>
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">$0.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Status Message */}
            {traderData.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-800">Application Under Review</h4>
                    <p className="text-yellow-700 mt-1">
                      Your trader application is being reviewed. You'll be able to manage products once approved.
                      Check back later or contact support for updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shop Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Owner Name</dt>
                      <dd className="text-gray-900">{traderData.owner_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Email</dt>
                      <dd className="text-gray-900">{traderData.owner_email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Phone</dt>
                      <dd className="text-gray-900">{traderData.phone}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Shop Details</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Shop Address</dt>
                      <dd className="text-gray-900">{traderData.shop_address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Description</dt>
                      <dd className="text-gray-900">
                        {traderData.shop_description || 'No description provided'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Action Cards - Only show if approved */}
            {traderData.status === 'approved' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Products</h3>
                  <p className="text-gray-600 mb-4">Start adding your products to the marketplace.</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Add Product
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
                  <p className="text-gray-600 mb-4">Check and manage your customer orders.</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    View Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}