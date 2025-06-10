import React, { useState, useEffect } from 'react';
import { FIRE_EQUIPMENT_OPTIONS } from '../constants/fireEquipmentOptions';

const FireEquipmentModal = ({ open, onClose, onAdd, equipment, onDelete }) => {
  const [form, setForm] = useState({
    equipment_type: '',
    equipment_type_other: '',
    quantity: 1,
    last_check_date: ''
  });
  const [edit, setEdit] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showTypeOther, setShowTypeOther] = useState(false);

  useEffect(() => {
    if (equipment) {
      setForm({
        equipment_type: FIRE_EQUIPMENT_OPTIONS.includes(equipment.equipment_type) ? equipment.equipment_type : 'Diğer',
        equipment_type_other: FIRE_EQUIPMENT_OPTIONS.includes(equipment.equipment_type) ? '' : equipment.equipment_type,
        quantity: equipment.quantity || 1,
        last_check_date: equipment.last_check_date || ''
      });
      setShowTypeOther(!FIRE_EQUIPMENT_OPTIONS.includes(equipment.equipment_type));
      setEdit(false);
      setChanged(false);
    } else {
      setForm({ equipment_type: '', equipment_type_other: '', quantity: 1, last_check_date: '' });
      setShowTypeOther(false);
      setEdit(true);
      setChanged(false);
    }
  }, [equipment, open]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Math.max(1, Number(value)) : value }));
    setChanged(true);
    if (name === 'equipment_type') setShowTypeOther(value === 'Diğer');
  };

  const handleClose = () => {
    if (edit && changed) {
      if (window.confirm('Değişiklikleri kaydetmeden kapatmak istediğinize emin misiniz?')) onClose();
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onAdd({
      ...form,
      equipment_type: form.equipment_type === 'Diğer' ? form.equipment_type_other : form.equipment_type
    });
    setEdit(false);
    setChanged(false);
    onClose();
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const doDelete = async () => {
    setShowConfirmDelete(false);
    if (onDelete && equipment?.id) {
      await onDelete(equipment);
      onClose();
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Ekipman Detay</h2>
        <form className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ekipman Türü</label>
            <select
              name="equipment_type"
              value={form.equipment_type}
              onChange={handleChange}
              disabled={!edit}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="" disabled>Seçiniz</option>
              {FIRE_EQUIPMENT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {showTypeOther && (
              <input
                name="equipment_type_other"
                value={form.equipment_type_other}
                onChange={handleChange}
                disabled={!edit}
                placeholder="Diğer - manuel giriş"
                className="w-full px-3 py-2 border rounded-lg mt-2"
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Adet</label>
            <input
              type="number"
              name="quantity"
              min={1}
              value={form.quantity}
              onChange={handleChange}
              disabled={!edit}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Son Kontrol Tarihi</label>
            <input
              type="date"
              name="last_check_date"
              value={form.last_check_date}
              onChange={handleChange}
              disabled={!edit}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </form>
        <div className="flex gap-4 mt-6 justify-between items-center">
          {!edit && equipment && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition" onClick={handleDelete} type="button">Sil</button>
          )}
          <div className="flex gap-4 ml-auto">
            {!edit ? (
              <>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => setEdit(true)}>Düzenle</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition" onClick={handleClose}>Kapat</button>
              </>
            ) : (
              <>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition" onClick={handleSave}>Kaydet</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition" onClick={handleClose}>Kapat</button>
              </>
            )}
          </div>
        </div>
        {showConfirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col gap-4">
              <div className="text-lg font-semibold">Kayıt silinecektir, emin misiniz?</div>
              <div className="flex gap-4 justify-end">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold" onClick={doDelete}>Evet</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold" onClick={() => setShowConfirmDelete(false)}>Hayır</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default FireEquipmentModal; 