import React from 'react';

const DeleteConfirmationDialog = ({ isOpen, onCancel, onConfirm, itemType, itemName }) => {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (itemType) {
      case 'user': return 'Hapus User';
      case 'course': return 'Hapus Mata Kuliah';
      case 'class': return 'Hapus Kelas';
      default: return 'Hapus Item';
    }
  };

  const getConfirmationText = () => {
    switch (itemType) {
      case 'user': return 'user';
      case 'course': return 'mata kuliah';
      case 'class': return 'kelas';
      default: return 'item';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {getTitle()}
        </h3>
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus {getConfirmationText()} <span className="font-semibold">{itemName}</span>? 
          {itemType === 'class' && (
            <span className="block mt-2 text-sm text-orange-600">
              Semua mahasiswa yang terdaftar di kelas ini akan dihapus dari kelas.
            </span>
          )}
          <span className="block mt-2 text-sm">Tindakan ini tidak dapat dibatalkan.</span>
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;