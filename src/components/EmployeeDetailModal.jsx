import React, { useState, useEffect } from 'react';
import ScrollDatePicker from './ScrollDatePicker.jsx';
import { supabase } from '../lib/supabaseClient';
import { addYears } from '../utils';

const UNVAN_LIST = [
  'Çalışan', 'Yönetici', 'Müdür', 'Ekip Sorumlusu', 'Usta', 'Kalfa', 'Çırak', 'Diğer'
];
const POZISYON_LIST = [
  'Muhasebe', 'Satış Temsilcisi', 'Saha Çalışanı', 'Diğer'
];
const CINSIYET_LIST = ['Kadın', 'Erkek'];
const CALISMA_SEKLI_LIST = ['Tam Zamanlı', 'Yarı Zamanlı', 'Teşeron', 'Stajyer'];

const EmployeeDetailModal = ({ open, onClose, employee, dangerClass, onUpdate, assignments = [], ppeDeliveries = [] }) => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [changed, setChanged] = useState(false);
  const [showJobTitleOther, setShowJobTitleOther] = useState(false);
  const [showPositionOther, setShowPositionOther] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ assignments: [], ppe: [] });

  useEffect(() => {
    if (employee) {
      const hasHealthReport = employee.health_report && employee.health_report !== '0000-00-00';
      setForm({
        ...employee,
        has_health_report: hasHealthReport,
        job_title: UNVAN_LIST.includes(employee.job_title) ? employee.job_title : 'Diğer',
        job_title_other: UNVAN_LIST.includes(employee.job_title) ? '' : employee.job_title,
        position: POZISYON_LIST.includes(employee.position) ? employee.position : 'Diğer',
        position_other: POZISYON_LIST.includes(employee.position) ? '' : employee.position
      });
      setShowJobTitleOther(!UNVAN_LIST.includes(employee.job_title));
      setShowPositionOther(!POZISYON_LIST.includes(employee.position));
    }
    setEdit(false);
    setChanged(false);
  }, [employee, open]);

  useEffect(() => {
    if (employee && employee.id) {
      const relatedAssignments = assignments.filter(a => a.employee_id === employee.id);
      const relatedPpe = ppeDeliveries.filter(p => p.employee_id === employee.id);
      setDeleteInfo({ assignments: relatedAssignments, ppe: relatedPpe });
    } else {
      setDeleteInfo({ assignments: [], ppe: [] });
    }
  }, [employee, assignments, ppeDeliveries]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setChanged(true);
    if (name === 'job_title') setShowJobTitleOther(value === 'Diğer');
    if (name === 'position') setShowPositionOther(value === 'Diğer');
  };

  const handleCheckboxChange = e => {
    setForm(f => ({ ...f, has_health_report: e.target.checked }));
    setChanged(true);
  };

  const handlePhoneChange = e => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    let formatted = '';
    if (value.length > 0) formatted += value.slice(0, 3);
    if (value.length > 3) formatted += ' ' + value.slice(3, 6);
    if (value.length > 6) formatted += ' ' + value.slice(6, 8);
    if (value.length > 8) formatted += ' ' + value.slice(8, 10);
    setForm(f => ({ ...f, phone: formatted }));
    setChanged(true);
  };

  useEffect(() => {
    if (form.health_report && dangerClass) {
      let years = 5;
      if (dangerClass === 'Tehlikeli') years = 3;
      if (dangerClass === 'Çok Tehlikeli') years = 2;
      setForm(f => ({ ...f, report_refresh: addYears(form.health_report, years) }));
    }
  }, [form.health_report, dangerClass]);

  const handleClose = () => {
    if (edit && changed) setShowConfirmClose(true);
    else onClose();
  };

  const handleSave = () => {
    setShowConfirmSave(true);
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const doSave = async () => {
    setShowConfirmSave(false);
    setEdit(false);
    setChanged(false);
    await onUpdate(form);
    onClose();
  };

  const doDelete = async () => {
    setShowConfirmDelete(false);
    if (!employee?.id) return;
    for (const a of deleteInfo.assignments) {
      await supabase.from('assignments').delete().eq('id', a.id);
    }
    for (const p of deleteInfo.ppe) {
      await supabase.from('ppe_deliveries').delete().eq('id', p.id);
    }
    await supabase.from('employees').delete().eq('id', employee.id);
    onClose();
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={handleClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Çalışan Detay</h2>
        <form className="space-y-3">
          <div className="flex gap-2">
            <input name="first_name" value={form.first_name || ''} onChange={handleChange} disabled={!edit} placeholder="Ad" className="w-1/2 px-3 py-2 border rounded-lg" />
            <input name="last_name" value={form.last_name || ''} onChange={handleChange} disabled={!edit} placeholder="Soyad" className="w-1/2 px-3 py-2 border rounded-lg" />
          </div>
          <input name="identity_number" value={form.identity_number || ''} onChange={handleChange} disabled={!edit} placeholder="TC Kimlik No" className="w-full px-3 py-2 border rounded-lg" maxLength={11} />
          <div className="flex gap-2">
            <div className="w-1/2">
              <select name="job_title" value={form.job_title || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Ünvan</option>
                {UNVAN_LIST.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {showJobTitleOther && edit && (
                <input name="job_title_other" value={form.job_title_other || ''} onChange={handleChange} placeholder="Diğer Ünvan" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
            <div className="w-1/2">
              <select name="position" value={form.position || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Pozisyon</option>
                {POZISYON_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {showPositionOther && edit && (
                <input name="position_other" value={form.position_other || ''} onChange={handleChange} placeholder="Diğer Pozisyon" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
          </div>
          <input name="department" value={form.department || ''} onChange={handleChange} disabled={!edit} placeholder="Departman" className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">Doğum Tarihi</label>
              <ScrollDatePicker name="birth_date" value={form.birth_date || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">İşe Başlama Tarihi</label>
              <ScrollDatePicker name="start_date" value={form.start_date || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <select name="gender" value={form.gender || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Cinsiyet</option>
            {CINSIYET_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="address" value={form.address || ''} onChange={handleChange} disabled={!edit} placeholder="Adres" className="w-full px-3 py-2 border rounded-lg" />
          <input name="phone" value={form.phone || ''} onChange={handlePhoneChange} disabled={!edit} placeholder="Telefon" className="w-full px-3 py-2 border rounded-lg" maxLength={13} />
          <input name="email" value={form.email || ''} onChange={handleChange} disabled={!edit} placeholder="Email" className="w-full px-3 py-2 border rounded-lg" />
          <select name="employment_type" value={form.employment_type || ''} onChange={handleChange} disabled={!edit} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Çalışma Şekli</option>
            {CALISMA_SEKLI_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="has_health_report"
              checked={form.has_health_report || false}
              onChange={handleCheckboxChange}
              disabled={!edit}
              className="mr-2"
            />
            <label>Sağlık raporu var:</label>
          </div>
          {form.has_health_report && (
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Sağlık Raporu Tarihi</label>
                <ScrollDatePicker
                  name="health_report"
                  value={form.health_report || ''}
                  onChange={handleChange}
                  disabled={!edit}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Rapor Yenileme Tarihi</label>
                <ScrollDatePicker
                  name="report_refresh"
                  value={form.report_refresh || ''}
                  onChange={() => {}}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>
            </div>
          )}
        </form>
        <div className="flex gap-4 mt-6 justify-between items-center">
          {!edit && (
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
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col gap-4 min-w-[340px] max-w-[90vw]">
              <div className="text-lg font-semibold mb-2">Çıkarmak istediğiniz personelin aşağıdaki kayıtları da silinecek:</div>
              {deleteInfo.assignments.length > 0 && (
                <div className="mb-2">
                  <div className="font-bold">Görevleri:</div>
                  <ul className="list-disc ml-6 text-sm">
                    {deleteInfo.assignments.map(a => (
                      <li key={a.id}>{a.role}</li>
                    ))}
                  </ul>
                </div>
              )}
              {deleteInfo.ppe.length > 0 && (
                <div className="mb-2">
                  <div className="font-bold">KKD Ekipmanları:</div>
                  <ul className="list-disc ml-6 text-sm">
                    {deleteInfo.ppe.map(p => (
                      <li key={p.id}>{Array.isArray(p.delivered_ppe) ? p.delivered_ppe.join(', ') : (p.delivered_ppe ? JSON.parse(p.delivered_ppe).join(', ') : '')}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(deleteInfo.assignments.length > 0 || deleteInfo.ppe.length > 0) && (
                <div className="text-sm text-red-600 font-semibold mt-2">Lütfen görev alanında oluşacak boşluğu kontrol ediniz.</div>
              )}
              <div className="flex gap-4 justify-end mt-4">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold" onClick={doDelete}>Evet, Sil</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold" onClick={() => setShowConfirmDelete(false)}>İptal</button>
              </div>
            </div>
          </div>
        )}
        {showConfirmClose && (
          <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col gap-4">
              <div className="text-lg font-semibold">Yaptığınız değişiklikleri kaydetmeden kapatıyorsunuz. Onaylıyor musunuz?</div>
              <div className="flex gap-4 justify-end">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold" onClick={() => { setShowConfirmClose(false); onClose(); }}>Evet</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold" onClick={() => setShowConfirmClose(false)}>Hayır</button>
              </div>
            </div>
          </div>
        )}
        {showConfirmSave && (
          <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/40">
            <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col gap-4">
              <div className="text-lg font-semibold">Değişiklikler yapılacaktır, onaylıyor musunuz?</div>
              <div className="flex gap-4 justify-end">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold" onClick={doSave}>Evet</button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold" onClick={() => setShowConfirmSave(false)}>Hayır</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default EmployeeDetailModal;
