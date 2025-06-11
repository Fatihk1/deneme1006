import React, { useState } from 'react';
import PpeDeliveryModal from './PpeDeliveryModal';
import usePpeDeliveries from '../hooks/usePpeDeliveries';
import useEmployees from '../hooks/useEmployees';
import { supabase } from '../lib/supabaseClient';

const PpeSection = ({ companyId, company }) => {
  const { ppeDeliveries, fetchPpeDeliveries, loading } = usePpeDeliveries(companyId);
  const { employees } = useEmployees(companyId);
  const [showPpeModal, setShowPpeModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const handleAddPpeDelivery = async form => {
    setShowPpeModal(false);
    const employee = employees.find(e => e.id === form.employee_id);
    await supabase.from('ppe_deliveries').insert([
      {
        company_id: companyId,
        employee_id: form.employee_id,
        employee_first_name: employee?.first_name || '',
        employee_last_name: employee?.last_name || '',
        delivered_ppe: JSON.stringify(form.delivered_ppe),
        delivery_date: form.delivery_date,
        delivered_by: form.delivered_by,
        usage_instruction: form.has_report ? 'var' : 'yok',
      }
    ]);
    fetchPpeDeliveries();
  };

  const handleUpdatePpeDelivery = async form => {
    if (!form.id) return;
    const employee = employees.find(e => e.id === form.employee_id);
    await supabase
      .from('ppe_deliveries')
      .update({
        employee_id: form.employee_id,
        employee_first_name: employee?.first_name || '',
        employee_last_name: employee?.last_name || '',
        delivered_ppe: JSON.stringify(form.delivered_ppe),
        delivery_date: form.delivery_date,
        delivered_by: form.delivered_by,
        usage_instruction: form.has_report ? 'var' : 'yok',
      })
      .eq('id', form.id);
    fetchPpeDeliveries();
  };

  const handleDeletePpeDelivery = async delivery => {
    if (!delivery?.id) return;
    await supabase.from('ppe_deliveries').delete().eq('id', delivery.id);
    fetchPpeDeliveries();
  };

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;

  return (
    <>
      <div
        className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
        onClick={() => setShowPpeModal(true)}
      >
        <span className="text-2xl mr-2">+</span> KKD Teslim Ekle
      </div>
      <div className="flex flex-col gap-2">
        {ppeDeliveries.map(item => (
          <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedDelivery(item)}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">{item.employee_first_name} {item.employee_last_name}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${item.usage_instruction === 'var' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{item.usage_instruction === 'var' ? 'Tutanak Var' : 'Tutanak Yok'}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">{item.delivery_date}</span>
              </div>
            </div>
            <div className="text-sm text-gray-700 mt-2 text-left">
              {Array.isArray(item.delivered_ppe) ? item.delivered_ppe.join(', ') : (item.delivered_ppe ? JSON.parse(item.delivered_ppe).join(', ') : '')}
            </div>
          </div>
        ))}
        <PpeDeliveryModal
          open={!!showPpeModal || !!selectedDelivery}
          onClose={() => { setShowPpeModal(false); setSelectedDelivery(null); }}
          onAdd={handleAddPpeDelivery}
          onUpdate={handleUpdatePpeDelivery}
          delivery={selectedDelivery}
          employees={employees}
          company={company}
          onDelete={handleDeletePpeDelivery}
        />
      </div>
    </>
  );
};

export default PpeSection;
