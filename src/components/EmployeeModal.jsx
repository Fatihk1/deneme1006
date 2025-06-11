import React, { useState, useEffect } from 'react';

const UNVAN_LIST = [
  'Çalışan', 'Yönetici', 'Müdür', 'Ekip Sorumlusu', 'Usta', 'Kalfa', 'Çırak', 'Diğer'
];
const POZISYON_LIST = [
  'Muhasebe', 'Satış Temsilcisi', 'Saha Çalışanı', 'Diğer'
];
const CINSIYET_LIST = ['Kadın', 'Erkek'];
const CALISMA_SEKLI_LIST = ['Tam Zamanlı', 'Yarı Zamanlı', 'Teşeron', 'Stajyer'];

function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

const EmployeeModal = ({ open, onClose, onAdd, dangerClass }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    identity_number: '',
    job_title: '',
    job_title_other: '',
    position: '',
    position_other: '',
    department: '',
    birth_date: '',
    start_date: '',
    gender: '',
    address: '',
    phone: '',
    email: '',
    employment_type: '',
    health_report: '',
    report_refresh: '',
    has_health_report: false
  });
  const [showJobTitleOther, setShowJobTitleOther] = useState(false);
  const [showPositionOther, setShowPositionOther] = useState(false);

  useEffect(() => {
    if (form.health_report && dangerClass) {
      let years = 5;
      if (dangerClass === 'Tehlikeli') years = 3;
      if (dangerClass === 'Çok Tehlikeli') years = 2;
      setForm(f => ({ ...f, report_refresh: addYears(form.health_report, years) }));
    }
  }, [form.health_report, dangerClass]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'job_title') setShowJobTitleOther(value === 'Diğer');
    if (name === 'position') setShowPositionOther(value === 'Diğer');
  };

  const handleCheckboxChange = e => {
    setForm(f => ({ ...f, has_health_report: e.target.checked }));
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
  };

  const handleSubmit = e => {
    e.preventDefault();
    onAdd(form);
  };

  return open ? (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Çalışan Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="Ad" className="w-1/2 px-3 py-2 border rounded-lg" />
            <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Soyad" className="w-1/2 px-3 py-2 border rounded-lg" />
          </div>
          <input name="identity_number" value={form.identity_number} onChange={handleChange} required placeholder="TC Kimlik No" className="w-full px-3 py-2 border rounded-lg" maxLength={11} />
          <div className="flex gap-2">
            <div className="w-1/2">
              <select name="job_title" value={form.job_title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Ünvan</option>
                {UNVAN_LIST.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {showJobTitleOther && (
                <input name="job_title_other" value={form.job_title_other} onChange={handleChange} placeholder="Diğer Ünvan" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
            <div className="w-1/2">
              <select name="position" value={form.position} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                <option value="">Pozisyon</option>
                {POZISYON_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {showPositionOther && (
                <input name="position_other" value={form.position_other} onChange={handleChange} placeholder="Diğer Pozisyon" className="w-full px-3 py-2 border rounded-lg mt-1" />
              )}
            </div>
          </div>
          <input name="department" value={form.department} onChange={handleChange} placeholder="Departman" className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">Doğum Tarihi</label>
              <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="w-1/2">
              <label className="block text-xs text-gray-500 mb-1">İşe Başlama Tarihi</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
            <option value="">Cinsiyet</option>
            {CINSIYET_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Adres" className="w-full px-3 py-2 border rounded-lg" />
          <input name="phone" value={form.phone} onChange={handlePhoneChange} placeholder="Telefon" className="w-full px-3 py-2 border rounded-lg" maxLength={13} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded-lg" />
          <select name="employment_type" value={form.employment_type} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
            <option value="">Çalışma Şekli</option>
            {CALISMA_SEKLI_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="has_health_report" 
              checked={form.has_health_report} 
              onChange={handleCheckboxChange} 
              className="mr-2" 
            />
            <label>Sağlık raporu var:</label>
          </div>
          {form.has_health_report && (
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Sağlık Raporu Tarihi</label>
                <input 
                  type="date" 
                  name="health_report" 
                  value={form.health_report} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Rapor Yenileme Tarihi</label>
                <input 
                  type="date" 
                  name="report_refresh" 
                  value={form.report_refresh} 
                  readOnly 
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100" 
                />
              </div>
            </div>
          )}
          <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">Kaydet</button>
        </form>
      </div>
    </div>
  ) : null;
};

export default EmployeeModal; 