import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Flex,
  Typography,
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
  Link,
} from '@strapi/design-system';
import { toast } from 'react-toastify';
import { Pencil, Trash } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';
import {
  fetchTags,
  getPrimaryMonitorId,
  setPrimaryMonitorId,
  enrichMonitorWithPrimaryRegionStatus,
  formatRelativeTime,
  formatDateTime,
  request,
} from '../../../utils/helpers';
import { Monitor, Tag } from '../../../utils/types';

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
  setBulkDeleteIds: any;
}

const EMPTY_MONITORS: Monitor[] = [];

/* ------------------------------------------------------------------ */
export default function MonitorsTable({
  monitors = EMPTY_MONITORS,
  onChange,
  onEdit,
  handleDelete,
  setBulkDeleteIds,
}: MonitorsTableProps) {
  const [selected, setSelected] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const isInternalUpdate = useRef(false);
  const [primaryMonitorId, setPrimaryMonitorIdState] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [uptimeByMonitor, setUptimeByMonitor] = useState<Record<string, number | null>>({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchTags(setLoading, setAvailableTags);
  }, [monitors]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      monitors
        .filter((monitor) => monitor.id)
        .map((monitor) =>
          request(`/monitor/${monitor.id}/uptime-stats?region=default`, { method: 'GET' }).then(
            (res) => [
              monitor.id,
              res?.uptimeStatsData?.data?.uptime_stats?.day?.uptime_percentage ?? null,
            ]
          )
        )
    ).then((entries) => {
      if (cancelled) return;
      setUptimeByMonitor(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [monitors]);

  useEffect(() => {
    async function fetchPrimaryMonitorId() {
      try {
        const id = await getPrimaryMonitorId();
        if (id) setPrimaryMonitorIdState(id);
      } catch (err) {
        console.error('Error fetching primary monitor ID:', err);
      }
    }
    fetchPrimaryMonitorId();
  }, []);

  /* --------------------------------------
        Create or toggle a monitor
    --------------------------------------*/
  const toggle = async (row: Monitor) => {
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
    // Get all valid monitor IDs
    const allMonitorIds = Array.isArray(monitors)
      ? monitors.filter((monitor) => monitor.id !== null).map((monitor) => monitor.id!.toString())
      : [];

    // Check if all monitors are selected
    const isAllSelected = allMonitorIds.every((id) => selected.includes(id));

    setSelected((prev: string[]) => {
      const updated = isAllSelected ? [] : allMonitorIds;
      isInternalUpdate.current = true;
      return updated;
    });
  };

  useEffect(() => {
    if (isInternalUpdate.current) {
      // onChange(selected);
    }
    setBulkDeleteIds(selected);
  }, [selected, onChange]);

  const handleSetPrimary = async (monitor: Monitor) => {
    try {
      const result = await setPrimaryMonitorId(monitor.id);
      if (result) {
        toast.success('Primary monitor set successfully');
        setPrimaryMonitorIdState(monitor.id);
        navigate('/plugins/upsnap/dashboard');
        return;
      } else {
        toast.error('Failed to set primary monitor');
      }
    } catch (err) {
      console.error('Error setting primary monitor:', err);
      toast.error('An error occurred while setting primary monitor');
    }
  };

  return (
    <Box width="100%">
      <Box borderColor="neutral200" hasRadius overflow="auto">
        <Table colCount={6} rowCount={monitors.length}>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  checked={
                    monitors.length > 0 &&
                    monitors.every(
                      (monitor) => monitor.id !== null && selected.includes(monitor.id.toString())
                    )
                  }
                  onCheckedChange={toggleAll}
                />
              </Th>

              <Th>
                <Typography>Monitor</Typography>
              </Th>

              <Th>
                <Typography>Uptime</Typography>
              </Th>

              <Th>
                <Typography>Last Checked</Typography>
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
            {monitors.map((monitor, index) => {
              const lastCheckedAt =
                enrichMonitorWithPrimaryRegionStatus(monitor).last_check_at ||
                monitor.last_checked_at ||
                null;

              return (
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
                    <Link
                      onClick={(e: any) => {
                        e.preventDefault();
                        navigate(`/plugins/upsnap/dashboard?monitorId=${monitor.id}`);
                      }}
                    >
                      <Typography fontWeight="semiBold">{monitor.name}</Typography>
                    </Link>
                    <Flex direction="column" gap={1} alignItems="flex-start" width="100%">
                      <Flex direction="row" gap={1} alignItems="center" width="100%">
                        <Badge
                          size="S"
                          active={monitor.is_enabled}
                          textColor="primary500"
                          background="neutral150"
                          shrink={0}
                          minWidth="fit-content"
                        >
                          {monitor.service_type}
                        </Badge>
                        <Box maxWidth="320px" overflow="hidden">
                          <Typography
                            variant="pi"
                            textColor="neutral500"
                            ellipsis
                            title={monitor.config.meta.url}
                          >
                            {monitor.config.meta.url}
                          </Typography>
                        </Box>
                      </Flex>
                      {monitor.tag_ids && monitor.tag_ids.length > 0 && (
                        <Flex wrap="wrap" gap={1}>
                          {monitor.tag_ids.map((tagId) => {
                            const tag = availableTags?.find((tag) => tag.id === tagId);
                            if (!tag) return null;
                            return (
                              <Badge
                                key={tagId}
                                size="S"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  border: `1px solid ${tag.color}40`,
                                }}
                              >
                                {tag.name}
                              </Badge>
                            );
                          })}
                        </Flex>
                      )}
                    </Flex>
                  </Flex>
                </Td>

                {/* Uptime */}
                <Td>
                  <Typography>
                    {monitor.id && uptimeByMonitor[monitor.id] != null
                      ? `${uptimeByMonitor[monitor.id]}%`
                      : '—'}
                  </Typography>
                </Td>

                {/* Last checked */}
                <Td>
                  <span title={lastCheckedAt ? formatDateTime(lastCheckedAt) : undefined}>
                    <Typography>{formatRelativeTime(lastCheckedAt)}</Typography>
                  </span>
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
                      : 'Paused'}
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
                    <Badge style={{ cursor: 'pointer' }} onClick={() => handleSetPrimary(monitor)}>
                      {monitor?.id === primaryMonitorId ? 'Selected' : 'Set primary'}
                    </Badge>
                  </Flex>
                </Td>
              </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
