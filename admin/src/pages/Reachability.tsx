import React, { useEffect, useState, useMemo } from 'react';
import { Box, Card, CardContent, CardBody, Typography, Grid, Divider } from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useParams } from 'react-router-dom';
import { getRangeTimestamps, request } from '../utils/helpers';
import DetailRow from '../components/reachability/DetailRow';
import StatusCard from '../components/reachability/StatusCard';
import LoadingCard from '../components/reachability/LoadingCard';
import RegionWiseCards from '../components/reachability/RegionWiseCards';
import { MonitorData, Region, UptimeHealthCheckData, ResponseTimeData } from '../utils/types';
import { RegionResponseTimeChart } from '../components/reachability/RegionResponseTimeChart';

interface RegionResponseTimeData {
  chart_data: Array<{ timestamp: number; response_time: number }>;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
}

export default function Reachability() {
  const monitorId = '06cc228a-92fd-4474-a955-8914f5670a01'; // useParams<{ monitorId: string }>();
  const [data, setData] = useState<UptimeHealthCheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [regionResponseTimeData, setRegionResponseTimeData] = useState<
    Record<string, RegionResponseTimeData>
  >({});
  const [loadingRegions, setLoadingRegions] = useState<Set<string>>(new Set());
  const [responseTimeRange, setResponseTimeRange] = useState<string | null>('last_24_hours');

  const fetchResponseTimeDataForRegions = async (
    regions: { id: string; is_primary: boolean; name: string }[],
    timeRange: string
  ) => {
    if (!regions || regions.length === 0) return;

    const { start, end } = getRangeTimestamps(timeRange);

    setRegionResponseTimeData({}); // Clear existing data

    for (const region of regions) {
      try {
        const res = await request(
          `/monitor/${monitorId}/response-time?start=${start}&end=${end}&region=${region.id}`,
          { method: 'GET' }
        );
        if (res.responseTimeData?.data) {
          setRegionResponseTimeData((prev) => ({
            ...prev,
            [region.id]: res.responseTimeData.data?.response_time,
          }));
        }
      } catch (error) {
        console.error(`Error fetching data for region ${region.id}:`, error);
      }
    }
  };

  console.log('data ', data);
  // Fetch monitor details
  useEffect(() => {
    if (monitorId) {
      setLoading(true);
      request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
        console.log('monitor details ', res);
        setSelectedMonitor(res.monitor?.data || null);
        // Fetch region data after monitorData is set
        if (res.monitor?.data?.monitor?.regions) {
          fetchResponseTimeDataForRegions(
            res.monitor.data.monitor.regions,
            responseTimeRange || 'last_24_hours'
          );
        }
        setLoading(false);
      });
    }
  }, [monitorId]);

  // Fetch reachability data
  const getReachabilityData = async (url: string, region?: string | null) => {
    setLoading(true);
    try {
      console.log('fetch reachability data for ', url, region);
      const res = await request('/monitor/health-check/uptime', {
        method: 'POST',
        data: { monitorUrl: url },
      });
      setData(res?.uptimeHealthCheckData);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch region response time data
  const fetchResponseTimeForRegion = async (regionId: string, start: number, end: number) => {
    try {
      const res = await request(
        `/monitor/${monitorId}/response-time?start=${start}&end=${end}&region=${regionId}`,
        { method: 'GET' }
      );
      return res?.responseTimeData?.data?.response_time || null;
    } catch {
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (selectedMonitor) {
      console.log('selected monitor ', selectedMonitor);
      const primaryRegion = selectedMonitor?.monitor?.regions?.find((r: Region) => r.is_primary);
      console.log('primary region ', primaryRegion);
      setRegionId(primaryRegion?.id || null);
      getReachabilityData(selectedMonitor?.monitor?.config?.meta?.url, primaryRegion?.id || null);
    }
  }, [selectedMonitor]);

  // Fetch region response time data for all regions
  useEffect(() => {
    const fetchAll = async () => {
      const regions = Array.isArray(selectedMonitor?.monitor?.regions)
        ? selectedMonitor?.monitor?.regions
        : [];
      if (!regions.length) return;
      const { start, end } = getRangeTimestamps(responseTimeRange || 'last_24_hours');
      setRegionResponseTimeData({});
      setLoadingRegions(new Set(regions.map((r: Region) => r.id)));
      for (const region of regions) {
        const responseTimeData = await fetchResponseTimeForRegion(region.id, start, end);
        if (responseTimeData) {
          setRegionResponseTimeData((prev) => ({ ...prev, [region.id]: responseTimeData }));
        }
        setLoadingRegions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(region.id);
          return newSet;
        });
      }
    };
    if (selectedMonitor?.monitor?.id && selectedMonitor?.monitor?.regions) {
      fetchAll();
    }
  }, [selectedMonitor?.monitor?.id, selectedMonitor?.monitor?.regions, responseTimeRange]);

  const handleRegionChange = async (newRegionId: string) => {
    setRegionId(newRegionId);
    if (selectedMonitor) {
      await getReachabilityData(selectedMonitor?.monitor?.config?.meta?.url, newRegionId);
    }
  };
  const handleTimeRangeChange = (range: string) => {
    console.log('time range change event ', range);
    setResponseTimeRange(range);
    // Fetch region data if monitorData is available
    if (selectedMonitor?.monitor?.regions) {
      fetchResponseTimeDataForRegions(selectedMonitor.monitor.regions, range || 'last_24_hours');
    }
  };

  const regionNames = useMemo(() => {
    const names: Record<string, string> = {};
    if (selectedMonitor?.monitor?.regions && Array.isArray(selectedMonitor?.monitor?.regions)) {
      selectedMonitor?.monitor?.regions?.forEach((region: Region) => {
        names[region.id] = region.name;
      });
    }
    return names;
  }, [selectedMonitor?.monitor?.regions]);

  if (loading || !selectedMonitor) return <LoadingCard />;
  if (!data) return null;

  const isSuccess = data?.result?.details?.uptime?.ok === true;
  const meta = data?.result?.details?.uptime?.meta;
  const tls = meta?.tls;
  const regions = selectedMonitor?.monitor?.regions || [];
  console.log('meta ', meta);
  return (
    <Main>
      <Box padding={4}>
        <Typography variant="beta" as="h2" marginBottom={4}>
          Reachability ({selectedMonitor.monitor?.name || ''})
        </Typography>
        {/* <StatusCard status={data.status} message={data.message} error={data.error} cardData={data.data} /> */}
        {isSuccess && meta && (
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
            <Grid.Item col={8}>
              <Card style={{ width: '700px' }}>
                <CardBody display="flex" style={{ flexDirection: 'column' }}>
                  <CardContent style={{ width: '650px' }}>
                    <Typography variant="delta" fontWeight="bold" marginBottom={2}>
                      HTTP Details
                    </Typography>
                    <Divider marginTop={3} marginBottom={4} />
                    <DetailRow label="HTTP status" value={meta.statusCode} isChip={true} />
                    <DetailRow label="Final URL" value={meta.finalURL} isUrl={true} />
                    <DetailRow label="Redirects" value={meta.redirects} />
                    <DetailRow label="Resolved IPs" value={meta.resolvedIPs} />
                    <DetailRow label="Server" value={meta.server} />
                    <DetailRow label="Content Type" value={meta.contentType} />
                    <Box marginTop={4}></Box>
                    <Typography variant="delta" fontWeight="bold">
                      Page Info
                    </Typography>
                    <Divider marginTop={3} marginBottom={3} />
                    <DetailRow label="Page title" value={meta.title} />
                    <Box marginTop={5}></Box>
                    <Typography variant="delta" fontWeight="bold" marginTop={6} marginBottom={2}>
                      TLS / Security
                    </Typography>
                    <Divider marginTop={3} marginBottom={4} />
                    <DetailRow label="TLS Version" value={tls?.version} />
                    <DetailRow label="ALPN" value={tls?.alpn} />
                    <DetailRow label="Cipher suite" value={tls?.cipherSuite} />
                    <DetailRow label="Server Name" value={tls?.serverName} />
                  </CardContent>
                </CardBody>
              </Card>
            </Grid.Item>
            <Grid.Item col={4}>
              <RegionWiseCards
                regions={regions}
                regionNames={regionNames}
                regionResponseTimeData={regionResponseTimeData}
                loadingRegions={loadingRegions}
              />
            </Grid.Item>
          </Grid.Root>
        )}
        <Box marginTop={8}>
          <RegionResponseTimeChart
            monitor={selectedMonitor?.monitor}
            regionResponseTimeData={regionResponseTimeData}
            timeRange={responseTimeRange || 'last_24_hours'}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </Box>
      </Box>
    </Main>
  );
}
