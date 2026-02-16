import React, { useEffect, useState, useRef } from 'react';
import {
  Accordion,
  Box,
  Flex,
  Typography,
  TextInput,
  Checkbox,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Loader,
} from '@strapi/design-system';

import { ChevronDown, Search } from '@strapi/icons';

import { getUserData } from '../../utils/userStorage';
import { INTEGRATIONS_TYPES } from '../../utils/constants';
import { getUserDetails, request } from '../../utils/helpers';
import { getIntegrationIcon } from '../../components/icons/BrandIcons';

console.log('get user data ', getUserData());
const DEFAULT_EMAIL = getUserData()?.user?.email ?? '';

// ========== Types ==========
export interface ChannelConfig {
  recipients: {
    to: string;
  };
}

export interface NotificationChannel {
  id: number | null;
  channel_type: string;
  name: string;
  config: ChannelConfig;
  isDefaultEmail?: boolean;
  is_enabled?: boolean;
}

export interface NotificationChannelsProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

async function apiGetChannels() {
  const res = await request('/notification-channels', {
    method: 'GET',
  });
  if (!res) return;

  if (!res.notificationChannelsData.data) throw new Error('Failed to fetch channels');

  return res.notificationChannelsData.data;
}

async function apiCreateChannel(payload: Omit<NotificationChannel, 'id'>) {
  const res = await request('/notification-channels', {
    method: 'POST',
    data: payload,
  });

  if (!res) return;

  if (!res?.notificationChannelsData?.data) throw new Error('Failed to create channel');

  return res.notificationChannelsData;
}

/* ------------------------------------------------------------------ */
export default function NotificationChannelsIntegration({
  value = [],
  onChange,
}: NotificationChannelsProps) {
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [selected, setSelected] = useState<any>(value);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [defaultEmail, setDefaultEmail] = useState();
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!isInternalUpdate.current) {
      setSelected(value);
    }
    isInternalUpdate.current = false;
  }, [value]);
  /* --------------------------------------
        Fetch channels on mount
    --------------------------------------*/
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await apiGetChannels();
        let list: NotificationChannel[] = res?.channels ?? [];

        // Add default placeholder ONLY IF no channels exist
        if (list.length === 0) {
          list.push({
            id: null,
            isDefaultEmail: true,
            name: 'Default Email',
            channel_type: 'email',
            is_enabled: true,
            config: { recipients: { to: DEFAULT_EMAIL } },
          });
        }

        setChannels(list);
      } catch (e) {
        console.error('Error loading channels:', e);
      } finally {
        setLoading(false);
      }
    }

    load();
    getUserDetails();
  }, []);

  /* --------------------------------------
        Create or toggle a channel
    --------------------------------------*/
  const toggle = async (row: NotificationChannel) => {
    // If default email placeholder → create real channel
    console.log('Toggling channel ', DEFAULT_EMAIL, row);
    if (row.isDefaultEmail && row.id === null) {
      try {
        const payload = {
          channel_type: 'email',
          name: 'Default Email',
          config: { recipients: { to: DEFAULT_EMAIL } },
        };

        const res = await apiCreateChannel(payload);
        console.log('create res ', res);
        const newId = res.data.id.toString();

        setChannels((prev) =>
          Array.isArray(prev)
            ? prev.map((ch) => (ch.isDefaultEmail ? { ...ch, id: res.data.id } : ch))
            : []
        );

        setSelected((prev: string[]) => {
          const updated = [...prev, newId];
          isInternalUpdate.current = true;
          return updated;
        });
      } catch (err) {
        console.error('Failed to create default channel', err);
      }
      return;
    }

    // Normal toggle
    const stringId = row.id!.toString();

    setSelected((prev: string[]) => {
      let updated;
      if (prev.includes(stringId)) {
        updated = prev.filter((id: string) => id !== stringId);
      } else {
        updated = [...prev, stringId];
      }
      isInternalUpdate.current = true;
      return updated;
    });
  };

  /* --------------------------------------
        Toggle all
    --------------------------------------*/
  const toggleAll = async () => {
    const createDefault = Array.isArray(channels) ? channels.find((c) => c.id === null) : null;

    if (createDefault) {
      await toggle(createDefault);
    }

    // After potential channel creation, get all valid channel IDs
    const allChannelIds = Array.isArray(channels)
      ? channels.filter((c) => c.id !== null).map((c) => c.id!.toString())
      : [];

    // Check if all channels are selected (including the newly created one if any)
    const isAllSelected = allChannelIds.every((id) => selected.includes(id));

    setSelected((prev: string[]) => {
      const updated = isAllSelected ? [] : allChannelIds;
      isInternalUpdate.current = true;
      return updated;
    });
  };

  /* --------------------------------------
        Search Filter
    --------------------------------------*/
  const filtered = Array.isArray(channels)
    ? channels.filter((ch) => {
        const email = ch.config?.recipients?.to ?? '';
        return (
          ch.name.toLowerCase().includes(search.toLowerCase()) ||
          email.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];

  useEffect(() => {
    if (isInternalUpdate.current) {
      onChange(selected);
    }
  }, [selected, onChange]);

  return (
    <Box width="100%">
      <Accordion.Root>
        <Accordion.Item value="notification-channels">
          <Accordion.Header width="100%"> 
            <Accordion.Trigger
              caretPosition="right"
              description="Choose how you want to receive alerts"
              width="100%"
            >
              <Flex justifyContent="space-between" alignItems="center" width="100%" gap={4}>
                <Typography fontWeight="bold">How would you like to get notified?</Typography>

                {/* Search input inside header */}
                <Box
                  width="100%"
                  onClick={(e: any) => {
                    // prevent accordion toggle when interacting with input
                    e.stopPropagation();
                  }}
                >
                    <TextInput
                        label="Search channels"
                        value={search}
                        onChange={(e: any) => setSearch(e.target.value)}
                        startAction={<Search />}
                    />
                </Box>
              </Flex>
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content>
            {loading ? (
              <Flex justifyContent="center" padding={6}>
                <Loader />
              </Flex>
            ) : (
              <Box borderColor="neutral200" hasRadius overflow="auto">
                <Table colCount={3} rowCount={filtered.length}>
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          checked={
                            filtered.length > 0 &&
                            filtered.every(
                              (c) => c.id !== null && selected.includes(c.id.toString())
                            )
                          }
                          onChange={toggleAll}
                        />
                      </Th>

                      <Th>
                        <Typography>Name</Typography>
                      </Th>

                      <Th>
                        <Typography>Channel type</Typography>
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {filtered.map((row) => (
                      <Tr key={row.id ?? 'default'}>
                        {/* Checkbox */}
                        <Td>
                          <Checkbox
                            checked={row.id !== null && selected.includes(row.id.toString())}
                            onCheckedChange={() => toggle(row)}
                          />
                        </Td>

                        {/* Name + status */}
                        <Td>
                          <Flex gap={3} alignItems="flex-start">
                            <Box paddingTop={1}>{getIntegrationIcon(row.channel_type)}</Box>

                            <Flex direction={{ initial: "column", medium: "row" }} alignItems={{ initial: 'start', medium: 'self-start' }} gap={2}>
                              <Flex gap={2} alignItems="center">
                                <Typography fontWeight="semiBold">
                                  {row.name}
                                  {row.channel_type === 'email' && row.config?.recipients?.to
                                    ? ` (${row.config.recipients.to})`
                                    : ''}
                                </Typography>

                                {row.isDefaultEmail && (
                                  <Typography variant="pi" textColor="neutral500">
                                    (default)
                                  </Typography>
                                )}
                              </Flex>

                              <Badge
                                background={row.is_enabled ? 'success100' : 'neutral150'}
                                textColor={row.is_enabled ? 'success700' : 'neutral700'}
                              >
                                {row.is_enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </Flex>
                          </Flex>
                        </Td>

                        {/* Channel type */}
                        <Td>
                          <Typography textTransform="capitalize">
                            {
                              INTEGRATIONS_TYPES[
                                row.channel_type as keyof typeof INTEGRATIONS_TYPES
                              ]?.label
                            }
                          </Typography>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Box>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`tw-w-5 tw-h-5 tw-transition-transform ${open ? 'tw-rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
