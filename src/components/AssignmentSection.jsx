import React from 'react';
import AssignmentCard from './AssignmentCard';
import useAssignments from '../hooks/useAssignments';
import useEmployees from '../hooks/useEmployees';

const AssignmentSection = ({ companyId, company }) => {
  const { assignments, addAssignment, deleteAssignment } = useAssignments(companyId);
  const { employees } = useEmployees(companyId);
  const employeeCount = employees.length;

  const handleAdd = async data => {
    await addAssignment({ ...data, company_id: companyId });
  };

  const handleRemove = async id => {
    await deleteAssignment(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col w-full gap-4">
      <AssignmentCard
        title="İşveren"
        assignedCount={assignments.filter(a => a.role === 'İşveren').length}
        requiredCount={1}
        statusColor={assignments.filter(a => a.role === 'İşveren').length >= 1 ? 'text-green-600' : 'text-red-600'}
        onAdd={handleAdd}
        onRemove={handleRemove}
        assignments={assignments.filter(a => a.role === 'İşveren')}
        employeeList={employees}
        role="İşveren"
      />
      <AssignmentCard
        title="İşveren Vekili"
        assignedCount={assignments.filter(a => a.role === 'İşveren Vekili').length}
        requiredCount={1}
        statusColor="text-gray-400"
        onAdd={handleAdd}
        onRemove={handleRemove}
        assignments={assignments.filter(a => a.role === 'İşveren Vekili')}
        employeeList={employees}
        role="İşveren Vekili"
      />
      <AssignmentCard
        title="Çalışan Temsilcisi"
        assignedCount={assignments.filter(a => a.role === 'Çalışan Temsilcisi').length}
        requiredCount={employeeCount > 100 ? 3 : employeeCount > 50 ? 2 : 1}
        statusColor={assignments.filter(a => a.role === 'Çalışan Temsilcisi').length >= (employeeCount > 100 ? 3 : employeeCount > 50 ? 2 : 1) ? 'text-green-600' : 'text-red-600'}
        onAdd={handleAdd}
        onRemove={handleRemove}
        assignments={assignments.filter(a => a.role === 'Çalışan Temsilcisi')}
        employeeList={employees}
        role="Çalışan Temsilcisi"
      />
      <AssignmentCard
        title="Acil Durum Ekibi"
        assignedCount={assignments.filter(a => a.role === 'Acil Durum Ekibi').length}
        requiredCount={company.danger_class === 'Az Tehlikeli' ? Math.ceil(employeeCount / 20) || 1 : company.danger_class === 'Tehlikeli' ? Math.ceil(employeeCount / 15) || 1 : Math.ceil(employeeCount / 10) || 1}
        statusColor={assignments.filter(a => a.role === 'Acil Durum Ekibi').length >= (company.danger_class === 'Az Tehlikeli' ? Math.ceil(employeeCount / 20) || 1 : company.danger_class === 'Tehlikeli' ? Math.ceil(employeeCount / 15) || 1 : Math.ceil(employeeCount / 10) || 1) ? 'text-green-600' : 'text-red-600'}
        onAdd={handleAdd}
        onRemove={handleRemove}
        assignments={assignments.filter(a => a.role === 'Acil Durum Ekibi')}
        employeeList={employees}
        role="Acil Durum Ekibi"
      />
      <AssignmentCard
        title="İlk Yardımcı"
        assignedCount={assignments.filter(a => a.role === 'İlk Yardımcı').length}
        requiredCount={company.danger_class === 'Az Tehlikeli' ? Math.ceil(employeeCount / 20) || 1 : company.danger_class === 'Tehlikeli' ? Math.ceil(employeeCount / 15) || 1 : Math.ceil(employeeCount / 10) || 1}
        statusColor={assignments.filter(a => a.role === 'İlk Yardımcı').length >= (company.danger_class === 'Az Tehlikeli' ? Math.ceil(employeeCount / 20) || 1 : company.danger_class === 'Tehlikeli' ? Math.ceil(employeeCount / 15) || 1 : Math.ceil(employeeCount / 10) || 1) ? 'text-green-600' : 'text-red-600'}
        onAdd={handleAdd}
        onRemove={handleRemove}
        assignments={assignments.filter(a => a.role === 'İlk Yardımcı')}
        employeeList={employees}
        role="İlk Yardımcı"
      />
    </div>
  );
};

export default AssignmentSection;
