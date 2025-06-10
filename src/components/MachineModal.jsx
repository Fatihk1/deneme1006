import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const MAKINE_LIST = [
  'Dikiş Makinesi',
  'Overlok Makinesi',
  'Buharlı Ütü',
  'Diğer'
];

const MachineModal = ({ open, onClose, onAdd, machine, onDelete, onUpdate }) => {
  const [form, setForm] = useState({
    name: '',
    name_other: '',
    quantity: '',
    maintenance_date: '',
    maintenance_period: '',
    maintenance_validity_date: ''
  });
  const [showNameOther, setShowNameOther] = useState(false);
  const [edit, setEdit] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (machine) {
      setForm({
        name: MAKINE_LIST.includes(machine.name) ? machine.name : 'Diğer',
        name_other: MAKINE_LIST.includes(machine.name) ? '' : machine.name,
        quantity: machine.quantity || '',
        maintenance_date: machine.maintenance_date || '',
        maintenance_period: machine.maintenance_period || '',
        maintenance_validity_date: machine.maintenance_validity_date || ''
      });
      setShowNameOther(!MAKINE_LIST.includes(machine.name));
      setEdit(false);
      setChanged(false);
    } else {
      setForm({ name: '', name_other: '', quantity: '', maintenance_date: '', maintenance_period: '', maintenance_validity_date: '' });
      setShowNameOther(false);
      setEdit(true);
      setChanged(false);
    }
  }, [machine, open]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setChanged(true);
    if (name === 'name') setShowNameOther(value === 'Diğer');
  };

  const handleClose = () => {
    if (edit && changed) {
      if (window.confirm('Değişiklikleri kaydetmeden kapatmak istediğinize emin misiniz?')) onClose();
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (machine && onUpdate) {
      onUpdate({
        ...form,
        id: machine.id,
        name: form.name === 'Diğer' ? form.name_other : form.name
      });
    } else if (onAdd) {
      onAdd({
        ...form,
        name: form.name === 'Diğer' ? form.name_other : form.name
      });
    }
    setEdit(false);
    setChanged(false);
    onClose();
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const doDelete = async () => {
    setShowConfirmDelete(false);
    if (onDelete && machine?.id) {
      await onDelete(machine);
      onClose();
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Makine Detay</h2>
        <form className="space-y-3">
          <div className="flex gap-2">
            <div className="w-1/2">
              <select name="name" value={form.name} onChange={handleChange} disabled={!edit} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Makine Adı</option>
                {MAKINE_LIST.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {showNameOther && (
                <input name="name_other" value={form.name_other} onChange={handleChange} disabled={!edit} placeholder="Diğer Makine Adı" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
            <div className="w-1/2">
              <input name="quantity" value={form.quantity} onChange={handleChange} disabled={!edit} required placeholder="Adet" className="w-full px-3 py-2 border rounded-lg" type="number" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">Bakım Tarihi</label>
              <input type="date" name="maintenance_date" value={form.maintenance_date} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">Bakım Periyodu (Ay)</label>
              <input type="number" name="maintenance_period" value={form.maintenance_period} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="w-full">
            <label className="block text-xs text-gray-500 mb-1">Bakım Geçerlilik Tarihi</label>
            <input type="date" name="maintenance_validity_date" value={form.maintenance_validity_date} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </form>
        <div className="flex gap-4 mt-6 justify-between items-center">
          {!edit && machine && (
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

export default MachineModal; 