import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardContent,
  Typography,
  Divider,
  Button,
  Flex,
  Main,
  Badge,
} from '@strapi/design-system';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, request, getPrimaryMonitorId } from '../utils/helpers';
import DetailRow from '../components/reachability/DetailRow';
import StatusCard from '../components/reachability/StatusCard';
import LoadingCard from '../components/reachability/LoadingCard';
import PageHeader from '../components/PageHeader';
import { MonitorData, MixedContentData } from '../utils/types';
import { Link } from '@strapi/design-system';

export default function MixedContent() {
  const [data, setData] = useState<MixedContentData | null>(null);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);
  const navigate = useNavigate();
  const [monitorId, setMonitorId] = useState<string | null>();

  useEffect(() => {
    (async () => {
      const fetchedMonitorId = await getPrimaryMonitorId();
      if (!fetchedMonitorId) navigate('/plugins/upsnap/settings');
      setMonitorId(fetchedMonitorId);
    })();
  }, []);
  const getMixedContentData = async (url: string, forceFetch: boolean = false) => {
    try {
      setLoading(true);
      const res = await request('/monitor/health-check/mixed-content', {
        method: 'POST',
        data: { monitorUrl: url, force_fetch: forceFetch },
      });

      setData(res?.mixedContentHealthCheckData || null);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
      setSelectedMonitor(res.monitor?.data || null);
      setLoading(false);
    });
  }, [monitorId]);
  useEffect(() => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      getMixedContentData(selectedMonitor?.monitor?.config?.meta?.url);
    }
  }, [selectedMonitor?.monitor?.config?.meta?.url]);

  const handleRefresh = async () => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      setRefreshing(true);
      await getMixedContentData(selectedMonitor?.monitor?.config?.meta?.url, true);
      setRefreshing(false);
    }
  };

  // Show loading while checking for monitor URL
  if (loading) return <LoadingCard />;
  if (!data) return null;

  if (!data) return null;

  const isSuccess = data?.status === 'success' || data?.status === 'warning';
  const meta = data?.data?.result?.details?.mixed_content?.meta;
  const durationSec = data ? (data?.data?.result?.durationMs / 1000).toFixed(2) : 'N/A';

  return (
    <Main>
      {/* Header with Refresh Button */}
      <PageHeader
        title="Mixed Content"
        monitorUrl={selectedMonitor?.monitor?.config?.meta?.url}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      {/* Status summary card */}
      <StatusCard
        status={data.status}
        message={data.message}
        error={data.error}
        cardData={data.data}
      />

      {/* Details Card */}
      {isSuccess && meta && (
        <Card style={{ width: '950px' }}>
          <CardBody display="flex" style={{ flexDirection: 'column' }}>
            <CardContent style={{ width: '850px' }}>
              <Typography variant="delta" fontWeight="bold">
                General Info
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              <DetailRow
                label="Checked URL"
                value={meta.checkedUrl || selectedMonitor?.monitor?.config?.meta?.url}
              />
              <DetailRow label="Scan Duration (sec)" value={durationSec} />
              <Box marginTop={5}></Box>
              {/* --- Mixed Content Summary --- */}
              <Typography variant="delta" fontWeight="bold">
                Mixed Content Summary
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              <DetailRow label="Mixed Content Count" value={meta.mixedCount ?? '–'} />
              <Box marginTop={5}></Box>
              {/* --- Mixed Content Items --- */}
              <Typography variant="delta" fontWeight="bold">
                Mixed Content Items
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              {meta.mixedContentItems && meta.mixedContentItems.length > 0 ? (
                <Flex wrap={'wrap'} gap={2}>
                  {meta.mixedContentItems.map((url: string, idx: number) => (
                    <Link key={idx} href={url} isExternal rel="noopener noreferrer">
                      <Badge
                        value={url}
                        size="sm"
                        color="blue"
                        className="tw-cursor-pointer !tw-lowercase"
                      >
                        {url}
                      </Badge>
                    </Link>
                  ))}
                </Flex>
              ) : (
                <Typography variant="omega">No mixed content found.</Typography>
              )}
            </CardContent>
          </CardBody>
        </Card>
      )}
    </Main>
  );
}
