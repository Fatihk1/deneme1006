import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import EmployeeModal from '../components/EmployeeModal';
import MachineModal from '../components/MachineModal';
import ChemicalModal from '../components/ChemicalModal';
import PpeDeliveryModal from '../components/PpeDeliveryModal';
import FireEquipmentModal from '../components/FireEquipmentModal';
import EmployeeDetailModal from '../components/EmployeeDetailModal';
import { addYears, getDaysLeft, addMonths, getFireEquipmentDaysLeft } from '../utils';
import useEmployees from '../hooks/useEmployees';
import useMachines from '../hooks/useMachines';
import useChemicals from '../hooks/useChemicals';
import usePpeDeliveries from '../hooks/usePpeDeliveries';
import useFireEquipments from '../hooks/useFireEquipments';
import useAssignments from '../hooks/useAssignments';
import AssignmentCard from '../components/AssignmentCard';

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


// Makine isimleri listesi
const MAKINE_LIST = [
  'Dikiş Makinesi',
  'Overlok Makinesi',
  'Buharlı Ütü',
  'Diğer'
];

const CHEMICAL_TYPE_OPTIONS = [
  'Temizlik kimyasalları',
  'Üretim kimyasalları',
  'Tarım kimyasalları',
  'Gıda katkı kimyasalları',
  'Laboratuvar kimyasalları',
  'Diğer'
];
const CHEMICAL_NAME_OPTIONS = [
  'Çamaşır suyu',
  'Tuz ruhu',
  'Deterjanlar',
  'Boya',
  'Tiner',
  'Reçine',
  'Solvent',
  'Pestisit',
  'Herbisit',
  'Gübre',
  'Asitlik düzenleyici',
  'Koruyucu',
  'Asitler',
  'Bazlar',
  'Indikatörler',
  'Diğer'
];

const PPE_OPTIONS = [
  'Baret',
  'Koruyucu gözlük',
  'Kulak tıkacı',
  'Toz maskesi (FFP2)',
  'Nitril eldiven',
  'İş elbisesi',
  'Reflektif yelek',
  'Çelik burunlu iş ayakkabısı',
  'Emniyet kemeri',
  'Kaynakçı önlüğü',
  'Diğer'
];

const FIRE_EQUIPMENT_OPTIONS = [
  'Yangın Tüpü',
  'Yangın Dolabı',
  'İlk Yardım Dolabı',
  'İlkyardım Çantası',
  'Diğer'
];


const getEmployerName = (company) => {
  // Eğer company tablosunda işveren adı soyadı tutuluyorsa buradan alınır, yoksa company_name kullanılır
  if (!company) return '';
  if (company.owner_name) return company.owner_name;
  if (company.employer_name) return company.employer_name;
  if (company.name) return company.name;
  if (company.company_name) return company.company_name;
  return '';
};

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [counts, setCounts] = useState({});
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const { machines: machineList, loading: machinesLoading, fetchMachines } = useMachines(id);
  const { chemicals: chemicalList, loading: chemicalsLoading, fetchChemicals } = useChemicals(id);
  const { ppeDeliveries: ppeList, loading: ppeLoading, fetchPpeDeliveries } = usePpeDeliveries(id);
  const { fireEquipments: fireList, loading: fireLoading, fetchFireEquipments } = useFireEquipments(id);
  const { employees: employeeList, loading: employeesLoading, fetchEmployees } = useEmployees(id);
  const [showChemicalModal, setShowChemicalModal] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);
  const [showPpeModal, setShowPpeModal] = useState(false);
  const [selectedPpeDelivery, setSelectedPpeDelivery] = useState(null);
  const [showFireModal, setShowFireModal] = useState(false);
  const [selectedFireEquipment, setSelectedFireEquipment] = useState(null);
  const { assignments, loading: assignmentsLoading, fetchAssignments, addAssignment, deleteAssignment } = useAssignments(id && id.length > 0 ? id : null);

  useEffect(() => {
    const fetchCompany = async () => {
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      setCompany(data);
    };
    fetchCompany();
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
    fetchCounts();
  }, [id]);

  useEffect(() => {
    // Sadece tableMap'te olan tablolara ve id gerçekten uuid ise sorgu at
    if (!id || typeof id !== 'string' || id.length < 10 || !tableMap[activeTab]) return;
    const fetchList = async () => {
      setLoading(true);
      const { data } = await supabase
        .from(tableMap[activeTab])
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false });
      setList(data || []);
      setLoading(false);
    };
    fetchList();
  }, [id, activeTab]);

  // Çalışan sayısını güncelleyen fonksiyonu CompanyDetail fonksiyonunun gövdesine taşıyorum
  const fetchEmployeeCount = async () => {
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', id);
    setEmployeeCount(count);
  };

  useEffect(() => {
    fetchEmployeeCount();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'machines') {
      fetchMachines();
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === 'chemicals') {
      fetchChemicals();
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === 'ppe') {
      fetchEmployees();
      fetchPpeDeliveries();
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab === 'fire') {
      fetchFireEquipments();
    }
  }, [activeTab, id]);

  const handleAddEmployee = async (form) => {
    setShowEmployeeModal(false);
    // Sağlık raporu yoksa alanları düzelt
    const hasHealthReport = form.has_health_report && form.health_report && form.health_report !== '';
    await supabase.from('employees').insert([
      {
        company_id: id,
        first_name: form.first_name,
        last_name: form.last_name,
        identity_number: form.identity_number,
        job_title: form.job_title === 'Diğer' ? form.job_title_other : form.job_title,
        position: form.position === 'Diğer' ? form.position_other : form.position,
        department: form.department,
        birth_date: form.birth_date,
        start_date: form.start_date,
        gender: form.gender,
        address: form.address,
        phone: form.phone,
        email: form.email,
        employment_type: form.employment_type,
        health_report: hasHealthReport ? form.health_report : null,
        report_refresh: hasHealthReport ? form.report_refresh : null
      }
    ]);
    await fetchEmployees();
    await fetchEmployeeCount();
  };

  const handleUpdateEmployee = async (form) => {
    if (!form.id) return;
    // Diğer seçeneği için manuel girilen değerleri kontrol et
    const jobTitle = form.job_title === 'Diğer' ? form.job_title_other : form.job_title;
    const position = form.position === 'Diğer' ? form.position_other : form.position;
    // Sağlık raporu yoksa alanları düzelt
    const hasHealthReport = form.has_health_report && form.health_report && form.health_report !== '';
    const { error } = await supabase
      .from('employees')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        identity_number: form.identity_number,
        job_title: jobTitle,
        position: position,
        department: form.department,
        birth_date: form.birth_date,
        start_date: form.start_date,
        gender: form.gender,
        address: form.address,
        phone: form.phone,
        email: form.email,
        employment_type: form.employment_type,
        health_report: hasHealthReport ? form.health_report : null,
        report_refresh: hasHealthReport ? form.report_refresh : null
      })
      .eq('id', form.id);
    if (error) {
      console.error('Güncelleme hatası:', error);
      return;
    }
    // fetchList() kaldırıldı, liste güncellemesi ana bileşende state ile yapılacak
  };

  const handleAddMachine = async (form) => {
    setShowMachineModal(false);
    await supabase.from('machines').insert([
      {
        company_id: id,
        name: form.name === 'Diğer' ? form.name_other : form.name,
        quantity: Number(form.quantity),
        maintenance_date: form.maintenance_date,
        maintenance_period: Number(form.maintenance_period),
        maintenance_validity_date: form.maintenance_validity_date
      }
    ]);
    fetchMachines();
  };

  const handleUpdateMachine = async (form) => {
    if (!form.id) return;
    await supabase.from('machines').update({
      name: form.name === 'Diğer' ? form.name_other : form.name,
      quantity: Number(form.quantity),
      maintenance_date: form.maintenance_date,
      maintenance_period: Number(form.maintenance_period),
      maintenance_validity_date: form.maintenance_validity_date
    }).eq('id', form.id);
    fetchMachines();
  };

  const handleDeleteMachine = async (machine) => {
    if (!machine?.id) return;
    await supabase.from('machines').delete().eq('id', machine.id);
    fetchMachines();
  };

  const handleAddChemical = async (form) => {
    setShowChemicalModal(false);
    await supabase.from('chemicals').insert([
      {
        company_id: id,
        name: form.name,
        type: form.type,
        has_msds: !!form.has_msds
      }
    ]);
    fetchChemicals();
  };

  const handleUpdateChemical = async (form) => {
    if (!form.id) return;
    await supabase.from('chemicals').update({
      name: form.name,
      type: form.type,
      has_msds: !!form.has_msds
    }).eq('id', form.id);
    fetchChemicals();
  };

  const handleDeleteChemical = async (chemical) => {
    if (!chemical?.id) return;
    await supabase.from('chemicals').delete().eq('id', chemical.id);
    fetchChemicals();
  };

  const handleAddPpeDelivery = async (form) => {
    setShowPpeModal(false);
    const employee = employeeList.find(e => e.id === form.employee_id);
    await supabase.from('ppe_deliveries').insert([
      {
        company_id: id,
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

  const handleUpdatePpeDelivery = async (form) => {
    if (!form.id) return;
    const employee = employeeList.find(e => e.id === form.employee_id);
    await supabase.from('ppe_deliveries').update({
      employee_id: form.employee_id,
      employee_first_name: employee?.first_name || '',
      employee_last_name: employee?.last_name || '',
      delivered_ppe: JSON.stringify(form.delivered_ppe),
      delivery_date: form.delivery_date,
      delivered_by: form.delivered_by,
      usage_instruction: form.has_report ? 'var' : 'yok',
    }).eq('id', form.id);
    fetchPpeDeliveries();
  };

  const handleDeletePpeDelivery = async (delivery) => {
    if (!delivery?.id) return;
    await supabase.from('ppe_deliveries').delete().eq('id', delivery.id);
    fetchPpeDeliveries();
  };

  const handleAddFireEquipment = async (form) => {
    setShowFireModal(false);
    // Validasyon
    const equipmentType = form.equipment_type === 'Diğer' ? form.equipment_type_other : form.equipment_type;
    if (!equipmentType || equipmentType.trim() === '') {
      alert('Ekipman türü seçiniz veya giriniz.');
      return;
    }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 1) {
      alert('Adet alanı zorunlu ve en az 1 olmalı.');
      return;
    }
    if (!form.last_check_date) {
      alert('Son kontrol tarihi zorunlu.');
      return;
    }
    await supabase.from('fire_first_aid_equipments').insert([
      {
        company_id: id,
        equipment_type: equipmentType,
        quantity: Number(form.quantity),
        last_check_date: form.last_check_date
      }
    ]);
    fetchFireEquipments();
  };

  const handleUpdateFireEquipment = async (form) => {
    if (!form.id) return;
    const equipmentType = form.equipment_type === 'Diğer' ? form.equipment_type_other : form.equipment_type;
    if (!equipmentType || equipmentType.trim() === '') {
      alert('Ekipman türü seçiniz veya giriniz.');
      return;
    }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 1) {
      alert('Adet alanı zorunlu ve en az 1 olmalı.');
      return;
    }
    if (!form.last_check_date) {
      alert('Son kontrol tarihi zorunlu.');
      return;
    }
    await supabase.from('fire_first_aid_equipments').update({
      equipment_type: equipmentType,
      quantity: Number(form.quantity),
      last_check_date: form.last_check_date
    }).eq('id', form.id);
    fetchFireEquipments();
  };

  const handleDeleteFireEquipment = async (equipment) => {
    if (!equipment?.id) return;
    await supabase.from('fire_first_aid_equipments').delete().eq('id', equipment.id);
    fetchFireEquipments();
  };

  // Çalışan silme fonksiyonu
  const handleDeleteEmployee = async (employee) => {
    if (!employee?.id) return;
    await supabase.from('employees').delete().eq('id', employee.id);
    await fetchEmployees();
    await fetchEmployeeCount();
  };

  // Assignment ekleme ve silme fonksiyonları
  const handleAddAssignment = async (assignment) => {
    try {
      await addAssignment({ ...assignment, company_id: id });
    } catch (error) {
      console.error('Atama eklenirken hata oluştu:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
    } catch (error) {
      console.error('Atama silinirken hata oluştu:', error);
    }
  };

  if (!company) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{company.name}</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Tehlike Sınıfı: {company.danger_class}</p>
              <p className="text-gray-600">Çalışan Sayısı: {employeeCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Telefon: {company.phone}</p>
              <p className="text-gray-600">Email: {company.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mb-8">
          {categories.map((cat) => (
            <div
              key={cat.key}
              className={`flex flex-col items-center px-4 py-2 rounded-xl shadow cursor-pointer transition border-2 ${activeTab === cat.key ? 'border-blue-600 bg-white' : 'border-transparent bg-white/70 hover:bg-white'}`}
              onClick={() => setActiveTab(cat.key)}
            >
              <span className="font-semibold text-base">{cat.label}</span>
              <span className="text-xs text-gray-400 mt-1">{cat.key === 'assignments' ? (assignments ? assignments.length : 0) + ' kayıt' : (counts[cat.key] ?? 0) + ' kayıt'}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full">
          {loading ? (
            <div className="text-gray-500">Yükleniyor...</div>
          ) : activeTab === 'employees' ? (
            <>
              <div
                className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
                onClick={() => setShowEmployeeModal(true)}
                style={{ minHeight: 64 }}
              >
                <span className="text-2xl mr-2">+</span> Çalışan Ekle
              </div>
              <div className="flex flex-col gap-2">
                {list.map((item) => {
                  const hasHealthReport = item.health_report && item.health_report !== '' && item.health_report !== null;
                  const daysLeft = hasHealthReport ? getDaysLeft(item.report_refresh) : null;
                  return (
                    <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedEmployee(item)}>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{item.first_name} {item.last_name}</div>
                        <div className="flex items-center gap-2">
                          {hasHealthReport ? (
                            <div className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-600">
                              Sağlık Raporu Var
                            </div>
                          ) : (
                            <div className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600">
                              Sağlık Raporu Yok
                            </div>
                          )}
                          {daysLeft !== null && (
                            <div className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                              Kalan: {daysLeft} gün
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1 text-left">{item.job_title} - {item.position} - {item.department}</div>
                    </div>
                  );
                })}
                <EmployeeDetailModal
                  open={!!selectedEmployee}
                  onClose={() => setSelectedEmployee(null)}
                  employee={selectedEmployee}
                  dangerClass={company.danger_class}
                  onUpdate={handleUpdateEmployee}
                  assignments={assignments}
                  ppeDeliveries={ppeList}
                />
                <EmployeeModal
                  open={showEmployeeModal}
                  onClose={() => setShowEmployeeModal(false)}
                  onAdd={handleAddEmployee}
                  dangerClass={company.danger_class}
                />
              </div>
            </>
          ) : activeTab === 'machines' ? (
            <>
              <div
                className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
                onClick={() => setShowMachineModal(true)}
                style={{ minHeight: 64 }}
              >
                <span className="text-2xl mr-2">+</span> Makine Ekle
              </div>
              <div className="flex flex-col gap-2">
                {machineList.map((item) => {
                  // Bakıma kalan gün hesaplama
                  const daysLeft = item.maintenance_validity_date ? getDaysLeft(item.maintenance_validity_date) : null;
                  return (
                    <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedMachine(item)}>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{item.name}</div>
                        {daysLeft !== null && (
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            Bakıma Kalan: {daysLeft} gün
                          </div>
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
          ) : activeTab === 'chemicals' ? (
            <>
              <div
                className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
                onClick={() => setShowChemicalModal(true)}
                style={{ minHeight: 64 }}
              >
                <span className="text-2xl mr-2">+</span> Kimyasal Ekle
              </div>
              <div className="flex flex-col gap-2">
                {chemicalList.map((item) => (
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
          ) : activeTab === 'ppe' ? (
            <>
              <div
                className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
                onClick={() => setShowPpeModal(true)}
                style={{ minHeight: 64 }}
              >
                <span className="text-2xl mr-2">+</span> KKD Teslim Ekle
              </div>
              <div className="flex flex-col gap-2">
                {ppeList.map((item) => (
                  <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedPpeDelivery(item)}>
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
                  open={!!showPpeModal || !!selectedPpeDelivery}
                  onClose={() => { setShowPpeModal(false); setSelectedPpeDelivery(null); }}
                  onAdd={handleAddPpeDelivery}
                  onUpdate={handleUpdatePpeDelivery}
                  delivery={selectedPpeDelivery}
                  employees={employeeList}
                  company={company}
                  onDelete={handleDeletePpeDelivery}
                />
              </div>
            </>
          ) : activeTab === 'fire' ? (
            <>
              <div
                className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-100 transition min-h-[64px] text-orange-700 font-bold text-lg gap-2"
                onClick={() => setShowFireModal(true)}
                style={{ minHeight: 64 }}
              >
                <span className="text-2xl mr-2">+</span> Ekipman Ekle
              </div>
              <div className="flex flex-col gap-2">
                {fireList.map((item) => {
                  const daysLeft = getFireEquipmentDaysLeft(item.last_check_date);
                  return (
                    <div key={item.id} className="bg-gray-100 rounded-lg p-4 shadow flex flex-col cursor-pointer group" onClick={() => setSelectedFireEquipment(item)}>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">{item.equipment_type}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Adet: {item.quantity}</span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">Son Kontrol: {item.last_check_date}</span>
                          {daysLeft !== null && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                              Kalan: {daysLeft} gün
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <FireEquipmentModal
                  open={!!showFireModal || !!selectedFireEquipment}
                  onClose={() => { setShowFireModal(false); setSelectedFireEquipment(null); }}
                  onAdd={selectedFireEquipment ? handleUpdateFireEquipment : handleAddFireEquipment}
                  equipment={selectedFireEquipment}
                  onDelete={handleDeleteFireEquipment}
                />
              </div>
            </>
          ) : activeTab === 'assignments' ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full gap-4">
              {/* İşveren */}
              <AssignmentCard
                title="İşveren"
                assignedCount={assignments.filter(a => a.role === 'İşveren').length}
                requiredCount={1}
                statusColor={assignments.filter(a => a.role === 'İşveren').length >= 1 ? 'text-green-600' : 'text-red-600'}
                onAdd={handleAddAssignment}
                onRemove={handleDeleteAssignment}
                assignments={assignments.filter(a => a.role === 'İşveren')}
                employeeList={employeeList}
                role="İşveren"
              />
              {/* İşveren Vekili */}
              <AssignmentCard
                title="İşveren Vekili"
                assignedCount={assignments.filter(a => a.role === 'İşveren Vekili').length}
                requiredCount={1}
                statusColor="text-gray-400"
                onAdd={handleAddAssignment}
                onRemove={handleDeleteAssignment}
                assignments={assignments.filter(a => a.role === 'İşveren Vekili')}
                employeeList={employeeList}
                role="İşveren Vekili"
              />
              {/* Çalışan Temsilcisi */}
              <AssignmentCard
                title="Çalışan Temsilcisi"
                assignedCount={(() => { const c = employeeCount; if (c > 100) return assignments.filter(a => a.role === 'Çalışan Temsilcisi').length; if (c > 50) return assignments.filter(a => a.role === 'Çalışan Temsilcisi').length; return assignments.filter(a => a.role === 'Çalışan Temsilcisi').length; })()}
                requiredCount={employeeCount > 100 ? 3 : employeeCount > 50 ? 2 : 1}
                statusColor={(() => { const c = employeeCount > 100 ? 3 : employeeCount > 50 ? 2 : 1; return assignments.filter(a => a.role === 'Çalışan Temsilcisi').length >= c ? 'text-green-600' : 'text-red-600'; })()}
                onAdd={handleAddAssignment}
                onRemove={handleDeleteAssignment}
                assignments={assignments.filter(a => a.role === 'Çalışan Temsilcisi')}
                employeeList={employeeList}
                role="Çalışan Temsilcisi"
              />
              {/* Acil Durum Ekibi */}
              <AssignmentCard
                title="Acil Durum Ekibi"
                assignedCount={assignments.filter(a => a.role === 'Acil Durum Ekibi').length}
                requiredCount={(() => {
                  if (company.danger_class === 'Az Tehlikeli') return Math.ceil(employeeCount / 20) || 1;
                  if (company.danger_class === 'Tehlikeli') return Math.ceil(employeeCount / 15) || 1;
                  if (company.danger_class === 'Çok Tehlikeli') return Math.ceil(employeeCount / 10) || 1;
                  return 1;
                })()}
                statusColor={(() => {
                  let req = 1;
                  if (company.danger_class === 'Az Tehlikeli') req = Math.ceil(employeeCount / 20) || 1;
                  else if (company.danger_class === 'Tehlikeli') req = Math.ceil(employeeCount / 15) || 1;
                  else if (company.danger_class === 'Çok Tehlikeli') req = Math.ceil(employeeCount / 10) || 1;
                  return assignments.filter(a => a.role === 'Acil Durum Ekibi').length >= req ? 'text-green-600' : 'text-red-600';
                })()}
                onAdd={handleAddAssignment}
                onRemove={handleDeleteAssignment}
                assignments={assignments.filter(a => a.role === 'Acil Durum Ekibi')}
                employeeList={employeeList}
                role="Acil Durum Ekibi"
              />
              {/* İlk Yardımcı */}
              <AssignmentCard
                title="İlk Yardımcı"
                assignedCount={assignments.filter(a => a.role === 'İlk Yardımcı').length}
                requiredCount={(() => {
                  if (company.danger_class === 'Az Tehlikeli') return Math.ceil(employeeCount / 20) || 1;
                  if (company.danger_class === 'Tehlikeli') return Math.ceil(employeeCount / 15) || 1;
                  if (company.danger_class === 'Çok Tehlikeli') return Math.ceil(employeeCount / 10) || 1;
                  return 1;
                })()}
                statusColor={(() => {
                  let req = 1;
                  if (company.danger_class === 'Az Tehlikeli') req = Math.ceil(employeeCount / 20) || 1;
                  else if (company.danger_class === 'Tehlikeli') req = Math.ceil(employeeCount / 15) || 1;
                  else if (company.danger_class === 'Çok Tehlikeli') req = Math.ceil(employeeCount / 10) || 1;
                  return assignments.filter(a => a.role === 'İlk Yardımcı').length >= req ? 'text-green-600' : 'text-red-600';
                })()}
                onAdd={handleAddAssignment}
                onRemove={handleDeleteAssignment}
                assignments={assignments.filter(a => a.role === 'İlk Yardımcı')}
                employeeList={employeeList}
                role="İlk Yardımcı"
              />
            </div>
          ) : (
            <div className="text-gray-400 mb-4">Henüz kayıt yok.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail; 