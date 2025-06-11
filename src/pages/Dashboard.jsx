import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const cardData = [
  {
    title: 'Raporlarım',
    description: 'Oluşturduğunuz ve size atanan tüm raporları görüntüleyin.',
    icon: '📄',
    link: '#',
  },
];

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('name, user_type')
      .eq('id', userId)
      .single();
    if (!error) setProfile(data);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">Hoşgeldin, {profile.name}!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">({profile.user_type === 'employer' ? 'İşveren/Vekili' : 'ISG Uzmanı'})</p>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 sm:gap-6 mb-8">
          {/* Raporlarım */}
          {cardData.map((card, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer flex-shrink-0 w-56 dark:text-gray-100">
              <div className="text-4xl mb-3">{card.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{card.title}</h2>
              <p className="text-gray-500 dark:text-gray-300 text-center mb-4">{card.description}</p>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-blue-700 transition">İncele</button>
            </div>
          ))}
          {/* Firmalarım */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer flex-shrink-0 w-56 dark:text-gray-100" onClick={() => navigate('/my-companies')}>
            <div className="text-4xl mb-3">🏢</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Firmalarım</h2>
            <p className="text-gray-500 dark:text-gray-300 text-center mb-4">Eklediğiniz tüm firmaları görüntüleyin.</p>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-blue-700 transition">Görüntüle</button>
          </div>
          {/* AI Raportör */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-4 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer text-white border-2 border-indigo-400 flex-shrink-0 w-56" onClick={() => navigate('/ai-reporter')}>
            <div className="text-5xl mb-3 animate-pulse">🤖</div>
            <h2 className="text-2xl font-bold mb-2 text-white">AI Raportör</h2>
            <p className="text-indigo-100 text-center mb-4">Yapay zeka destekli otomatik rapor oluşturucu ile tanışın.</p>
            <button className="px-3 py-1.5 text-sm bg-white text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition dark:text-indigo-700">Başlat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 