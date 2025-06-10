import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useChemicals(companyId) {
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChemicals = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('chemicals')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setChemicals(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchChemicals();
  }, [fetchChemicals]);

  return { chemicals, loading, fetchChemicals };
} 