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
    <div
      className="min-h-screen w-full flex items-center justify-center bg-fixed bg-contain bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/src/assets/backgrounds/bg1.jpg)',
        backgroundColor: '#fff',
      }}
    >
      <div className="w-full bg-white bg-opacity-90 rounded-none shadow-none p-2 flex flex-col items-center">
        <div className="text-5xl mb-4 animate-pulse">🤖</div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">AI Raportör</h1>
        <div className="w-full mb-6 px-2">
          <label className="block text-gray-700 font-semibold mb-2 text-left">Firma Seçiniz</label>
          {loading ? (
            <div className="text-gray-500">Firmalar yükleniyor...</div>
          ) : (
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
        <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-lg">Rapor Oluştur</button>
        {selectedCompany && (
          <div className="mt-6 w-full text-left text-sm text-gray-700 px-2">
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