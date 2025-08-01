'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase } from '../../utils/supabase';

export default function DatabasePage() {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDatabaseAction = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Fetch all creators from Supabase
      const { data: creators, error } = await supabase
        .from('creators')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (!creators || creators.length === 0) {
        setMessage('No creators found in the database.');
        return;
      }
      
      // Convert data to CSV format (excluding 'id' column)
      const headers = Object.keys(creators[0]).filter(key => key !== 'id');
      const csvContent = [
        headers.join(','), // Header row
        ...creators.map(creator => 
          headers.map(header => {
            const value = creator[header];
            // Handle null/undefined values
            if (value === null || value === undefined) {
              return '';
            }
            // Handle boolean values
            if (typeof value === 'boolean') {
              return value.toString();
            }
            // Handle arrays
            if (Array.isArray(value)) {
              return `"${value.join(';')}"`;
            }
            // Escape commas, quotes, and newlines in CSV for strings
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r'))) {
              return `"${value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`;
            }
            return value.toString();
          }).join(',')
        )
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `crypto_creators_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage('Successfully exported!');
    } catch (error) {
      setMessage('Error exporting creators data.');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleMatchesClick = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-lg shadow-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <img src="/btc-influencer-icon.svg" alt="Bitcoin Influencer" className="h-10 w-auto" />
                </div>
                
                <nav className="flex space-x-6">
                  <a href="/" onClick={handleMatchesClick} className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium cursor-pointer">Matches</a>
                  <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">Database</a>
                </nav>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-orange-500 text-sm">⚡ Full Access</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span>🔥</span> <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Creators Database</span>
            </h1>
            <p className="text-gray-400">Find, filter, and export the most relevant crypto profiles on the internet.</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl p-8 border border-gray-600/50 shadow-2xl shadow-black/50 backdrop-blur-sm">
               <h2 className="text-xl font-semibold mb-6 text-center">
                 <span>📥</span> <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Download Influencer Dataset</span>
               </h2>
               
               <div className="text-center">
                 <button
                   onClick={handleDatabaseAction}
                   disabled={loading}
                   className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transform transition-all duration-300"
                 >
                     {loading ? (
                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                       'Export the complete list of crypto creators now'
                     )}
                   </button>
                
                {message && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    message.includes('Error') 
                      ? 'bg-red-900 text-red-200' 
                      : 'bg-green-900 text-green-200'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}