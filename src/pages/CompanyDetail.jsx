import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import EmployeeSection from '../components/EmployeeSection';
import MachineSection from '../components/MachineSection';
import ChemicalSection from '../components/ChemicalSection';
import PpeSection from '../components/PpeSection';
import FireSection from '../components/FireSection';
import AssignmentSection from '../components/AssignmentSection';

const categories = [
  { key: 'employees', label: 'Çalışanlar' },
  { key: 'machines', label: 'Makineler' },
  { key: 'chemicals', label: 'Kimyasallar' },
  { key: 'ppe', label: 'KKD' },
  { key: 'fire', label: 'Yangın ve İlkyardım' },
  { key: 'assignments', label: 'Görev Atamaları' },
];

const tableMap = {
  employees: 'employees',
  machines: 'machines',
  chemicals: 'chemicals',
  ppe: 'ppe_deliveries',
  fire: 'fire_first_aid_equipments',
  assignments: 'assignments',
};

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCompany = async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      setCompany(data);
    };
    if (id) fetchCompany();
  }, [id]);

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts = {};
      for (const cat of categories) {
        const { count } = await supabase
          .from(tableMap[cat.key])
          .select('*', { count: 'exact', head: true })
          .eq('company_id', id);
        newCounts[cat.key] = count || 0;
      }
      setCounts(newCounts);
    };
    if (id) fetchCounts();
  }, [id]);

  if (!company) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Tehlike Sınıfı: {company.danger_class}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefon: {company.phone}</p>
              <p className="text-gray-600">Email: {company.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-8">
          {categories.map(cat => (
            <div
              key={cat.key}
              className={`flex flex-col items-center px-4 py-2 rounded-xl shadow cursor-pointer transition border-2 ${activeTab === cat.key ? 'border-blue-600 bg-white' : 'border-transparent bg-white/70 hover:bg-white'}`}
              onClick={() => setActiveTab(cat.key)}
            >
              <span className="font-semibold text-base">{cat.label}</span>
              <span className="text-xs text-gray-400 mt-1">{(counts[cat.key] ?? 0) + ' kayıt'}</span>
            </div>
          ))}
        </div>
        {activeTab === 'employees' && <EmployeeSection companyId={id} dangerClass={company.danger_class} />}
        {activeTab === 'machines' && <MachineSection companyId={id} />}
        {activeTab === 'chemicals' && <ChemicalSection companyId={id} />}
        {activeTab === 'ppe' && <PpeSection companyId={id} company={company} />}
        {activeTab === 'fire' && <FireSection companyId={id} />}
        {activeTab === 'assignments' && <AssignmentSection companyId={id} company={company} />}
      </div>
    </div>
  );
};

export default CompanyDetail;
