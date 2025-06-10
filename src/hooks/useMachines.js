import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useMachines(companyId) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMachines = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('machines')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setMachines(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  return { machines, loading, fetchMachines };
} 
