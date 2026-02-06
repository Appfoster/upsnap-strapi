import { Box, Grid, Typography } from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { getRangeTimestamps, request } from '../utils/helpers';
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
  const [selectedRegion, setSelectedRegion] = useState<string>('default');

  const id = '06cc228a-92fd-4474-a955-8914f5670a01';
  function getRegionResponseTimeData(): Record<string, RegionResponseTimeData> {
    const rt = responseTimeData?.response_time;
    console.log('monitor data regions ', monitorData?.monitor.regions);
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
    console.log('time range change event ', range);
    setResponseTimeRange(range);
    const { start, end } = getRangeTimestamps(range || 'last_24_hours');
    request(`/monitor/${id}/response-time?start=${start}&end=${end}&region=${selectedRegion}`, {
      method: 'GET',
    }).then((res) => {
      setResponseTimeData(res.responseTimeData?.data || null);
    });
  };

  useEffect(() => {
    const { start, end } = getRangeTimestamps(responseTimeRange || 'last_24_hours');
    setIsLoading(true);
    request(`/monitor/${id}`, {
      method: 'GET',
    }).then((res) => {
      setMonitorData(res.monitor?.data || null);
    });
    request(`/monitor/${id}/uptime-stats`, {
      method: 'GET',
    }).then((res) => {
      setUptimeStats(res.uptimeStatsData?.data || null);
    });
    request(`/monitor/${id}/histogram`, {
      method: 'GET',
    }).then((res) => {
      setHistogramData(res.histogramData?.data || null);
      setIsLoading(false);
    });

    request(`/monitor/${id}/response-time?start=${start}&end=${end}&region=${selectedRegion}`, {
      method: 'GET',
    }).then((res) => {
      setResponseTimeData(res.responseTimeData?.data || null);
    });
    request(`/monitor/${id}/incidents`, {
      method: 'GET',
    }).then((res) => {
      setMonitorIncidents(res.incidentsData?.data || null);
    });
  }, []);

  useEffect(() => {
    getRegionResponseTimeData();
  }, [responseTimeData]);

  return (
    <Main>
      <Box padding={1}>
        <Typography variant="beta" marginBottom={6}>
          Dashboard ({monitorData?.monitor?.name || ''})
        </Typography>
        <Grid.Root
          gap={{
            large: 10,
            medium: 2,
            initial: 1,
          }}
          style={{
            alignItems: 'start',
            alignContent: 'space-around',
            justifyItems: 'stretch',
          }}
        >
          <Grid.Item padding={1} col={8} xs={12}>
            <Box display="flex" style={{ flexDirection: 'column', gap: '16px', height: '100%' }}>
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
            </Box>
          </Grid.Item>

          <Grid.Item padding={1} col={4} xs={12}>
            <HealthCards monitorData={monitorData} isLoading={isLoading} />
          </Grid.Item>
        </Grid.Root>
        <IncidentsTable
          incidentsData={monitorIncidents}
          monitorName={monitorData?.monitor?.name || ''}
          isLoading={isLoading}
        />
      </Box>
    </Main>
  );
}
