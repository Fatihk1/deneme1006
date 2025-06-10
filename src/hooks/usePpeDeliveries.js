import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function usePpeDeliveries(companyId) {
  const [ppeDeliveries, setPpeDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPpeDeliveries = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('ppe_deliveries')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setPpeDeliveries(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchPpeDeliveries();
  }, [fetchPpeDeliveries]);

  return { ppeDeliveries, loading, fetchPpeDeliveries };
} 