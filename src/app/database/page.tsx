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
      
      // Convert data to CSV format
      const headers = Object.keys(creators[0]);
      const csvContent = [
        headers.join(','), // Header row
        ...creators.map(creator => 
          headers.map(header => {
            const value = creator[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
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
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex items-center">
                  <span className="text-xl font-bold">⊕</span>
                  <span className="ml-2 text-sm text-gray-300">Bitcoin Influencer</span>
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
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">🔥 Creators Database</h1>
            <p className="text-gray-400">Find, filter, and export the most relevant crypto profiles on the internet.</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
               <h2 className="text-xl font-semibold mb-6 text-center">📥 Download Influencer Dataset</h2>
               
               <div className="text-center">
                 <button
                   onClick={handleDatabaseAction}
                   disabled={loading}
                   className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
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