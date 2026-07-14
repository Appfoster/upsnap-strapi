import { useEffect, useState } from 'react';
import { request } from '../utils/helpers';

export function useHasToken(): boolean | null {
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    request('/settings', { method: 'GET' }).then((res) => {
      setHasToken(!!res?.token);
    });
  }, []);

  return hasToken;
}
