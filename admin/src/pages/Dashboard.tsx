import { Box, Grid, Typography, Flex } from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { getRangeTimestamps, request, getPrimaryMonitorId } from '../utils/helpers';
import {
  HistogramData,
  MonitorData,
  ResponseTimeData,
  UptimeStatsData,
  RegionResponseTimeData,
} from '../utils/types';
import { StatisticsCards } from '../components/dashboard/StatisticsCards';
import { HealthCards } from '../components/dashboard/HealthCards';
import { ResponseTimeChart } from '../components/dashboard/ResponseTimeChart';
import { IncidentsTable } from '../components/dashboard/IncidentsTable';
import { useNavigate } from 'react-router-dom';
import { RegionsDropdown } from '../components/RegionsDropdown';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [uptimeStats, setUptimeStats] = useState<UptimeStatsData | null>(null);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData | null>(null);
  const [responseTimeRange, setResponseTimeRange] = useState<string | null>('last_24_hours');
  const [regionResponseTimeData, setRegionResponseTimeData] = useState<
    Record<string, RegionResponseTimeData>
  >({});
  const [monitorIncidents, setMonitorIncidents] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    if (monitorData?.monitor.regions && Array.isArray(monitorData?.monitor.regions)) {
      const primaryRegion = monitorData?.monitor.regions.find((r) => r.is_primary);
      return primaryRegion?.id || 'default';
    }
    return 'default';
  });
  const navigate = useNavigate();
  const [monitorId, setMonitorId] = useState<string | null>();
  const [regionId, setRegionId] = useState<string | null>(() => {
    if (monitorData?.monitor.regions && Array.isArray(monitorData?.monitor.regions)) {
      const primaryRegion = monitorData?.monitor.regions.find((r) => r.is_primary);
      return primaryRegion?.id || 'default';
    }
    return 'default';
  });
  useEffect(() => {
    (async () => {
      const fetchedMonitorId = await getPrimaryMonitorId();
      if (!fetchedMonitorId) navigate('/plugins/upsnap/settings');
      setMonitorId(fetchedMonitorId);
    })();
  }, []);
  function getRegionResponseTimeData(): Record<string, RegionResponseTimeData> {
    const rt = responseTimeData?.response_time;
    if (!rt) return {};
    // If it's already a map of regions
    if (
      typeof rt === 'object' &&
      !Array.isArray(rt) &&
      Object.values(rt).every(
        (val) => typeof val === 'object' && val !== null && 'chart_data' in val
      )
    ) {
      setRegionResponseTimeData(rt as unknown as Record<string, RegionResponseTimeData>);
      return rt as unknown as Record<string, RegionResponseTimeData>;
    }
    // If it's a single region (object with chart_data)
    if (typeof rt === 'object' && rt !== null && 'chart_data' in rt) {
      setRegionResponseTimeData({ [selectedRegion]: rt as RegionResponseTimeData });
      return { [selectedRegion]: rt as RegionResponseTimeData };
    }
    return {};
  }

  const handleTimeRangeChange = (range: string) => {
    setResponseTimeRange(range);
    const { start, end } = getRangeTimestamps(range || 'last_24_hours');
    request(
      `/monitor/${monitorId}/response-time?start=${start}&end=${end}&region=${selectedRegion}`,
      {
        method: 'GET',
      }
    ).then((res) => {
      setResponseTimeData(res.responseTimeData?.data || null);
    });
  };

  useEffect(() => {
    handleRefresh();
  }, [monitorId]);

  useEffect(() => {
    getRegionResponseTimeData();
  }, [responseTimeData]);
  const handleRefresh = () => {
    const { start, end } = getRangeTimestamps(responseTimeRange || 'last_24_hours');
    setIsLoading(true);
    request(`/monitor/${monitorId}`, {
      method: 'GET',
    }).then((res) => {
      if (res?.monitor?.message === 'Invalid authentication token') {
        navigate('/plugins/upsnap/settings');
      }
      setMonitorData(res.monitor?.data || null);
    });
    request(`/monitor/${monitorId}/uptime-stats?region=${selectedRegion}`, {
      method: 'GET',
    }).then((res) => {
      setUptimeStats(res.uptimeStatsData?.data || null);
    });
    request(`/monitor/${monitorId}/histogram?region=${selectedRegion}`, {
      method: 'GET',
    }).then((res) => {
      setHistogramData(res.histogramData?.data || null);
      setIsLoading(false);
    });

    request(
      `/monitor/${monitorId}/response-time?start=${start}&end=${end}&region=${selectedRegion}`,
      {
        method: 'GET',
      }
    ).then((res) => {
      setResponseTimeData(res.responseTimeData?.data || null);
    });
    request(`/monitor/${monitorId}/incidents`, {
      method: 'GET',
    }).then((res) => {
      setMonitorIncidents(res.incidentsData?.data || null);
    });
  };

  return (
    <Main>
      <Box padding={1}>
        <PageHeader
          title={'Dashboard'}
          monitorUrl={monitorData?.monitor?.config?.meta?.url || ''}
          regionsDropdown={true}
          selectedRegions={monitorData?.monitor?.regions}
          regionId={selectedRegion}
          onRegionChange={setSelectedRegion}
          onRefresh={handleRefresh}
          refreshing={isLoading}
        />
        <Flex
          gap={{
            large: 4,
            medium: 2,
            initial: 1,
          }}
          direction={{ initial: 'column', medium: 'row' }}
          alignItems="start"
          alignContent="space-around"
          justifyItems="stretch"
        >
          <Box width="100%">
            <Flex direction="column" gap={4} height="100%" alignItems="start" flexWrap="wrap">
              <StatisticsCards
                monitorData={monitorData}
                uptimeStats={uptimeStats}
                histogramData={histogramData}
                isLoading={isLoading}
              />
              <ResponseTimeChart
                monitor={monitorData?.monitor}
                regionResponseTimeData={regionResponseTimeData}
                timeRange={responseTimeRange || 'last_24_hours'}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </Flex>
          </Box>

          <Box width="100%">
            <HealthCards monitorData={monitorData} isLoading={isLoading} />
          </Box>
        </Flex>
        <IncidentsTable
          incidentsData={monitorIncidents}
          monitorName={monitorData?.monitor?.name || ''}
          isLoading={isLoading}
        />
      </Box>
    </Main>
  );
}
