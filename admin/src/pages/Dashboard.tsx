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
  Tooltip,
} from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { formatDate, request } from '../utils/helpers';
import { HistogramData, Monitor, MonitorData, UptimeStatsData } from '../utils/types';
import { HistogramChart } from '../components/Histogram';

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
      console.log('uptime stats ', res);
      setUptimeStats(res.uptimeStatsData?.data || null);
    });
    request(`/monitor/${id}/histogram`, {
      method: 'GET',
    }).then((res) => {
      console.log('histogram data ', res);
      setHistogramData(res.histogramData?.data || null);
      setIsLoading(false);
    });
  }, []);

  return (
    <Main>
      <Box padding={5}>
        <Typography variant="beta" marginBottom={6}>
          Dashboard
        </Typography>

        <Grid.Root gap={2}>
          <Grid.Item col={3}>
            <Card
              style={{
                width: '240px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Current Status</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {monitorData?.monitor?.service_last_checks?.default?.uptime?.last_status ||
                      'N/A'}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>

          <Grid.Item col={3}>
            <Card
              style={{
                width: '240px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last check</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {formatDate(
                      monitorData?.monitor?.service_last_checks?.default?.uptime?.last_checked_at ||
                        'N/A'
                    )}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>

          <Grid.Item col={3}>
            <Card
              style={{
                width: '280px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 24 hours</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    <HistogramChart
                      data={histogramData?.histogram?.data || []}
                      isLoading={isLoading}
                    />
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>
        </Grid.Root>

        <Grid.Root gap={2} marginTop={4}>
          <Grid.Item col={3}>
            <Card
              style={{
                width: '240px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 24h</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.day?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.day.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>

          <Grid.Item col={3}>
            <Card
              style={{
                width: '240px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last week</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.week?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.week.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>

          <Grid.Item col={3}>
            <Card
              style={{
                width: '240px',
              }}
            >
              <CardBody>
                <CardContent paddingLeft={1}>
                  <CardTitle fontSize={3}>Last 30 days</CardTitle>
                  <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                    {uptimeStats?.uptime_stats?.month?.uptime_percentage
                      ? `${uptimeStats.uptime_stats.month.uptime_percentage}%`
                      : 'N/A'}
                  </CardSubtitle>
                </CardContent>
              </CardBody>
            </Card>
          </Grid.Item>
        </Grid.Root>
      </Box>
    </Main>
  );
}
