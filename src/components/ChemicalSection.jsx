import React, { useState } from 'react';
import ChemicalModal from './ChemicalModal';
import useChemicals from '../hooks/useChemicals';
import { supabase } from '../lib/supabaseClient';

const ChemicalSection = ({ companyId }) => {
  const { chemicals, fetchChemicals, loading } = useChemicals(companyId);
  const [showChemicalModal, setShowChemicalModal] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);

  const handleAddChemical = async form => {
    setShowChemicalModal(false);
    await supabase.from('chemicals').insert([
      {
        company_id: companyId,
        name: form.name,
        type: form.type,
        has_msds: !!form.has_msds
      }
    ]);
    fetchChemicals();
  };

  const handleUpdateChemical = async form => {
    if (!form.id) return;
    await supabase
      .from('chemicals')
      .update({
        name: form.name,
        type: form.type,
        has_msds: !!form.has_msds
      })
      .eq('id', form.id);
    fetchChemicals();
  };

  const handleDeleteChemical = async chemical => {
    if (!chemical?.id) return;
    await supabase.from('chemicals').delete().eq('id', chemical.id);
    fetchChemicals();
  };

  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;

  return (
    <>
      <div
        className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
        onClick={() => setShowChemicalModal(true)}
      >
        <span className="text-2xl mr-2">+</span> Kimyasal Ekle
      </div>
      <div className="flex flex-col gap-2">
        {chemicals.map(item => (
          <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedChemical(item)}>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">{item.name}</div>
              <div className="flex items-center gap-2">
                {item.has_msds ? (
                  <div className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">MSDS Var</div>
                ) : (
                  <div className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600">MSDS Yok</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <ChemicalModal
          open={!!showChemicalModal || !!selectedChemical}
          onClose={() => { setShowChemicalModal(false); setSelectedChemical(null); }}
          onAdd={handleAddChemical}
          onUpdate={handleUpdateChemical}
          chemical={selectedChemical}
          onDelete={handleDeleteChemical}
        />
      </div>
    </>
  );
};

export default ChemicalSection;
