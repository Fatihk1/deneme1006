import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import vdler from '../data/vd.json';
import iller from '../data/il.json';
import ilceler from '../data/ilce.json';

const initialState = {
  company_name: '',
  tax_office: '',
  tax_number: '',
  nace_code: '',
  sgk_number: '',
  address: '',
  city: '',
  district: '',
  working_start: '',
  working_end: '',
  danger_class: '',
};

const AddCompany = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [taxOfficeInput, setTaxOfficeInput] = useState('');
  const [showTaxOfficeList, setShowTaxOfficeList] = useState(false);
  const navigate = useNavigate();

  // Vergi dairesi listesi düzleştiriliyor
  const allTaxOffices = Object.values(vdler).flat();

  // Alfabetik sıralı il listesi
  const sortedIller = [...iller].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  // İl seçilince ilçeleri filtrele
  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setForm({ ...form, city: cityId, district: '' });
    const cityDistricts = ilceler.filter((ilce) => ilce.il_id === cityId);
    setFilteredDistricts(cityDistricts);
  };

  // Vergi dairesi filtreleme (sadece baş harflerden başlayanlar)
  const filteredTaxOffices = taxOfficeInput.length < 2 ? [] : allTaxOffices.filter(vd =>
    vd.vdadi.toLowerCase().startsWith(taxOfficeInput.toLowerCase())
  ).slice(0, 10); // ilk 10 sonucu göster

  // Vergi dairesi autocomplete/select
  const handleTaxOfficeInput = (e) => {
    setTaxOfficeInput(e.target.value);
    setForm({ ...form, tax_office: '' });
    setShowTaxOfficeList(true);
  };
  const handleTaxOfficeSelect = (vdadi) => {
    setForm({ ...form, tax_office: vdadi });
    setTaxOfficeInput(vdadi);
    setShowTaxOfficeList(false);
  };
  const handleTaxOfficeBlur = () => {
    setTimeout(() => setShowTaxOfficeList(false), 100); // seçim için kısa gecikme
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      const owner_id = session.user.id;
      const company_code = 'F' + Math.random().toString(36).substring(2, 8).toUpperCase();
      if (!allTaxOffices.some((vd) => vd.vdadi === taxOfficeInput)) {
        setError('Lütfen listeden bir vergi dairesi seçin.');
        setLoading(false);
        return;
      }
      if (!iller.some((il) => il.id === form.city)) {
        setError('Lütfen listeden bir il seçin.');
        setLoading(false);
        return;
      }
      if (!filteredDistricts.some((ilce) => ilce.name === form.district)) {
        setError('Lütfen listeden bir ilçe seçin.');
        setLoading(false);
        return;
      }
      const selectedIl = iller.find((il) => il.id === form.city)?.name || '';
      const selectedIlce = filteredDistricts.find((ilce) => ilce.name === form.district)?.name || '';
      const { error: insertError } = await supabase.from('companies').insert([
        {
          owner_id,
          company_code,
          company_name: form.company_name,
          tax_office: taxOfficeInput,
          tax_number: form.tax_number,
          nace_code: form.nace_code,
          danger_class: form.danger_class,
          sgk_number: form.sgk_number,
          address: form.address,
          city: selectedIl,
          district: selectedIlce,
          working_hours: form.working_start + ' - ' + form.working_end,
          employee_count: 0
        }
      ]);
      if (insertError) throw insertError;
      navigate('/my-companies');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg space-y-4 dark:text-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Yeni Firma Ekle</h2>
        {error && <div className="bg-red-100 dark:bg-red-900/40 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 p-2 rounded mb-2">{error}</div>}
        <input name="company_name" value={form.company_name} onChange={handleChange} required placeholder="Firma Adı" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
        {/* Vergi Dairesi autocomplete/select */}
        <div className="relative">
          <input
            name="tax_office"
            value={taxOfficeInput}
            onChange={handleTaxOfficeInput}
            onFocus={() => setShowTaxOfficeList(true)}
            onBlur={handleTaxOfficeBlur}
            required
            placeholder="Vergi Dairesi"
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
            autoComplete="off"
          />
          {showTaxOfficeList && filteredTaxOffices.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-700 border rounded-lg shadow max-h-48 overflow-auto mt-1 border-gray-300 dark:border-gray-600">
              {filteredTaxOffices.map((vd) => (
                <li
                  key={vd.kod}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  onMouseDown={() => handleTaxOfficeSelect(vd.vdadi)}
                >
                  {vd.vdadi}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input name="tax_number" value={form.tax_number} onChange={handleChange} placeholder="Vergi Numarası" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
        <input name="nace_code" value={form.nace_code} onChange={handleChange} placeholder="NACE Kodu" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
        {/* Tehlike Sınıfı seçimi */}
        <select name="danger_class" value={form.danger_class || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
          <option value="">Tehlike Sınıfı Seçiniz</option>
          <option value="Az Tehlikeli">Az Tehlikeli</option>
          <option value="Tehlikeli">Tehlikeli</option>
          <option value="Çok Tehlikeli">Çok Tehlikeli</option>
        </select>
        <input name="sgk_number" value={form.sgk_number} onChange={handleChange} placeholder="İşyeri SGK Sicil Numarası" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Adres" className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
        {/* İl ve ilçe select */}
        <div className="flex gap-2">
          <select name="city" value={form.city} onChange={handleCityChange} required className="w-1/2 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
            <option value="">İl Seçiniz</option>
            {sortedIller.map((il) => (
              <option key={il.id} value={il.id}>{il.name}</option>
            ))}
          </select>
          <select name="district" value={form.district} onChange={handleChange} required className="w-1/2 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
            <option value="">İlçe Seçiniz</option>
            {filteredDistricts.map((ilce) => (
              <option key={ilce.id} value={ilce.name}>{ilce.name}</option>
            ))}
          </select>
        </div>
        {/* Çalışma saatleri */}
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Başlangıç Saati</label>
            <input type="time" name="working_start" value={form.working_start} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bitiş Saati</label>
            <input type="time" name="working_end" value={form.working_end} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white dark:text-gray-900 rounded-lg font-semibold transition">
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default AddCompany; 