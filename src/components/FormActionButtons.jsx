import React from 'react';

const FormActionButtons = ({
  edit,
  onEdit,
  onSave,
  onDelete,
  onClose,
  showDelete = false,
  showEdit = false,
  showSave = false,
  showClose = true,
  loading = false
}) => (
  <div className="flex gap-4 mt-6 justify-between items-center">
    {showDelete && !edit && (
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
        onClick={onDelete}
        type="button"
      >
        Sil
      </button>
    )}
    <div className="flex gap-4 ml-auto">
      {showEdit && !edit && (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={onEdit}
          type="button"
        >
          Düzenle
        </button>
      )}
      {showSave && edit && (
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          onClick={onSave}
          type="button"
          disabled={loading}
        >
          Kaydet
        </button>
      )}
      {showClose && (
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
          onClick={onClose}
          type="button"
        >
          Kapat
        </button>
      )}
    </div>
  </div>
);

export default FormActionButtons; 
