import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  Grid,
  Main,
} from '@strapi/design-system';
import { useParams } from 'react-router-dom';
import { request } from '../utils/helpers';
import DetailRow from '../components/reachability/DetailRow';
import StatusCard from '../components/reachability/StatusCard';
import BrokenLinksTable from '../components/broken-links/BrokenLinksTable';
import LoadingCard from '../components/reachability/LoadingCard';
import PageHeader from '../components/PageHeader';
import { MonitorData, BrokenLinksCheckData } from '../utils/types';

export default function BrokenLinks() {
  const monitorId = '06cc228a-92fd-4474-a955-8914f5670a01'; // useParams<{ monitorId: string }>();
  const [data, setData] = useState<BrokenLinksCheckData | null>(null);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);

  // Fetch monitor details
  useEffect(() => {
    setLoading(true);
    request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
      setSelectedMonitor(res.monitor?.data || null);
      setLoading(false);
    });
  }, [monitorId]);

  // Fetch broken links data
  const getBrokenLinksData = async (url: string, forceFetch: boolean = false) => {
    try {
      setLoading(true);
      const res = await request('/monitor/health-check/broken-links', {
        method: 'POST',
        data: { monitorUrl: url, force_fetch: forceFetch },
      });
      console.log('res broken links ', res);
      setData(res?.brokenLinksHealthCheckData || null);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      getBrokenLinksData(selectedMonitor.monitor.config.meta.url);
    }
  }, [selectedMonitor]);

  const handleRefresh = async () => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      setRefreshing(true);
      await getBrokenLinksData(selectedMonitor.monitor.config.meta.url, true);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingCard />;
  if (!data) return null;

  const isSuccess = true; // data.status === "success";
  const meta = data?.data.result?.details?.broken_links?.meta || {};
  const brokenLinks = data?.data.result?.details?.broken_links?.meta?.brokenLinks || [];
  const blockedLinks = data?.data.result?.details?.broken_links?.meta?.blockedLinks || [];
  const monitorUrl = selectedMonitor?.monitor?.config?.meta?.url;

  return (
    <Main>
      <Box padding={4}>
        <PageHeader
          title="Broken Links"
          monitorUrl={monitorUrl}
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
        {(isSuccess || data?.status === 'warning') && meta && (
          <Grid.Root
            gap={{
              large: 6,
              medium: 2,
              initial: 1,
            }}
            style={{
              alignItems: 'start',
              alignContent: 'space-around',
              justifyItems: 'stretch',
              marginTop: '10px',
            }}
          >
            <Grid.Item col={12} xs={12}>
              <Card style={{ width: '950px' }}>
                <CardBody display="flex" style={{ flexDirection: 'column' }}>
                  <CardContent style={{ width: '850px' }}>
                    <Typography variant="delta" fontWeight="bold">
                      Check Details
                    </Typography>
                    <Divider marginTop={3} marginBottom={4} />
                    <DetailRow label="Pages Checked" value={meta?.pagesChecked} />
                    <DetailRow label="Total Links Checked" value={meta?.checked} />
                    <DetailRow label="Broken Links Count" value={meta?.broken} />
                    <DetailRow label="Blocked Links Count" value={meta?.blocked} />

                    <Box marginTop={2}>
                      <Button
                        variant="secondary"
                        onClick={() => setShowMore(!showMore)}
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        {showMore ? 'Show less' : 'Show more'}
                      </Button>
                    </Box>
                  </CardContent>
                </CardBody>
              </Card>
            </Grid.Item>
          </Grid.Root>
        )}

        {/* Broken Links Table - Only show when "Show more" is clicked */}
        {showMore && (
          <Box marginTop={6}>
            <BrokenLinksTable brokenLinks={brokenLinks} blockedLinks={blockedLinks} />
          </Box>
        )}
      </Box>
    </Main>
  );
}
