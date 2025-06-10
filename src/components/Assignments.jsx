import React from 'react';
import useAssignments from '../hooks/useAssignments';
import AssignmentCard from './AssignmentCard';

const Assignments = ({ companyId }) => {
  const { assignments, employeeList, addAssignment, removeAssignment, loading, error } = useAssignments(companyId);

  const getStatusColor = (role) => {
    const required = role === 'acil_durum' || role === 'ilk_yardim' ? 5 : 1;
    const assigned = assignments.filter(a => a.role === role).length;
    
    if (assigned === 0) return 'text-red-600';
    if (assigned < required) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleAddAssignment = async (assignment) => {
    try {
      await addAssignment(assignment);
    } catch (error) {
      console.error('Atama eklenirken hata oluştu:', error);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      await removeAssignment(assignmentId);
    } catch (error) {
      console.error('Atama silinirken hata oluştu:', error);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Görev Atamaları</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AssignmentCard
          title="İşveren"
          assignedCount={assignments.filter(a => a.role === 'isveren').length}
          requiredCount={1}
          statusColor={getStatusColor('isveren')}
          assignments={assignments.filter(a => a.role === 'isveren')}
          employeeList={employeeList}
          role="isveren"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
        <AssignmentCard
          title="İşveren Vekili"
          assignedCount={assignments.filter(a => a.role === 'isveren_vekil').length}
          requiredCount={1}
          statusColor={getStatusColor('isveren_vekil')}
          assignments={assignments.filter(a => a.role === 'isveren_vekil')}
          employeeList={employeeList}
          role="isveren_vekil"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
        <AssignmentCard
          title="İş Güvenliği Uzmanı"
          assignedCount={assignments.filter(a => a.role === 'isg_uzman').length}
          requiredCount={1}
          statusColor={getStatusColor('isg_uzman')}
          assignments={assignments.filter(a => a.role === 'isg_uzman')}
          employeeList={employeeList}
          role="isg_uzman"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
        <AssignmentCard
          title="İşyeri Hekimi"
          assignedCount={assignments.filter(a => a.role === 'isyeri_hekimi').length}
          requiredCount={1}
          statusColor={getStatusColor('isyeri_hekimi')}
          assignments={assignments.filter(a => a.role === 'isyeri_hekimi')}
          employeeList={employeeList}
          role="isyeri_hekimi"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
        <AssignmentCard
          title="Acil Durum Ekibi"
          assignedCount={assignments.filter(a => a.role === 'acil_durum').length}
          requiredCount={5}
          statusColor={getStatusColor('acil_durum')}
          assignments={assignments.filter(a => a.role === 'acil_durum')}
          employeeList={employeeList}
          role="acil_durum"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
        <AssignmentCard
          title="İlk Yardım Ekibi"
          assignedCount={assignments.filter(a => a.role === 'ilk_yardim').length}
          requiredCount={5}
          statusColor={getStatusColor('ilk_yardim')}
          assignments={assignments.filter(a => a.role === 'ilk_yardim')}
          employeeList={employeeList}
          role="ilk_yardim"
          onAdd={handleAddAssignment}
          onRemove={handleRemoveAssignment}
        />
      </div>
    </div>
  );
};

export default Assignments; 