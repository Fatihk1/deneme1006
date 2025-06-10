import React, { useState } from 'react';

const AssignmentModal = ({
  open,
  onClose,
  onAdd,
  onRemove,
  employeeList = [],
  assignments = [],
  role = '',
  title = ''
}) => {
  const [form, setForm] = useState({
    employee_id: '',
    assignment_letter: '', // var/yok
    certificate: '', // var/yok
  });
  const [newRows, setNewRows] = useState([
    { employee_id: '', assignment_form: 'Var', first_aid_certificate: 'Var' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ assignment_form: '', first_aid_certificate: '' });

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleAdd = () => {
    if (!form.employee_id) return;
    if (typeof onAdd === 'function') {
      onAdd({
        employee_id: form.employee_id,
        assignment_form: form.assignment_letter,
        first_aid_certificate: form.certificate,
        role,
        assignment_date: new Date().toISOString().slice(0, 10)
      });
    }
    setForm({ employee_id: '', assignment_letter: '', certificate: '' }); // Formu sıfırla
  };

  const handleEditClick = (assignment) => {
    setEditingId(assignment.id);
    setEditValues({
      assignment_form: assignment.assignment_form,
      first_aid_certificate: assignment.first_aid_certificate
    });
  };

  const handleEditChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const handleEditSave = (assignment) => {
    // Call onAdd with updated values (assuming onAdd handles update as well)
    onAdd({ ...assignment, ...editValues, id: assignment.id, employee_id: assignment.employee_id, role });
    setEditingId(null);
    setEditValues({ assignment_form: '', first_aid_certificate: '' });
  };

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${open ? '' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{title} Atamaları</h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-end mb-2">
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-gray-600 mb-1 ml-1 text-left w-full">Çalışan</label>
              <select
                className="px-2 py-2 border rounded"
                value={form.employee_id}
                onChange={e => handleChange('employee_id', e.target.value)}
              >
                <option value="">Çalışan Seçiniz</option>
                {employeeList.map(e => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-gray-600 mb-1 ml-1 text-left w-full">Atama Yazısı</label>
              <select
                className="px-2 py-2 border rounded"
                value={form.assignment_letter}
                onChange={e => handleChange('assignment_letter', e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="Var">Var</option>
                <option value="Yok">Yok</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-gray-600 mb-1 ml-1 text-left w-full">Sertifika</label>
              <select
                className="px-2 py-2 border rounded"
                value={form.certificate}
                onChange={e => handleChange('certificate', e.target.value)}
              >
                <option value="">Seçiniz</option>
                <option value="Var">Var</option>
                <option value="Yok">Yok</option>
              </select>
            </div>
            <button
              className="w-20 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition ml-2"
              onClick={handleAdd}
              disabled={!form.employee_id}
            >
              Ekle
            </button>
          </div>
          <table className="w-full text-left border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1">Çalışan</th>
                <th className="px-2 py-1">Atama Yazısı</th>
                <th className="px-2 py-1">Sertifika</th>
                <th className="px-2 py-1 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const employee = employeeList.find(e => e.id === a.employee_id);
                return (
                  <tr key={a.id || a.employee_id}>
                    <td className="px-2 py-1">{employee ? `${employee.first_name} ${employee.last_name}` : ''}</td>
                    <td className="px-2 py-1">
                      {editingId === a.id ? (
                        <select
                          name="assignment_form"
                          value={editValues.assignment_form}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Var">Var</option>
                          <option value="Yok">Yok</option>
                        </select>
                      ) : (
                        a.assignment_form
                      )}
                    </td>
                    <td className="px-2 py-1">
                      {editingId === a.id ? (
                        <select
                          name="first_aid_certificate"
                          value={editValues.first_aid_certificate}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        >
                          <option value="Var">Var</option>
                          <option value="Yok">Yok</option>
                        </select>
                      ) : (
                        a.first_aid_certificate
                      )}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === a.id ? (
                          <button
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() => handleEditSave(a)}
                          >Kaydet</button>
                        ) : (
                          <button
                            className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                            onClick={() => handleEditClick(a)}
                          >Düzenle</button>
                        )}
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                          onClick={() => onRemove(a.id || a.employee_id)}
                        >Çıkar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal; 
