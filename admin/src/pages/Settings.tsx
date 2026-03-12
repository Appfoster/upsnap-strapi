// admin/src/pages/Settings/index.tsx
import { useState } from 'react';
import SettingsTabs from '../components/settings/SettingsTabs';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('monitors');
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <SettingsTabs
        tabs={[
          { name: 'Monitors', value: 'monitors' },
          { name: 'Notification Channels', value: 'notification_channels' },
          { name: 'API Key', value: 'api_key' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </>
  );
}
