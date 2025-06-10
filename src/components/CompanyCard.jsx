import React from 'react';

const CompanyCard = ({ company, onClick }) => (
  <div
    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:scale-105 transition-transform cursor-pointer"
    onClick={onClick}
  >
    <div className="text-xl font-bold text-gray-800 mb-1">{company.company_name}</div>
    <div className="text-gray-400 text-sm">Firma Kodu: {company.company_code}</div>
    <div className="text-gray-500 text-sm">Çalışan Sayısı: {company.employee_count ?? 0}</div>
    <div className="text-gray-400 text-xs mt-2">{company.city} / {company.district}</div>
  </div>
);

export default CompanyCard;
