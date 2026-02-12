// admin/src/pages/Settings/index.tsx
import { Box, Card, CardBody, CardContent } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { request } from '../utils/helpers';
import SettingsTabs from '../components/settings/SettingsTabs';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('monitors');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Box padding={8}>
      <Card>
        <CardBody>
          <CardContent width="100%">
            <SettingsTabs
              tabs={[
                { name: 'Monitors', value: 'monitors' },
                { name: 'Notification Channels', value: 'notification_channels' },
                { name: 'API Key', value: 'api_key' },
              ]}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </CardContent>
        </CardBody>
      </Card>
    </Box>
  );
}
