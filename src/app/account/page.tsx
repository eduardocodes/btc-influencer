'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  current_period_end?: string;
}

export default function Account() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user profile
      setUserProfile({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at || new Date().toISOString()
      });

      // Load subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('current_period_end', { ascending: false });

      if (subscriptionsError) {
        console.error('Error loading subscriptions:', subscriptionsError);
      } else {
        setSubscriptions(subscriptionsData || []);
        const activeSubscription = subscriptionsData?.find(sub => sub.status === 'active');
        setHasActiveSubscription(!!activeSubscription);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset message
    setPasswordMessage(null);
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({type: 'error', text: 'All fields are required'});
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({type: 'error', text: 'New password must be at least 6 characters'});
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({type: 'error', text: 'Passwords do not match'});
      return;
    }
    
    if (currentPassword === newPassword) {
      setPasswordMessage({type: 'error', text: 'New password must be different from current password'});
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setPasswordMessage({type: 'error', text: error.message});
      } else {
        setPasswordMessage({type: 'success', text: 'Password changed successfully!'});
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordMessage({type: 'error', text: 'Error changing password. Please try again.'});
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading account data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <img src="/btc-influencer-icon.svg" alt="Bitcoin Influencer" className="h-10 w-auto" />
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/home')}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center justify-center cursor-pointer"
                  title="Back to Home"
                  aria-label="Back to Home"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors flex items-center justify-center cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-orange-500 rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Account Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">{userProfile?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm mb-1">Member since</p>
                  <p className="text-white font-medium">
                    {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className={`rounded-full p-3 mr-4 ${
                  hasActiveSubscription ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Subscription Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasActiveSubscription 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {hasActiveSubscription ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {subscriptions.length > 0 ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Subscription History:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="bg-gray-700/50 rounded p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-white">
                              {subscription.plan || 'Pro Plan'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              subscription.status === 'active' 
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {subscription.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No subscriptions found</p>
                    <button
                      onClick={() => router.push('/home')}
                      className="mt-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm transition-colors cursor-pointer"
                    >
                      Explore Plans
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-8">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-6 border border-gray-600/50 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="bg-blue-500 rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Change Password</h2>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-gray-400 text-sm mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Enter your current password"
                    disabled={passwordLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-gray-400 text-sm mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Enter your new password (min. 6 characters)"
                    disabled={passwordLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-400 text-sm mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    placeholder="Confirm your new password"
                    disabled={passwordLoading}
                  />
                </div>
                
                {passwordMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    passwordMessage.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}
                
                <button
                   type="submit"
                   disabled={passwordLoading}
                   className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg text-white font-medium transition-colors cursor-pointer flex items-center justify-center"
                 >
                   {passwordLoading ? (
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   ) : (
                     'Change Password'
                   )}
                 </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}