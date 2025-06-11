import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const useAssignments = (companyId) => {
  const [assignments, setAssignments] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchAssignments and fetchEmployees are defined inside this hook so we
  // suppress the exhaustive-deps rule to avoid recreating them in dependencies
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (companyId) {
      fetchAssignments();
      fetchEmployees();
    }
  }, [companyId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Atamalar yüklenirken hata oluştu:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;
      setEmployeeList(data || []);
    } catch (error) {
      console.error('Çalışanlar yüklenirken hata oluştu:', error);
      setError(error);
    }
  };

  const addAssignment = async (assignment) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .upsert([
          {
            ...assignment,
            company_id: companyId
          }
        ])
        .select();

      if (error) throw error;
      await fetchAssignments(); // Listeyi güncelle
      return data;
    } catch (error) {
      console.error('Atama eklenirken hata oluştu:', error);
      throw error;
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      await fetchAssignments(); // Listeyi güncelle
    } catch (error) {
      console.error('Atama silinirken hata oluştu:', error);
      throw error;
    }
  };

  return {
    assignments,
    employeeList,
    loading,
    error,
    addAssignment,
    deleteAssignment
  };
};

export default useAssignments; 