import React, { useState, useEffect } from 'react';

const CHEMICAL_TYPE_OPTIONS = [
  'Temizlik kimyasalları',
  'Üretim kimyasalları',
  'Tarım kimyasalları',
  'Gıda katkı kimyasalları',
  'Laboratuvar kimyasalları',
  'Diğer'
];
const CHEMICAL_NAME_OPTIONS = [
  'Çamaşır suyu',
  'Tuz ruhu',
  'Deterjanlar',
  'Boya',
  'Tiner',
  'Reçine',
  'Solvent',
  'Pestisit',
  'Herbisit',
  'Gübre',
  'Asitlik düzenleyici',
  'Koruyucu',
  'Asitler',
  'Bazlar',
  'Indikatörler',
  'Diğer'
];

const ChemicalModal = ({ open, onClose, onAdd, chemical, onDelete, onUpdate }) => {
  const [form, setForm] = useState({
    type: '',
    type_other: '',
    name: '',
    name_other: '',
    quantity: '',
    has_msds: false
  });
  const [showTypeOther, setShowTypeOther] = useState(false);
  const [showNameOther, setShowNameOther] = useState(false);
  const [edit, setEdit] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (chemical) {
      setForm({
        type: CHEMICAL_TYPE_OPTIONS.includes(chemical.type) ? chemical.type : 'Diğer',
        type_other: CHEMICAL_TYPE_OPTIONS.includes(chemical.type) ? '' : chemical.type,
        name: CHEMICAL_NAME_OPTIONS.includes(chemical.name) ? chemical.name : 'Diğer',
        name_other: CHEMICAL_NAME_OPTIONS.includes(chemical.name) ? '' : chemical.name,
        quantity: chemical.quantity || '',
        has_msds: !!chemical.has_msds
      });
      setShowTypeOther(!CHEMICAL_TYPE_OPTIONS.includes(chemical.type));
      setShowNameOther(!CHEMICAL_NAME_OPTIONS.includes(chemical.name));
      setEdit(false);
      setChanged(false);
    } else {
      setForm({ type: '', type_other: '', name: '', name_other: '', quantity: '', has_msds: false });
      setShowTypeOther(false);
      setShowNameOther(false);
      setEdit(true);
      setChanged(false);
    }
  }, [chemical, open]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setChanged(true);
    if (name === 'type') setShowTypeOther(value === 'Diğer');
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
    if (chemical && onUpdate) {
      onUpdate({
        ...form,
        id: chemical.id,
        type: form.type === 'Diğer' ? form.type_other : form.type,
        name: form.name === 'Diğer' ? form.name_other : form.name
      });
    } else if (onAdd) {
      onAdd({
        ...form,
        type: form.type === 'Diğer' ? form.type_other : form.type,
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
    if (onDelete && chemical?.id) {
      await onDelete(chemical);
      onClose();
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Kimyasal Detay</h2>
        <form className="space-y-3">
          <div className="flex gap-2">
            <div className="w-1/2">
              <select name="type" value={form.type} onChange={handleChange} disabled={!edit} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Kimyasal Tipi</option>
                {CHEMICAL_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {showTypeOther && (
                <input name="type_other" value={form.type_other} onChange={handleChange} disabled={!edit} placeholder="Diğer Kimyasal Tipi" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
            <div className="w-1/2">
              <select name="name" value={form.name} onChange={handleChange} disabled={!edit} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Kimyasal Adı</option>
                {CHEMICAL_NAME_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {showNameOther && (
                <input name="name_other" value={form.name_other} onChange={handleChange} disabled={!edit} placeholder="Diğer Kimyasal Adı" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
          </div>
          <input name="quantity" value={form.quantity} onChange={handleChange} disabled={!edit} required placeholder="Miktar" className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="has_msds" 
              checked={form.has_msds} 
              onChange={handleChange} 
              disabled={!edit}
              className="mr-2" 
            />
            <label>MSDS formu var:</label>
          </div>
        </form>
        <div className="flex gap-4 mt-6 justify-between items-center">
          {!edit && chemical && (
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

export default ChemicalModal; 