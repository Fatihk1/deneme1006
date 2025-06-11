import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getDaysLeft } from '../utils';
import EmployeeModal from './EmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import useAssignments from '../hooks/useAssignments';
import usePpeDeliveries from '../hooks/usePpeDeliveries';

const EmployeeSection = ({ companyId, dangerClass }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { assignments } = useAssignments(companyId);
  const { ppeDeliveries } = usePpeDeliveries(companyId);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setEmployees(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  const handleAddEmployee = async form => {
    setShowEmployeeModal(false);
    const hasHealthReport = form.has_health_report && form.health_report && form.health_report !== '';
    await supabase.from('employees').insert([
      {
        company_id: companyId,
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
    fetchEmployees();
  };

  const handleUpdateEmployee = async form => {
    if (!form.id) return;
    const jobTitle = form.job_title === 'Diğer' ? form.job_title_other : form.job_title;
    const position = form.position === 'Diğer' ? form.position_other : form.position;
    const hasHealthReport = form.has_health_report && form.health_report && form.health_report !== '';
    await supabase
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
    fetchEmployees();
  };


  if (loading) return <div className="text-gray-500">Yükleniyor...</div>;

  return (
    <>
      <div
        className="w-full mb-4 flex items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 transition min-h-[64px] text-blue-700 font-bold text-lg gap-2"
        onClick={() => setShowEmployeeModal(true)}
      >
        <span className="text-2xl mr-2">+</span> Çalışan Ekle
      </div>
      <div className="flex flex-col gap-2">
        {employees.map(item => {
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
                    <div className={`text-xs font-semibold px-2 py-1 rounded ${daysLeft < 30 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>Kalan: {daysLeft} gün</div>
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
          dangerClass={dangerClass}
          onUpdate={handleUpdateEmployee}
          assignments={assignments}
          ppeDeliveries={ppeDeliveries}
        />
        <EmployeeModal
          open={showEmployeeModal}
          onClose={() => setShowEmployeeModal(false)}
          onAdd={handleAddEmployee}
          dangerClass={dangerClass}
        />
      </div>
    </>
  );
};

export default EmployeeSection;
