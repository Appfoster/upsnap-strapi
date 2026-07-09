import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MonitorForm from '../../../components/settings/monitors/MonitorForm';
import LoadingCard from '../../../components/reachability/LoadingCard';
import { request } from '../../../utils/helpers';
import { Monitor } from '../../../utils/types';

export default function EditMonitor() {
  const { id } = useParams<{ id: string }>();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    request(`/monitor/${id}`, { method: 'GET' }).then((res) => {
      setMonitor(res?.monitor?.data?.monitor || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingCard />;

  return <MonitorForm mode="edit" monitor={monitor} />;
}
