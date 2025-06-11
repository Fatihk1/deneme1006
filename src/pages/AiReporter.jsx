import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AiReporter = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCompanies([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });
      if (!error) setCompanies(data);
      setLoading(false);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const found = companies.find(c => c.id === selectedCompanyId);
      setSelectedCompany(found || null);
    } else {
      setSelectedCompany(null);
    }
  }, [selectedCompanyId, companies]);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-100 rounded-none shadow-none p-2 flex flex-col items-center dark:text-gray-100">
        <div className="text-5xl mb-4 animate-pulse">🤖</div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">AI Raportör</h1>
        <div className="w-full mb-6 px-2">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-left">Firma Seçiniz</label>
          {loading ? (
            <div className="text-gray-500 dark:text-gray-400">Firmalar yükleniyor...</div>
          ) : (
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100"
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Firma seçin...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          )}
        </div>
        <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-lg dark:text-gray-900">Rapor Oluştur</button>
        {selectedCompany && (
          <div className="mt-6 w-full text-left text-sm text-gray-700 dark:text-gray-300 px-2">
            <div><b>Seçili Firma:</b> {selectedCompany.company_name}</div>
            <div><b>Firma Kodu:</b> {selectedCompany.company_code}</div>
            <div><b>Çalışan Sayısı:</b> {selectedCompany.employee_count ?? 0}</div>
            <div><b>Şehir:</b> {selectedCompany.city} / {selectedCompany.district}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiReporter; 