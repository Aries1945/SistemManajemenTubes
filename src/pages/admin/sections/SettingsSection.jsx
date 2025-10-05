import React from 'react';

const SettingsSection = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Konfigurasi Database</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Host</label>
              <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="localhost" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Port</label>
              <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" defaultValue="5432" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center mt-1">
                <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Pengaturan Aplikasi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Aplikasi</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" 
                defaultValue="UNPAR Task Management" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Versi</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
                defaultValue="1.0.0" 
                disabled 
              />
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;