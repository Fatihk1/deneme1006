import React, { useState } from 'react';
import { getDaysLeft } from '../utils';
import MachineModal from './MachineModal';
import useMachines from '../hooks/useMachines';
import { supabase } from '../lib/supabaseClient';

const MachineSection = ({ companyId }) => {
  const { machines, fetchMachines, loading } = useMachines(companyId);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const handleAddMachine = async form => {
    setShowMachineModal(false);
    await supabase.from('machines').insert([
      {
        company_id: companyId,
        name: form.name === 'Diğer' ? form.name_other : form.name,
        quantity: Number(form.quantity),
        maintenance_date: form.maintenance_date,
        maintenance_period: Number(form.maintenance_period),
        maintenance_validity_date: form.maintenance_validity_date
      }
    ]);
    fetchMachines();
  };

  const handleUpdateMachine = async form => {
    if (!form.id) return;
    await supabase
      .from('machines')
      .update({
        name: form.name === 'Diğer' ? form.name_other : form.name,
        quantity: Number(form.quantity),
        maintenance_date: form.maintenance_date,
        maintenance_period: Number(form.maintenance_period),
        maintenance_validity_date: form.maintenance_validity_date
      })
      .eq('id', form.id);
    fetchMachines();
  };

  const handleDeleteMachine = async machine => {
    if (!machine?.id) return;
    await supabase.from('machines').delete().eq('id', machine.id);
    fetchMachines();
  };

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;

  return (
    <>
      <div
        className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
        onClick={() => setShowMachineModal(true)}
      >
        <span className="text-2xl mr-2">+</span> Makine Ekle
      </div>
      <div className="flex flex-col gap-2">
        {machines.map(item => {
          const daysLeft = item.maintenance_validity_date ? getDaysLeft(item.maintenance_validity_date) : null;
          return (
            <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedMachine(item)}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{item.name}</div>
                {daysLeft !== null && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>Bakıma Kalan: {daysLeft} gün</div>
                )}
              </div>
            </div>
          );
        })}
        <MachineModal
          open={!!showMachineModal || !!selectedMachine}
          onClose={() => { setShowMachineModal(false); setSelectedMachine(null); }}
          onAdd={handleAddMachine}
          onUpdate={handleUpdateMachine}
          machine={selectedMachine}
          onDelete={handleDeleteMachine}
        />
      </div>
    </>
  );
};

export default MachineSection;
