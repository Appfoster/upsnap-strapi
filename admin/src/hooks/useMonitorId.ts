import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPrimaryMonitorId } from '../utils/helpers';

export function useMonitorId(): string | null | undefined {
  const [searchParams] = useSearchParams();
  const [monitorId, setMonitorId] = useState<string | null>();

  useEffect(() => {
    (async () => {
      const queryMonitorId = searchParams.get('monitorId');
      if (queryMonitorId) {
        setMonitorId(queryMonitorId);
        return;
      }
      const fetchedMonitorId = await getPrimaryMonitorId();
      setMonitorId(fetchedMonitorId || null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return monitorId;
}
