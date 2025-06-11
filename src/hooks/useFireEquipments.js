import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function useFireEquipments(companyId) {
  const [fireEquipments, setFireEquipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFireEquipments = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase
      .from('fire_first_aid_equipments')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setFireEquipments(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchFireEquipments();
  }, [fetchFireEquipments]);

  return { fireEquipments, loading, fetchFireEquipments };
} 