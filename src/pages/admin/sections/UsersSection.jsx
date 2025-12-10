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
  setIsMahasiswaModalOpen,
  handleEditUser
}) => {
  const filteredUsers = getFilteredUsers();
  
  // Debug logging
  React.useEffect(() => {
    console.log('UsersSection - Total users:', users.length);
    console.log('UsersSection - Filtered users:', filteredUsers.length);
    console.log('UsersSection - Users data:', users);
  }, [users, filteredUsers]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manajemen User</h2>
          <p className="text-sm text-gray-600">Kelola akun dosen dan mahasiswa</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
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
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
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
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsDosenModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Dosen
            </button>
            <button
              onClick={() => setIsMahasiswaModalOpen(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Mahasiswa
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">Total</div>
          <div className="text-lg font-bold text-purple-900">{filteredUsers.length} <span className="text-sm font-normal text-purple-600">dari {users.length}</span></div>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">Dosen</div>
          <div className="text-lg font-bold text-blue-900">{users.filter(u => u.role === 'dosen').length}</div>
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <div className="text-xs text-green-600 font-medium">Mahasiswa</div>
          <div className="text-lg font-bold text-green-900">{users.filter(u => u.role === 'mahasiswa').length}</div>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Terdaftar</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.nama_lengkap || 'Nama tidak tersedia'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        {user.role === 'dosen' && user.nip && <div className="text-xs text-gray-500">NIP: {user.nip}</div>}
                        {user.role === 'mahasiswa' && (user.npm || user.nim) && <div className="text-xs text-gray-500">NPM: {user.npm || user.nim}</div>}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                      user.role === 'dosen' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      user.role === 'mahasiswa' ? 'bg-green-100 text-green-800 border border-green-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                      user.is_active ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => handleEditUser && handleEditUser(user)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button 
                          className={`p-2 rounded-lg transition-all ${
                            user.is_active 
                              ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                          }`}
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
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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