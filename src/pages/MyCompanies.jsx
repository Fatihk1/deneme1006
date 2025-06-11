import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const MyCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setCompanies([]);
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

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Firmalarım</h2>
          <button
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white dark:text-gray-900 rounded-xl font-semibold shadow-lg transition text-lg"
            onClick={() => navigate('/add-company')}
          >
            + Firma Ekle
          </button>
        </div>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Yükleniyor...</div>
        ) : companies.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">Henüz bir firma eklemediniz.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {companies.map((company) => (
              <div key={company.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:scale-105 transition-transform cursor-pointer w-full dark:text-gray-100" onClick={() => navigate(`/company/${company.id}`)}>
                <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{company.company_name}</div>
                <div className="text-gray-400 dark:text-gray-300 text-sm">Firma Kodu: {company.company_code}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">Çalışan Sayısı: {company.employee_count ?? 0}</div>
                <div className="text-gray-400 dark:text-gray-400 text-xs mt-2">{company.city} / {company.district}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCompanies; 