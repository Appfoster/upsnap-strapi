import { useEffect, useMemo, useState } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';
import { Badge, Box, Flex, Link, TextInput, Typography } from '@strapi/design-system';
import { Lock, Search } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';
import {
  ACCOUNT_CHANGED_EVENT,
  enrichMonitorWithPrimaryRegionStatus,
  formatRelativeTime,
  getBillingStatus,
  request,
} from '../../utils/helpers';
import { DASHBOARD_URL, hasActivePaidPlan } from '../../utils/constants';
import { Monitor, HistogramPoint } from '../../utils/types';
import { PLUGIN_ID } from '../../pluginId';
import { HistogramChart } from '../dashboard/Histogram';

type Status = 'up' | 'down' | 'paused';
type StatusFilter = 'all' | Status;
type SortKey = 'status' | 'name' | 'uptime';

interface Extra {
  uptime: number | null;
  histogram: HistogramPoint[];
}

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: 'All',
  up: 'Up',
  down: 'Down',
  paused: 'Paused',
};

const STATUS_ORDER: Record<Status, number> = { down: 0, paused: 1, up: 2 };

function getMonitorStatus(monitor: Monitor): Status {
  if (!monitor.is_enabled) return 'paused';
  return enrichMonitorWithPrimaryRegionStatus(monitor).last_status === 'up' ? 'up' : 'down';
}

function ProGate() {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
      height="100%"
      padding={6}
    >
      <Lock fill="primary600" width="2rem" height="2rem" />
      <Flex direction="column" alignItems="center" gap={1}>
        <Typography variant="delta" textAlign="center">
          Live monitor status is a Pro feature
        </Typography>
        <Typography variant="pi" textColor="neutral600" textAlign="center">
          Upgrade your plan to see the real-time status of your monitors here.
        </Typography>
      </Flex>
      <Link href={DASHBOARD_URL} isExternal>
        Upgrade now →
      </Link>
    </Flex>
  );
}

export function MonitorStatusWidget() {
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState(false);
  const [extras, setExtras] = useState<Record<string, Extra>>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [search, setSearch] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [billingResolved, setBillingResolved] = useState(false);
  const [accountTick, setAccountTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setAccountTick((tick) => tick + 1);
    };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBillingResolved(false);
    getBillingStatus().then((billing) => {
      if (cancelled) return;
      setPaid(billing?.hasToken ? hasActivePaidPlan(billing) : null);
      setBillingResolved(true);
    });
    return () => {
      cancelled = true;
    };
  }, [accountTick]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await request('/monitors', { method: 'GET' });
        const list = res?.monitorsData?.data?.monitors;
        if (cancelled) return;
        const monitorList: Monitor[] = Array.isArray(list) ? list : [];
        setMonitors(monitorList);
        setUpdatedAt(new Date());

        const entries = await Promise.all(
          monitorList.map(async (monitor) => {
            const [uptimeRes, histogramRes] = await Promise.all([
              request(`/monitor/${monitor.id}/uptime-stats?region=default`, { method: 'GET' }),
              request(`/monitor/${monitor.id}/histogram?region=default`, { method: 'GET' }),
            ]);
            return [
              monitor.id,
              {
                uptime:
                  uptimeRes?.uptimeStatsData?.data?.uptime_stats?.day?.uptime_percentage ?? null,
                histogram: histogramRes?.histogramData?.data?.histogram?.data ?? [],
              },
            ] as [string, Extra];
          })
        );
        if (!cancelled) setExtras(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountTick]);

  const rows = useMemo(() => {
    if (!monitors) return [];
    const withStatus = monitors.map((monitor) => ({ monitor, status: getMonitorStatus(monitor) }));
    const scoped = withStatus
      .filter((row) => statusFilter === 'all' || row.status === statusFilter)
      .filter((row) => row.monitor.name.toLowerCase().includes(search.trim().toLowerCase()));
    return [...scoped].sort((a, b) => {
      if (sortKey === 'name') return a.monitor.name.localeCompare(b.monitor.name);
      if (sortKey === 'uptime') {
        const uptimeA = extras[a.monitor.id]?.uptime ?? -1;
        const uptimeB = extras[b.monitor.id]?.uptime ?? -1;
        return uptimeA - uptimeB;
      }
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    });
  }, [monitors, statusFilter, sortKey, search, extras]);

  if (error) return <Widget.Error />;
  if (!monitors || !billingResolved) return <Widget.Loading />;
  if (paid === false) return <ProGate />;
  if (monitors.length === 0) return <Widget.NoData>No monitors yet</Widget.NoData>;

  const counts = monitors.reduce(
    (acc, monitor) => {
      acc[getMonitorStatus(monitor)] += 1;
      return acc;
    },
    { up: 0, down: 0, paused: 0 } as Record<Status, number>
  );

  return (
    <Flex direction="column" alignItems="stretch" gap={2} height="100%">
      <Typography variant="pi" textColor="neutral500">
        {monitors.length} monitor{monitors.length === 1 ? '' : 's'} · {counts.up} up ·{' '}
        {counts.down} down · {counts.paused} paused
        {updatedAt
          ? ` · updated ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : ''}
      </Typography>
      <TextInput
        aria-label="Search monitors"
        placeholder="Search monitors..."
        startAction={<Search />}
        value={search}
        onChange={(e: any) => setSearch(e.target.value)}
      />
      <Flex justifyContent="space-between" wrap="wrap" gap={2}>
        <Flex gap={1} wrap="wrap">
          {(['all', 'up', 'down', 'paused'] as StatusFilter[]).map((key) => (
            <Badge
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{ cursor: 'pointer' }}
              textColor={statusFilter === key ? 'primary700' : 'neutral600'}
              background={statusFilter === key ? 'primary100' : 'neutral150'}
            >
              {STATUS_LABEL[key]}
              {key !== 'all' ? ` ${counts[key]}` : ''}
            </Badge>
          ))}
        </Flex>
        <Flex gap={1}>
          {(['status', 'name', 'uptime'] as SortKey[]).map((key) => (
            <Badge
              key={key}
              onClick={() => setSortKey(key)}
              style={{ cursor: 'pointer' }}
              textColor={sortKey === key ? 'primary700' : 'neutral600'}
              background={sortKey === key ? 'primary100' : 'neutral0'}
            >
              Sort: {key === 'status' ? 'Status' : key === 'name' ? 'Name' : 'Uptime'}
            </Badge>
          ))}
        </Flex>
      </Flex>
      <Box overflow="auto" style={{ flex: 1 }}>
        <Flex direction="column" alignItems="stretch" gap={2}>
          {rows.map(({ monitor, status }) => {
            const extra = extras[monitor.id];
            const lastCheckedAt =
              enrichMonitorWithPrimaryRegionStatus(monitor).last_check_at ||
              monitor.last_checked_at ||
              null;

            return (
              <Flex
                key={monitor.id}
                direction="column"
                alignItems="stretch"
                gap={2}
                padding={3}
                hasRadius
                background="neutral100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/plugins/${PLUGIN_ID}/dashboard?monitorId=${monitor.id}`)}
              >
                <Flex justifyContent="space-between" alignItems="center" gap={2}>
                  <Typography fontWeight="semiBold" ellipsis>
                    {monitor.name}
                  </Typography>
                  <Flex gap={1} alignItems="center">
                    {extra?.uptime != null && (
                      <Badge
                        background={extra.uptime >= 99 ? 'success100' : 'warning100'}
                        textColor={extra.uptime >= 99 ? 'success700' : 'warning700'}
                      >
                        {extra.uptime}% uptime
                      </Badge>
                    )}
                    <Badge
                      background={
                        status === 'up'
                          ? 'success100'
                          : status === 'down'
                            ? 'danger100'
                            : 'neutral150'
                      }
                      textColor={
                        status === 'up'
                          ? 'success700'
                          : status === 'down'
                            ? 'danger700'
                            : 'neutral700'
                      }
                    >
                      {status === 'up' ? 'Up' : status === 'down' ? 'Down' : 'Paused'}
                    </Badge>
                  </Flex>
                </Flex>
                <Flex justifyContent="space-between" alignItems="flex-end" gap={2}>
                  <Typography variant="pi" textColor="neutral500" ellipsis>
                    {monitor.config?.meta?.url} · {formatRelativeTime(lastCheckedAt)}
                  </Typography>
                  <Box style={{ flexShrink: 0 }} onClick={(e: any) => e.stopPropagation()}>
                    <HistogramChart data={extra?.histogram.slice(-10) || []} isLoading={!extra} />
                  </Box>
                </Flex>
              </Flex>
            );
          })}
          {rows.length === 0 && (
            <Typography textColor="neutral500" variant="pi">
              No monitors match this filter.
            </Typography>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
