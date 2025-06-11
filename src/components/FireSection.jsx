import React, { useState } from 'react';
import FireEquipmentModal from './FireEquipmentModal';
import useFireEquipments from '../hooks/useFireEquipments';
import { supabase } from '../lib/supabaseClient';
import { getFireEquipmentDaysLeft } from '../utils';

const FireSection = ({ companyId }) => {
  const { fireEquipments, fetchFireEquipments, loading } = useFireEquipments(companyId);
  const [showFireModal, setShowFireModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const handleAdd = async form => {
    setShowFireModal(false);
    const equipmentType = form.equipment_type === 'Diğer' ? form.equipment_type_other : form.equipment_type;
    if (!equipmentType || equipmentType.trim() === '') return;
    await supabase.from('fire_first_aid_equipments').insert([
      {
        company_id: companyId,
        equipment_type: equipmentType,
        quantity: Number(form.quantity),
        last_check_date: form.last_check_date
      }
    ]);
    fetchFireEquipments();
  };

  const handleUpdate = async form => {
    if (!form.id) return;
    const equipmentType = form.equipment_type === 'Diğer' ? form.equipment_type_other : form.equipment_type;
    await supabase
      .from('fire_first_aid_equipments')
      .update({
        equipment_type: equipmentType,
        quantity: Number(form.quantity),
        last_check_date: form.last_check_date
      })
      .eq('id', form.id);
    fetchFireEquipments();
  };

  const handleDelete = async eqp => {
    if (!eqp?.id) return;
    await supabase.from('fire_first_aid_equipments').delete().eq('id', eqp.id);
    fetchFireEquipments();
  };

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;

  return (
    <>
      <div
        className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-100 transition min-h-[64px] text-orange-700 font-bold text-lg gap-2"
        onClick={() => setShowFireModal(true)}
        style={{ minHeight: 64 }}
      >
        <span className="text-2xl mr-2">+</span> Ekipman Ekle
      </div>
      <div className="flex flex-col gap-2">
        {fireEquipments.map(item => {
          const daysLeft = getFireEquipmentDaysLeft(item.last_check_date);
          return (
            <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedEquipment(item)}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{item.equipment_type}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Adet: {item.quantity}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Son Kontrol: {item.last_check_date}</span>
                  {daysLeft !== null && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>Kalan: {daysLeft} gün</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <FireEquipmentModal
          open={!!showFireModal || !!selectedEquipment}
          onClose={() => { setShowFireModal(false); setSelectedEquipment(null); }}
          onAdd={selectedEquipment ? handleUpdate : handleAdd}
          equipment={selectedEquipment}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
};

export default FireSection;
