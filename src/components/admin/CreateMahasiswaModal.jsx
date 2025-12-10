import React, { useState, useRef } from 'react';
import { X, Plus, FileUp, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

const CreateMahasiswaModal = ({ isOpen, onClose, onSubmit }) => {
  const [mode, setMode] = useState('select'); // 'select', 'create', 'import'
  const [formData, setFormData] = useState({
    email: '',
    npm: '',
    nama_lengkap: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (formData.email.length > 255) {
      errors.email = 'Email tidak boleh lebih dari 255 karakter';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    // NPM validation
    if (!formData.npm) {
      errors.npm = 'NPM wajib diisi';
    } else if (formData.npm.length > 20) {
      errors.npm = 'NPM tidak boleh lebih dari 20 karakter';
    }
    
    // Nama lengkap validation
    if (!formData.nama_lengkap) {
      errors.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (formData.nama_lengkap.length > 255) {
      errors.nama_lengkap = 'Nama lengkap tidak boleh lebih dari 255 karakter';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Email': 'contoh@email.com',
        'NPM': '2020730001',
        'Nama Lengkap': 'Nama Mahasiswa'
      },
      {
        'Email': '',
        'NPM': '',
        'Nama Lengkap': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Mahasiswa');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Email
      { wch: 20 }, // NPM
      { wch: 30 }  // Nama Lengkap
    ];
    
    XLSX.writeFile(wb, 'template_mahasiswa.xlsx');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const processedData = [];
        const errors = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because index starts at 0 and Excel row starts at 2
          const processedRow = {
            email: row['Email']?.toString().trim() || '',
            npm: row['NPM']?.toString().trim() || '',
            nama_lengkap: row['Nama Lengkap']?.toString().trim() || ''
          };

          // Validate each row
          const rowErrors = [];
          
          if (!processedRow.email) {
            rowErrors.push('Email wajib diisi');
          } else if (!/\S+@\S+\.\S+/.test(processedRow.email)) {
            rowErrors.push('Format email tidak valid');
          }
          
          if (!processedRow.npm) {
            rowErrors.push('NPM wajib diisi');
          }
          
          if (!processedRow.nama_lengkap) {
            rowErrors.push('Nama lengkap wajib diisi');
          }

          if (rowErrors.length > 0) {
            errors.push({
              row: rowNumber,
              errors: rowErrors,
              data: processedRow
            });
          } else {
            processedData.push(processedRow);
          }
        });

        setImportData(processedData);
        setImportErrors(errors);
        setError(null);
      } catch (err) {
        setError('Gagal membaca file Excel. Pastikan format file benar.');
        console.error('Excel parsing error:', err);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleImportSubmit = async () => {
    if (importData.length === 0) {
      setError('Tidak ada data valid untuk diimport');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onSubmit({ type: 'import', data: importData });
      
      if (result.success) {
        // Show success message with details
        if (result.errors && result.errors.length > 0) {
          console.warn('Import completed with some errors:', result.errors);
          setError(`Import berhasil! ${result.users?.length || 0} mahasiswa berhasil dibuat, ${result.errors.length} data gagal diimport.`);
        } else {
          handleClose();
        }
      } else {
        setError(result.error || 'Gagal mengimport data mahasiswa');
      }
    } catch (err) {
      console.error("Import submission error:", err);
      setError(err.message || 'Failed to import mahasiswa data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log("Updated form data:", newData);
      return newData;
    });
    
    // Clear any error for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onSubmit({ type: 'create', data: formData });
      
      if (result.success) {
        // Close the modal and reset form on success
        handleClose();
      } else {
        // Display the error message
        setError(result.error);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || 'Failed to create mahasiswa');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMode('select');
    setFormData({
      email: '',
      nama_lengkap: '',
      npm: ''
    });
    setFieldErrors({});
    setImportData([]);
    setImportErrors([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const renderModeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Pilih Metode Penambahan Mahasiswa</h4>
        <p className="text-sm text-gray-600">Pilih salah satu metode untuk menambahkan mahasiswa baru</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => setMode('create')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Tambah Mahasiswa Baru</h5>
              <p className="text-sm text-gray-600">Tambahkan satu mahasiswa secara manual</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setMode('import')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200">
              <FileUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Import dari Excel</h5>
              <p className="text-sm text-gray-600">Import banyak mahasiswa sekaligus dari file Excel</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderCreateForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={() => setMode('select')}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h4 className="text-lg font-medium text-gray-900">Tambah Mahasiswa Baru</h4>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={255}
              className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
              placeholder="email@example.com"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NPM
            </label>
            <input
              type="text"
              name="npm"
              value={formData.npm}
              onChange={handleChange}
              required
              maxLength={20}
              className={`w-full px-3 py-2 border ${fieldErrors.npm ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
              placeholder="Nomor Pokok Mahasiswa (max 20 karakter)"
            />
            {fieldErrors.npm && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.npm}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.npm.length}/20 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="create-mahasiswa-nama-lengkap"
              name="nama_lengkap" 
              value={formData.nama_lengkap}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${fieldErrors.nama_lengkap ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
              placeholder="Nama lengkap mahasiswa"
              required
            />
            {fieldErrors.nama_lengkap && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.nama_lengkap}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Password default adalah "123". User harus segera mengubah password setelah login pertama kali.
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setMode('select')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
            >
              {isLoading ? 'Memproses...' : 'Simpan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderImportForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={() => setMode('select')}
          className="mr-3 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>
        <h4 className="text-lg font-medium text-gray-900">Import Mahasiswa dari Excel</h4>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900">Template Excel</h5>
              <p className="text-sm text-blue-700 mb-3">
                Download template Excel untuk format yang benar sebelum mengupload data mahasiswa.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File Excel
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format yang didukung: .xlsx, .xls (maksimal 5MB)
          </p>
        </div>

        {importErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-yellow-800 mb-2">
              Data dengan Error ({importErrors.length} baris):
            </h5>
            <div className="max-h-32 overflow-y-auto">
              {importErrors.map((error, index) => (
                <div key={index} className="text-xs text-yellow-700 mb-1">
                  <strong>Baris {error.row}:</strong> {error.errors.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {importData.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-green-800 mb-2">
              Data Valid Siap Import ({importData.length} mahasiswa):
            </h5>
            <div className="max-h-32 overflow-y-auto">
              {importData.slice(0, 5).map((data, index) => (
                <div key={index} className="text-xs text-green-700 mb-1">
                  {data.nama_lengkap} ({data.npm}) - {data.email}
                </div>
              ))}
              {importData.length > 5 && (
                <div className="text-xs text-green-600">
                  ... dan {importData.length - 5} data lainnya
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setMode('select')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Kembali
          </button>
          <button
            onClick={handleImportSubmit}
            disabled={isLoading || importData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Mengimport...' : `Import ${importData.length} Mahasiswa`}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'select' ? 'Tambah Mahasiswa' : 
             mode === 'create' ? 'Tambah Mahasiswa Baru' : 
             'Import Mahasiswa'}
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        {mode === 'select' && renderModeSelection()}
        {mode === 'create' && renderCreateForm()}
        {mode === 'import' && renderImportForm()}
      </div>
    </div>
  );
};

export default CreateMahasiswaModal;