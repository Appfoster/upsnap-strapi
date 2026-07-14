import { useEffect, useMemo, useState } from 'react';
import { Widget } from '@strapi/admin/strapi-admin';
import { Badge, Box, Flex, IconButton, Link, TextInput, Typography } from '@strapi/design-system';
import { Cross, Search, WarningCircle } from '@strapi/icons';
import { useNavigate } from 'react-router-dom';
import {
  ACCOUNT_CHANGED_EVENT,
  enrichMonitorWithPrimaryRegionStatus,
  formatRelativeTime,
  getBillingStatus,
  request,
} from '../../utils/helpers';
import { BILLING_UPGRADE_DISMISS_KEY, DASHBOARD_URL, hasActivePaidPlan } from '../../utils/constants';
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

function UpgradeStrip({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Flex
      background="alternative600"
      padding={2}
      borderRadius="4px"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      <Flex gap={2} alignItems="center">
        <WarningCircle fill="neutral0" width="1rem" height="1rem" />
        <Typography variant="pi" textColor="neutral0">
          Live monitor status is a Pro feature.{' '}
          <Link href={DASHBOARD_URL} isExternal color="neutral0" style={{ textDecoration: 'underline' }}>
            Upgrade now →
          </Link>
        </Typography>
      </Flex>
      <IconButton label="Close" variant="ghost" onClick={onDismiss}>
        <Cross fill="neutral0" />
      </IconButton>
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
  const [dismissedUpgrade, setDismissedUpgrade] = useState(
    () => sessionStorage.getItem(BILLING_UPGRADE_DISMISS_KEY) === 'true'
  );
  const [accountTick, setAccountTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setDismissedUpgrade(false);
      setAccountTick((tick) => tick + 1);
    };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getBillingStatus().then((billing) => {
      if (!cancelled) setPaid(billing?.hasToken ? hasActivePaidPlan(billing) : null);
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
  if (!monitors) return <Widget.Loading />;
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
      {paid === false && !dismissedUpgrade && (
        <UpgradeStrip
          onDismiss={() => {
            sessionStorage.setItem(BILLING_UPGRADE_DISMISS_KEY, 'true');
            setDismissedUpgrade(true);
          }}
        />
      )}
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
