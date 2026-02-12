import { Tabs, Box, Typography } from '@strapi/design-system';
import Monitors from '../settings/Monitors';
import APIToken from './APIToken';

interface Tabs {
  name: string;
  value: string;
}

export default function SettingsTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tabs[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  console.log('active tab ', activeTab);
  console.log('tabs ', tabs);
  return (
    <>
      <Tabs.Root defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
        <Tabs.List aria-label="Manage your attribute">
          {tabs &&
            tabs.map((tab, index) => (
              <Tabs.Trigger key={index} value={tab.value.toLocaleLowerCase()}>
                {tab.name}
              </Tabs.Trigger>
            ))}
        </Tabs.List>
        <Tabs.Content value={activeTab}>
          {activeTab === 'monitors' && (
            <Box padding={4}>
              <Monitors />
            </Box>
          )}
          {activeTab === 'notification_channels' && (
            <Box padding={4}>
              <Typography>Notification Channels coming soon...</Typography>
            </Box>
          )}
          {activeTab === 'api_key' && (
            <Box padding={4}>
              <APIToken />
            </Box>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
