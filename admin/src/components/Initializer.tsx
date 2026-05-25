import { useEffect, useRef } from 'react';
import { request } from '../utils/helpers';

import { PLUGIN_ID } from '../pluginId';

type InitializerProps = {
  setPlugin: (id: string) => void;
};

const Initializer = ({ setPlugin }: InitializerProps) => {
  const ref = useRef(setPlugin);

  useEffect(() => {
    ref.current(PLUGIN_ID);

    const trackUser = async () => {
      try {
        const payload = {
          browser: navigator.userAgent,
          os: (navigator as any).userAgentData?.platform || (navigator as any).platform || 'Unknown',
          language: navigator.language,
          screen: `${window.screen.width}x${window.screen.height}`,
          client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        
        await request('/track-user-data', {
          method: 'POST',
          data: payload,
        });
      } catch (error) {
        // ignore
      }
    };
    
    trackUser();
  }, []);

  return null;
};

export { Initializer };
