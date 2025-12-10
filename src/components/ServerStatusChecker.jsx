import React, { useState, useEffect } from 'react';
import { AlertTriangle, Server, RefreshCcw, LogOut } from 'lucide-react';

const ServerStatusChecker = ({ onServerAvailable }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking');
  const [error, setError] = useState(null);

  const checkServerStatus = async () => {
    try {
      setIsChecking(true);
      setError(null);
      
      // Try to ping the server
      const response = await fetch('http://localhost:5001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 401) {
        // Server is running (even if auth fails, server is up)
        setServerStatus('running');
        onServerAvailable?.();
      } else {
        setServerStatus('error');
        setError(`Server responded with status: ${response.status}`);
      }
    } catch (err) {
      setServerStatus('down');
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (serverStatus === 'running') {
    return null; // Server is running, don't show this component
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          {isChecking ? (
            <RefreshCcw className="h-8 w-8 animate-spin" />
          ) : (
            <Server className="h-8 w-8" />
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {isChecking ? 'Checking Server Status...' : 'Server Connection Issue'}
        </h2>
        
        {!isChecking && (
          <>
            <p className="text-gray-500 mb-4">
              {serverStatus === 'down' 
                ? 'Cannot connect to backend server'
                : `Server error: ${error}`
              }
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={checkServerStatus}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Check Again</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-yellow-800">Possible Solutions:</h4>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                    <li>• Ensure backend server is running on port 5001</li>
                    <li>• Check your internet connection</li>
                    <li>• Verify server configuration</li>
                    <li>• Try logging in again</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServerStatusChecker;