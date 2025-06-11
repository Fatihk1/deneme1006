import React, { useState, useEffect } from 'react';

const PPE_OPTIONS = [
  'Baret',
  'Koruyucu gözlük',
  'Kulak tıkacı',
  'Toz maskesi (FFP2)',
  'Nitril eldiven',
  'İş elbisesi',
  'Reflektif yelek',
  'Çelik burunlu iş ayakkabısı',
  'Emniyet kemeri',
  'Kaynakçı önlüğü',
  'Diğer'
];

const PpeDeliveryModal = ({ open, onClose, onAdd, delivery, employees, company, onDelete, onUpdate }) => {
  const [form, setForm] = useState({
    id: '',
    employee_id: '',
    delivered_ppe: [],
    delivery_date: '',
    delivered_by: '',
    has_report: false
  });
  const [edit, setEdit] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [ppeList, setPpeList] = useState([]);
  const [ppeType, setPpeType] = useState('');
  const [ppeOther, setPpeOther] = useState('');
  const [deliveredByType, setDeliveredByType] = useState('select');
  const [deliveredByOther, setDeliveredByOther] = useState('');

  useEffect(() => {
    if (delivery) {
      const deliveredPpeArr = delivery.delivered_ppe ? (Array.isArray(delivery.delivered_ppe) ? delivery.delivered_ppe : (delivery.delivered_ppe.startsWith('[') ? JSON.parse(delivery.delivered_ppe) : delivery.delivered_ppe.split(','))) : [];
      setForm({
        id: delivery.id,
        employee_id: delivery.employee_id || '',
        delivered_ppe: deliveredPpeArr,
        delivery_date: delivery.delivery_date || '',
        delivered_by: delivery.delivered_by || '',
        has_report: !!delivery.has_report
      });
      setPpeList(deliveredPpeArr);
      setDeliveredByType('select');
      setDeliveredByOther('');
      setEdit(false);
      setChanged(false);
    } else {
      setForm({ employee_id: '', delivered_ppe: [], delivery_date: '', delivered_by: getEmployerName(company) + ' (işveren)', has_report: false });
      setPpeList([]);
      setDeliveredByType('select');
      setDeliveredByOther('');
      setEdit(true);
      setChanged(false);
    }
    setPpeType('');
    setPpeOther('');
  }, [delivery, open, company]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setChanged(true);
  };

  const handleEmployeeChange = e => {
    setForm(f => ({ ...f, employee_id: e.target.value }));
    setChanged(true);
  };

  const handlePpeTypeChange = e => {
    setPpeType(e.target.value);
    setPpeOther('');
  };

  const handlePpeOtherChange = e => {
    setPpeOther(e.target.value);
  };

  const handleAddPpe = () => {
    let value = ppeType === 'Diğer' ? ppeOther.trim() : ppeType;
    if (value && !ppeList.includes(value)) {
      const newList = [...ppeList, value];
      setPpeList(newList);
      setForm(f => ({ ...f, delivered_ppe: newList }));
      setPpeType('');
      setPpeOther('');
      setChanged(true);
    }
  };

  const handleRemovePpe = (item) => {
    const newList = ppeList.filter(p => p !== item);
    setPpeList(newList);
    setForm(f => ({ ...f, delivered_ppe: newList }));
    setChanged(true);
  };

  const handleDeliveredByTypeChange = e => {
    if (e.target.value === 'Diğer') {
      setDeliveredByType('other');
      setForm(f => ({ ...f, delivered_by: '' }));
    } else {
      setDeliveredByType('select');
      setForm(f => ({ ...f, delivered_by: e.target.value }));
    }
    setChanged(true);
  };

  const handleDeliveredByOtherChange = e => {
    setDeliveredByOther(e.target.value);
    setForm(f => ({ ...f, delivered_by: e.target.value }));
    setChanged(true);
  };

  const handleClose = () => {
    if (edit && changed) {
      if (window.confirm('Değişiklikleri kaydetmeden kapatmak istediğinize emin misiniz?')) onClose();
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (delivery && onUpdate) {
      onUpdate({
        ...form,
        id: delivery.id,
        delivered_ppe: ppeList
      });
    } else if (onAdd) {
      onAdd({
        ...form,
        delivered_ppe: ppeList
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
    if (onDelete && delivery?.id) {
      await onDelete(delivery);
      onClose();
    }
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">KKD Teslim Detay</h2>
        <form className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Teslim Alan</label>
            <select
              name="employee_id"
              value={form.employee_id}
              onChange={handleEmployeeChange}
              disabled={!edit}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="" disabled>Seçiniz</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Teslim Edilen KKD</label>
            <div className="flex gap-2">
              <select
                value={ppeType}
                onChange={handlePpeTypeChange}
                disabled={!edit}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seçiniz</option>
                {PPE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {ppeType === 'Diğer' && (
                <input
                  value={ppeOther}
                  onChange={handlePpeOtherChange}
                  placeholder="Diğer KKD"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={handleAddPpe}
                disabled={!edit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Ekle
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ppeList.map((item, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-2">
                  <span>{item}</span>
                  {edit && (
                    <button
                      type="button"
                      onClick={() => handleRemovePpe(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Teslim Tarihi</label>
            <input
              type="date"
              name="delivery_date"
              value={form.delivery_date}
              onChange={handleChange}
              disabled={!edit}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Teslim Eden</label>
            <div className="flex gap-2">
              <select
                value={deliveredByType === 'select' ? form.delivered_by : 'Diğer'}
                onChange={handleDeliveredByTypeChange}
                disabled={!edit}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seçiniz</option>
                <option value={getEmployerName(company) + ' (işveren)'}>{getEmployerName(company)} (işveren)</option>
                <option value="Diğer">Diğer</option>
              </select>
              {deliveredByType === 'other' && (
                <input
                  value={deliveredByOther}
                  onChange={handleDeliveredByOtherChange}
                  placeholder="Diğer Teslim Eden"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              )}
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="has_report"
              checked={form.has_report}
              onChange={handleChange}
              disabled={!edit}
              className="mr-2"
            />
            <label>Kullanım talimatı var:</label>
          </div>
          <div className="flex gap-4 mt-6 justify-between items-center">
            {!edit && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                onClick={handleDelete}
                type="button"
              >
                Sil
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              {!edit ? (
                <>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    onClick={() => setEdit(true)}
                    type="button"
                  >
                    Düzenle
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                    onClick={handleClose}
                    type="button"
                  >
                    Kapat
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    onClick={handleSave}
                    type="button"
                  >
                    Kaydet
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
                    onClick={handleClose}
                    type="button"
                  >
                    Kapat
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
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

const getEmployerName = (company) => {
  if (!company) return '';
  if (company.owner_name) return company.owner_name;
  if (company.employer_name) return company.employer_name;
  if (company.name) return company.name;
  if (company.company_name) return company.company_name;
  return '';
};

export default PpeDeliveryModal; 