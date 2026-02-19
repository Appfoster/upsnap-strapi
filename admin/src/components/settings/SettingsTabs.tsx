import { Tabs, Box, Typography } from '@strapi/design-system';
import Monitors from '../settings/Monitors';
import APIToken from './APIToken';
import IntegrationsPage from './noitifcation-channels';
import { Flex } from '@strapi/design-system';

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

  return (
    <>
      <Tabs.Root defaultValue={activeTab} value={activeTab} onValueChange={onTabChange}>
        <Tabs.List aria-label="Manage your attribute">
          <Flex  direction={{initial: "column", medium: "row"}} gap={{initial: "2px", medium: "0px"}} alignItems={{ initial: "start", medium: "center" }} width="100%">
            {tabs &&
              tabs.map((tab, index) => (
                
                <Tabs.Trigger key={index} value={tab.value.toLocaleLowerCase()}>
                  {tab.name}
                </Tabs.Trigger>
              )
            )}
          </Flex>
        </Tabs.List>
        <Tabs.Content value={activeTab}>
          {activeTab === 'monitors' && (
            <Box padding={4}>
              <Monitors onTabChange={onTabChange} />
            </Box>
          )}
          {activeTab === 'notification_channels' && (
            <Box padding={2}>
              <IntegrationsPage />
            </Box>
          )}
          {activeTab === 'api_key' && (
            <Box padding={1}>
              <APIToken />
            </Box>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
