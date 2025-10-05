import React from 'react';
import { User, Edit, Trash2, CheckCircle, XCircle, ChevronDown, Search, Plus } from 'lucide-react';

const UsersSection = ({ 
  users, 
  roleFilter, 
  setRoleFilter, 
  statusFilter, 
  setStatusFilter, 
  searchQuery, 
  setSearchQuery,
  getFilteredUsers,
  toggleUserStatus,
  openDeleteConfirmation,
  setIsDosenModalOpen,
  setIsMahasiswaModalOpen
}) => {
  const filteredUsers = getFilteredUsers();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">Manajemen User</h2>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Semua User</option>
                <option value="dosen">Dosen</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="admin">Admin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <div className="relative ml-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsDosenModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              <Plus size={18} className="inline mr-1" />
              Dosen
            </button>
            <button
              onClick={() => setIsMahasiswaModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              <Plus size={18} className="inline mr-1" />
              Mahasiswa
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{filteredUsers.length}</span> dari {users.length} users
        </div>
        <div className="text-sm text-gray-500">
          Dosen: <span className="font-semibold">{users.filter(u => u.role === 'dosen').length}</span>
        </div>
        <div className="text-sm text-gray-500">
          Mahasiswa: <span className="font-semibold">{users.filter(u => u.role === 'mahasiswa').length}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terdaftar</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.nama_lengkap || 'Nama tidak tersedia'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.role === 'dosen' && user.nip && <div className="text-xs text-gray-500">NIP: {user.nip}</div>}
                        {user.role === 'mahasiswa' && user.nim && <div className="text-xs text-gray-500">NIM: {user.nim}</div>}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'dosen' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'mahasiswa' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    {user.role !== 'admin' && (
                      <button 
                        className={`${user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        onClick={() => toggleUserStatus(user.id, user.is_active, user.role)}
                      >
                        {user.is_active ? 
                          <XCircle className="h-4 w-4" /> : 
                          <CheckCircle className="h-4 w-4" />
                        }
                      </button>
                    )}
                    
                    <button
                      onClick={() => openDeleteConfirmation(user.id, 'user', user.nama_lengkap)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  {users.length > 0 ? 'Tidak ada user yang sesuai dengan filter.' : 'Belum ada user yang terdaftar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersSection;