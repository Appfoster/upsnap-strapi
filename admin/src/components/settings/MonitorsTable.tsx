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
  VisuallyHidden,
} from '@strapi/design-system';
import { toast } from 'react-toastify';
import { ChevronDown, Search, Pencil, Trash } from '@strapi/icons';

import { getUserData } from '../../utils/userStorage';
import { getPrimaryMonitorId, getUserDetails, request, setPrimaryMonitorId } from '../../utils/helpers';
import { Monitor } from '../../utils/types';

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

export interface MonitorsTableProps {
  monitors?: Monitor[];
  onChange?: (ids: string[]) => void;
  onEdit?: (monitor: Monitor) => void;
  handleDelete: (monitor: Monitor) => void;
}

async function getMonitors() {
  const res = await request('/monitors', {
    method: 'GET',
  });
  if (!res) return;

  if (!res.monitorsData.data) throw new Error('Failed to fetch monitors');

  return res.monitorsData.data;
}

async function deleteMonitor(id: string) {
  const res = await request(`/monitors/${id}`, {
    method: 'DELETE',
  });

  if (!res) return;

  if (!res?.monitorsData?.data) throw new Error('Failed to delete monitor');

  return res.monitorsData;
}

/* ------------------------------------------------------------------ */
export default function MonitorsTable({
  monitors = [],
  onChange,
  onEdit,
  handleDelete,
}: MonitorsTableProps) {
  const [open, setOpen] = useState(false);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [selected, setSelected] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [defaultEmail, setDefaultEmail] = useState();
  const isInternalUpdate = useRef(false);
  const [primaryMonitorId, setPrimaryMonitorIdState] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrimaryMonitorId() {
      try {
        const id = await getPrimaryMonitorId();
        if(id) setPrimaryMonitorIdState(id);
      } catch (err) {
        console.error('Error fetching primary monitor ID:', err);
      }
    }
    fetchPrimaryMonitorId();
  }, []);
  // useEffect(() => {
  //   if (!isInternalUpdate.current) {
  //     setSelected(value);
  //   }
  //   isInternalUpdate.current = false;
  // }, [value]);
  /* --------------------------------------
        Fetch channels on mount
    --------------------------------------*/

  /* --------------------------------------
        Create or toggle a channel
    --------------------------------------*/
  const toggle = async (row: Monitor) => {
    // If default email placeholder → create real channel
    console.log('Toggling channel ', DEFAULT_EMAIL, row);
    if (row && row.id === null) {
      // try {
      //   const payload = {
      //     channel_type: 'email',
      //     name: 'Default Email',
      //     config: { recipients: { to: DEFAULT_EMAIL } },
      //   };

      //   const res = await apiCreateChannel(payload);
      //   console.log('create res ', res);
      //   const newId = res.data.id.toString();

      //   setChannels((prev) =>
      //     Array.isArray(prev)
      //       ? prev.map((ch) => (ch.isDefaultEmail ? { ...ch, id: res.data.id } : ch))
      //       : []
      //   );

      //   setSelected((prev: string[]) => {
      //     const updated = [...prev, newId];
      //     isInternalUpdate.current = true;
      //     return updated;
      //   });
      // } catch (err) {
      //   console.error('Failed to create default channel', err);
      // }
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
      // await toggle(createDefault);
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
      // onChange(selected);
    }
  }, [selected, onChange]);

  const handleSetPrimary = async (monitor: Monitor) => {
    try {
      const result = await setPrimaryMonitorId(monitor.id);
      if (result) {
        toast.success('Primary monitor set successfully');
        setPrimaryMonitorIdState(monitor.id);
      } else {
        toast.error('Failed to set primary monitor');
      }
    } catch (err) {
      console.error('Error setting primary monitor:', err);
      toast.error('An error occurred while setting primary monitor');
    }
  }
  console.log('primary monitor id ', primaryMonitorId);
  return (
    <Box width="100%">
      <Box borderColor="neutral200" hasRadius overflow="auto">
        <Table colCount={4} rowCount={monitors.length}>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  checked={
                    monitors.length > 0 &&
                    monitors.every((c) => c.id !== null && selected.includes(c.id.toString()))
                  }
                  onChange={toggleAll}
                />
              </Th>

              <Th>
                <Typography>Monitor</Typography>
              </Th>

              <Th>
                <Typography>Status</Typography>
              </Th>
              <Th>
                <VisuallyHidden>Actions</VisuallyHidden>
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {monitors.map((monitor, index) => (
              <Tr key={monitor.id ?? 'default'}>
                {/* Checkbox */}
                <Td>
                  <Checkbox
                    checked={monitor.id !== null && selected.includes(monitor.id.toString())}
                    onCheckedChange={() => toggle(monitor)}
                  />
                </Td>

                {/* Name + status */}
                <Td>
                  <Flex gap={2} alignItems="self-start" direction="column">
                    <Typography fontWeight="semiBold">{monitor.name}</Typography>
                    <Typography variant="pi" textColor="neutral500">
                      {monitor.config.meta.url}
                    </Typography>
                  </Flex>
                </Td>

                {/* Channel type */}
                <Td>
                  <Badge
                    background={monitor.is_enabled ? 'success100' : 'neutral150'}
                    textColor={monitor.is_enabled ? 'success700' : 'neutral700'}
                  >
                    {monitor.is_enabled
                      ? monitor?.service_last_checks?.default?.uptime?.last_status === 'up'
                        ? 'Up'
                        : 'Down'
                      : 'Inactive'}
                  </Badge>
                </Td>
                <Td>
                  <Flex justifyContent="flex-end" alignItems="stretch" gap={2}>
                    <IconButton
                      onClick={() => onEdit && onEdit(monitor)}
                      label="Edit"
                      borderWidth={0}
                    >
                      <Pencil />
                    </IconButton>
                    <Box paddingLeft={1}>
                      <IconButton
                        onClick={() => handleDelete(monitor)}
                        label="Delete"
                        borderWidth={0}
                      >
                        <Trash />
                      </IconButton>
                    </Box>
                    <Badge style={{ cursor: 'pointer' }} onClick={() => handleSetPrimary(monitor)}>{
                    monitor?.id === primaryMonitorId ? 'Selected' : 'Set primary'}</Badge>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
