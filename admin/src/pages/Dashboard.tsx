import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Typography,
  CardContent,
  CardTitle,
  CardSubtitle,
} from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { formatDate, request } from '../utils/helpers';
import { HistogramData, Monitor, MonitorData, UptimeStatsData } from '../utils/types';
import { StatisticsCards } from '../components/StatisticsCards';
import { HealthCards } from '../components/HealthCards';

export default function Dashboard() {
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [uptimeStats, setUptimeStats] = useState<UptimeStatsData | null>(null);
  const [histogramData, setHistogramData] = useState<HistogramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = '9bd97575-21ae-4d59-9dc9-e9b31b4dea92';

  useEffect(() => {
    setIsLoading(true);
    request(`/monitor/${id}`, {
      method: 'GET',
    }).then((res) => {
      console.log('res ', res);
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
  }, []);

  return (
    <Main>
      <Box padding={1}>
        <Typography variant="beta" marginBottom={6}>
          Dashboard
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
            <StatisticsCards
              monitorData={monitorData}
              uptimeStats={uptimeStats}
              histogramData={histogramData}
              isLoading={isLoading}
            />
          </Grid.Item>
          <Grid.Item padding={1} col={4} xs={12}>
            <HealthCards
              monitorData={monitorData}
              uptimeStats={uptimeStats}
              histogramData={histogramData}
              isLoading={isLoading}
            />
          </Grid.Item>
        </Grid.Root>
      </Box>
    </Main>
  );
}
