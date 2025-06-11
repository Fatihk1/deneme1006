import React, { useState } from 'react';
import AssignmentModal from './AssignmentModal';

const AssignmentCard = ({
  title,
  assignedCount,
  requiredCount,
  statusColor = 'text-gray-600',
  assignments = [],
  employeeList = [],
  role = '',
  onAdd,
  onRemove
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col w-full">
      <div className="flex items-center mb-2">
        <div className="font-semibold">
          {title}
          <span className={`ml-2 font-bold ${statusColor}`}>({assignedCount}/{requiredCount})</span>
        </div>
        <div className="flex justify-end flex-1">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
            Kişi Ata
          </button>
        </div>
      </div>
      <AssignmentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={onAdd}
        onRemove={onRemove}
        employeeList={employeeList}
        assignments={assignments}
        role={role}
        title={title}
      />
    </div>
  );
};

export default AssignmentCard; 