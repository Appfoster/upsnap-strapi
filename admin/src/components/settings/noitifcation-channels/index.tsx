import React, { useState, useEffect } from 'react';
import IntegrationFormModal from './IntegrationFormModal';
import {
  Box,
  Flex,
  Typography,
  Button,
  TextInput,
  Accordion,
  IconButton,
  Menu,
  MenuItem,
  Tag,
  SimpleMenu,
} from '@strapi/design-system';
import {
  Plus,
  Search,
  ChevronDown,
  More,
  Pencil,
  Trash,
  Play,
  MinusCircle,
  Graph,
} from '@strapi/icons';
import { ConfirmationModal } from '../../DeleteConfirmation';
import { toast } from 'react-toastify';
import { INTEGRATIONS_TYPES } from '../../../utils/constants';
import { getUserDetails, request } from '../../../utils/helpers';
import { getIntegrationIcon } from '../../../components/icons/BrandIcons';
import {
  useSupportedIntegrations,
  SupportedChannel,
  SIDEBAR_FILTER_CATEGORIES,
  SidebarFilterId,
} from '../../../hooks/useSupportedIntegrations';
import { Badge } from '@strapi/design-system';
import { Tooltip } from '@strapi/design-system';

async function apiDeleteChannel(id: string) {
  const res = await request(`/notification-channels/${id}`, {
    method: 'DELETE',
  });
  if (!res) return;
  if (!res.ok) throw new Error('Failed to delete channel');
  return res.json();
}

// Types
interface Integration {
  id: string;
  user_id: string;
  organisation_id: string;
  channel_type: string;
  name: string;
  config: {
    recipients?: {
      to?: string;
    };
    webhook_url?: string;
    [key: string]: any;
  };
  notification_settings: Record<string, any>;
  is_enabled: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface PlanLimits {
  can_add_more: boolean;
  current_plan: string;
  max_integrations: number;
  remaining: number;
  used_integrations: number;
}

// Integration Card Component
const IntegrationCard: React.FC<{
  integration: Integration;
  onEdit: (integration: Integration) => void;
  onDelete: (integration: Integration) => void;
  onTest: (integration: Integration) => void;
  onToggle: (integration: Integration) => void;
}> = ({ integration, onEdit, onDelete, onTest, onToggle }) => {
  const getDisplayInfo = () => {
    switch (integration.channel_type) {
      case INTEGRATIONS_TYPES.email.name:
        return integration.config.recipients?.to || 'No email configured';
      case INTEGRATIONS_TYPES.discord.name:
        if (integration.config.webhook_url) {
          // Try to extract meaningful info from Discord webhook URL
          try {
            const url = new URL(integration.config.webhook_url);
            // Discord webhook URLs are like: https://discord.com/api/webhooks/123456789/channel-name
            const pathParts = url.pathname.split('/');
            if (pathParts.length >= 4 && pathParts[3]) {
              return `Discord Webhook (${pathParts[3]})`;
            }
          } catch (e) {
            // If URL parsing fails, show generic message
          }
          return 'Discord Webhook';
        }
        return 'No webhook configured';
      case INTEGRATIONS_TYPES.google_chat.name:
        if (integration.config.webhook_url) {
          // Google Chat webhook URLs are like: https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=KEY&token=TOKEN
          try {
            const url = new URL(integration.config.webhook_url);
            const spaceMatch = url.pathname.match(/\/spaces\/([^\/]+)/);
            if (spaceMatch && spaceMatch[1]) {
              return `Google Chat Space (${spaceMatch[1]})`;
            }
          } catch (e) {
            // If URL parsing fails, show generic message
          }
          return 'Google Chat Webhook';
        }
        return 'No webhook configured';
      case INTEGRATIONS_TYPES.telegram.name:
        if (integration.config.chat_id && integration.config.bot_token) {
          // Display chat_id and first 4 digits of bot_token
          const tokenPrefix = integration.config.bot_token.substring(0, 4);
          return `${integration.config.chat_id} (${tokenPrefix}***)`;
        }
        return integration.config.chat_id || 'No bot configured';
      case INTEGRATIONS_TYPES.slack.name:
        if (integration.config.webhook_url) {
          // Slack webhook URLs are like: https://hooks.slack.com/services/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
          try {
            const url = new URL(integration.config.webhook_url);
            const pathParts = url.pathname.split('/');
            // Extract the workspace/channel identifiers
            if (pathParts.length >= 4 && pathParts[3]) {
              return `Slack Webhook (${pathParts[3]})`;
            }
          } catch (e) {
            // If URL parsing fails, show generic message
          }
          return 'Slack Webhook';
        }
        return 'No webhook configured';
      case 'webhook':
        return integration.config.webhook_url || 'No webhook configured';
      default:
        return 'Configured';
    }
  };

  return (
    <Box
      background="neutral0"
      padding={4}
      borderRadius="lg"
      borderColor="neutral200"
      borderWidth="1px"
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="center" gap={4}>
        {/* Left */}
        <Box flex="1" minWidth={0}>
          <Flex alignItems="center" gap={2}>
            <Typography fontWeight="semiBold" ellipsis>
              {integration.name}
            </Typography>

            <Badge size="S" variant={integration.is_enabled ? 'success' : 'secondary'}>
              {integration.is_enabled ? 'Active' : 'Inactive'}
            </Badge>
          </Flex>

          <Typography variant="pi" textColor="neutral600" ellipsis>
            {getDisplayInfo()}
          </Typography>
        </Box>

        {/* Actions */}
        <SimpleMenu label="Notifications" tag={IconButton} icon={<More />}>
          <MenuItem
            startIcon={<Graph />}
            onClick={() => onTest(integration)}
            disabled={!integration.is_enabled}
          >
            Test
          </MenuItem>

          <MenuItem
            startIcon={integration.is_enabled ? <MinusCircle /> : <Play />}
            onClick={() => onToggle(integration)}
          >
            {integration.is_enabled ? <>Disable</> : <>Enable</>}
          </MenuItem>

          <MenuItem startIcon={<Pencil />} onClick={() => onEdit(integration)}>
            Edit
          </MenuItem>

          <MenuItem startIcon={<Trash />} onClick={() => onDelete(integration)} variant="danger">
            Delete
          </MenuItem>
        </SimpleMenu>
      </Flex>
    </Box>
  );
};

// Main Integrations Page
const IntegrationsPage: React.FC = () => {
  //   useEffect(() => {
  //     document.title = `${process.env.NEXT_PUBLIC_APP_NAME} | Integrations`;
  //   }, []);
  const [activeFilter, setActiveFilter] = useState<SidebarFilterId>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Integration | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<SupportedChannel | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch supported integrations from API
  const {
    channels: supportedChannels,
    loading: channelsLoading,
    getChannelsByFilter,
    getChannelByType,
  } = useSupportedIntegrations();

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Integration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    getUserDetails();
  }, []);

  const handleEdit = (integration: Integration) => {
    const channel = getChannelByType(integration.channel_type);
    if (!channel) return;

    setSelectedChannel(channel);
    setEditData(integration);
    setModalOpen(true);
  };

  const handleDelete = (integration: Integration) => {
    setDeleteTarget(integration);
    setDeleteModalOpen(true);
  };

  const handleTest = async (integration: Integration) => {
    try {
      const result = await request(`/notification-channels/${integration.id}/test`, {
        method: 'POST',
      });
      if (!result) return;

      if (result.testResult.status === 'success') {
        toast.success(
          'Integration test successful! Check your configured channel for the test message.'
        );
      } else {
        toast.error(result.testResult.message || 'Integration test failed.');
      }
    } catch (error) {
      console.error('Failed to test integration:', error);
      toast.error('Failed to test integration. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await apiDeleteChannel(deleteTarget.id);

      await fetchUserIntegrations(); // Refresh the list after deletion
    } catch (error) {
      console.error('Failed to delete integration:', error);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  // Sidebar filter categories
  const filterCategories = Object.values(SIDEBAR_FILTER_CATEGORIES);

  async function fetchUserIntegrations() {
    try {
      setLoading(true);

      const data = await request('/notification-channels');
      if (!data) return;
      const userChannels: Integration[] = data.notificationChannelsData.data?.channels ?? [];
      const limits: PlanLimits = data.notificationChannelsData.data?.plan_limits ?? null;

      setIntegrations(userChannels);
      setPlanLimits(limits);
    } catch (e) {
      console.error('Error loading channels:', e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchUserIntegrations();
  }, []);

  // Get integrations by channel type
  const getIntegrationsByChannelType = (channelType: string) => {
    return integrations.filter((int) => int.channel_type === channelType);
  };

  // Get filtered channels based on active filter and search query
  const filteredChannels = getChannelsByFilter(activeFilter).filter((channel: any) =>
    channel.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = (channel: SupportedChannel) => {
    if (!planLimits?.can_add_more) {
      toast.error('Max integrations limit reached for your plan.');
      return;
    }
    setSelectedChannel(channel);
    setModalOpen(true);
  };

  const handleAccordionToggle = (channelType: string) => {
    setOpenAccordion(openAccordion === channelType ? null : channelType);
  };

  /**
   * Toggle a notification channel integration.
   *
   * @param {Integration} integration - Integration object
   * @throws {Error} - Error if failed to toggle integration
   */
  const handleToggleIntegration = async (integration: Integration) => {
    try {
      const res = await request(`/notification-channels/${integration.id}`, {
        method: 'PUT',
        data: {
          is_enabled: !integration.is_enabled,
        },
      });

      if (!res.updatedChannel) return;
      if (res.updatedChannel.status !== 'success') throw new Error('Failed to update integration');

      toast.success(`Integration ${integration.is_enabled ? 'disabled' : 'enabled'} successfully`);

      // Update local state only
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === integration.id ? { ...item, is_enabled: !item.is_enabled } : item
        )
      );
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      toast.error('Failed to update integration status');
    }
  };

  return (
    <Box padding={2}>
      <Flex direction={{ initial: 'column', medium: 'row' }} alignItems="stretch" gap={4} height="100%">
        {/* LEFT SIDEBAR */}
        <Box background="neutral0" padding={4} borderRadius="8px" width={{ initial: '100%', medium: '260px' }}>
          <Flex direction="column" gap={2} alignItems="stretch">
            {filterCategories.map((filter: any) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'secondary' : 'tertiary'}
                disabled={!filter.enabled}
                justifyContent="flex-start"
                onClick={() => filter.enabled && setActiveFilter(filter.id)}
              >
                <Typography variant="pi">{filter.name}</Typography>
              </Button>
            ))}
          </Flex>
        </Box>

        {/* MAIN CONTENT */}
        <Box background="neutral0" padding={4} borderRadius="8px" flex="1" overflow="auto">
          <Box maxWidth={{initial: "100%", medium: "900px"}} margin="auto">
            {/* HEADER */}
            <Flex
              direction={{ initial: 'column', medium: 'row' }}
              justifyContent="space-between"
              alignItems={{ initial: 'stretch', medium: 'center' }}
              gap={4}
              marginBottom={6}
            >
              <Flex alignItems="center" gap={3}>
                <Typography variant="beta">Integrations</Typography>

                {planLimits && (
                  <Box
                    background="neutral100"
                    paddingLeft={3}
                    paddingRight={3}
                    paddingTop={1}
                    paddingBottom={1}
                    borderRadius="20px"
                  >
                    <Typography variant="pi" textColor="neutral600">
                      {planLimits.used_integrations}/{planLimits.max_integrations} used
                    </Typography>
                  </Box>
                )}
              </Flex>

              <Box width={{initial: '100%', medium: '280px' }}>
                <TextInput
                  placeholder="Search by integration type…"
                  value={searchQuery}
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                  startAction={<Search />}
                />
              </Box>
            </Flex>

            {/* CONTENT */}
            {channelsLoading ? (
              <Box padding={{initial: 2, medium: 8}} textAlign="center">
                <Typography textColor="neutral500">Loading integrations…</Typography>
              </Box>
            ) : activeFilter === 'my' ? (
              integrations.length === 0 ? (
                <Box padding={{initial: 2, medium: 8}} textAlign="center" width="100%">
                  <Flex
                    direction="column"
                    alignItems="center"
                    gap={3}
                    marginBottom={4}
                    width="100%"
                  >
                    <Typography variant={'delta'}>No integrations found</Typography>
                    <Typography variant="pi" textColor="neutral500">
                      Please add an integration to get started
                    </Typography>
                  </Flex>
                </Box>
              ) : (
                <Flex direction="column" gap={3} width="100%">
                  {integrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTest={handleTest}
                      onToggle={handleToggleIntegration}
                    />
                  ))}
                </Flex>
              )
            ) : filteredChannels.length === 0 ? (
              <Box padding={{initial: 2, medium: 8}} textAlign="center">
                <Flex direction="column" alignItems="center" gap={3} marginBottom={4} width="100%">
                  <Typography variant="delta">No integrations available</Typography>
                  <Typography variant="pi" textColor="neutral500">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'No integrations match this filter'}
                  </Typography>
                </Flex>
              </Box>
            ) : (
              /* CATEGORY ACCORDIONS */
              <Accordion.Root>
                {filteredChannels.map((channel: any) => {
                  const channelIntegrations = getIntegrationsByChannelType(channel.type);

                  return (
                    <Accordion.Item key={channel.type} value={channel.type}>
                      <Accordion.Header>
                        <Accordion.Trigger caretPosition="left" description={channel.description}>
                          <Flex alignItems="center" gap={3} width={{initial: "100%", medium: "542px"}}>
                            <Box>{getIntegrationIcon(channel.icon)}</Box>
                            <Flex width={{initial: "100%", medium: "542px"}} gap={3} justifyContent="space-between">
                            <Typography fontWeight="semiBold">{channel.label}</Typography>
                            <Flex justifyContent="flex-end">
                              {!planLimits?.can_add_more ? (
                                <Tooltip label="Max integrations limit reached for your plan.">
                                  <Button
                                    startIcon={<Plus />}
                                    disabled={!planLimits?.can_add_more}
                                    onClick={(e: any) => {
                                      e.stopPropagation();
                                      handleAddClick(channel);
                                    }}
                                    style={{ cursor: 'not-allowed'}}
                                  >
                                    Add
                                  </Button>
                                </Tooltip>
                              ) : (
                                <Button
                                  startIcon={<Plus />}
                                  disabled={!planLimits?.can_add_more}
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleAddClick(channel);
                                  }}
                                >
                                  Add
                                </Button>
                              )}
                            </Flex>
                            </Flex>
                          </Flex>
                        </Accordion.Trigger>
                      </Accordion.Header>

                      <Accordion.Content>
                        <Flex direction="column" gap={3} paddingTop={4}>
                          {channelIntegrations.length === 0 && (
                            <Box padding={{initial: 2, medium: 8}} textAlign="center">
                              <Flex
                                direction="column"
                                alignItems="center"
                                gap={3}
                                marginBottom={4}
                                width="100%"
                              >
                                <Typography variant={'delta'}>No integrations found</Typography>
                                <Typography variant="pi" textColor="neutral500">
                                  No integrations for this channel yet. Click "Add" to create one.
                                </Typography>
                              </Flex>
                            </Box>
                          )}
                          {channelIntegrations.map((integration) => (
                            <IntegrationCard
                              key={integration.id}
                              integration={integration}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onTest={handleTest}
                              onToggle={handleToggleIntegration}
                            />
                          ))}
                        </Flex>
                      </Accordion.Content>
                    </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            )}
          </Box>
        </Box>
      </Flex>

      {/* Add Integration Modal */}
      <IntegrationFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
          setSelectedChannel(null);
        }}
        channel={selectedChannel}
        editData={editData}
        onSuccess={fetchUserIntegrations}
      />
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Integration"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isDeleting}
        loadingText="Deleting..."
      />
    </Box>
  );
};

export default IntegrationsPage;
