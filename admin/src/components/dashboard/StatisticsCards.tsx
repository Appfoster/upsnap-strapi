import {
  Grid,
  Card,
  Box,
  CardBody,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardBadge
} from '@strapi/design-system';
import { formatDate } from '../../utils/helpers';
import { HistogramData, MonitorData, UptimeStatsData } from '../../utils/types';
import { HistogramChart } from './Histogram';

interface Props {
  monitorData: MonitorData | null;
  uptimeStats: UptimeStatsData | null;
  histogramData: HistogramData | null;
  isLoading: boolean;
}

export const StatisticsCards = ({ monitorData, uptimeStats, histogramData, isLoading }: Props) => {
const getIncidentCount = (time: 'day' | 'month' | 'week') => {
  return uptimeStats?.uptime_stats?.[time]?.incident_count || 0;
}
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Grid.Root gap={2}>
        <Grid.Item col={4}>
          <Card
            style={{
              width: '240px',
            }}
          >
            <CardBody>
              <CardContent paddingLeft={1}>
                <CardTitle fontSize={3}>Current Status</CardTitle>
                <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
                  {monitorData?.monitor?.service_last_checks?.default?.uptime?.last_status || 'N/A'}
                </CardSubtitle>
              </CardContent>
            </CardBody>
          </Card>
        </Grid.Item>

        <Grid.Item col={4}>
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

        <Grid.Item col={4}>
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
        <Grid.Item col={4}>
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
              <CardBadge>{getIncidentCount('day')} incident{getIncidentCount('day') > 1 ? 's' : ''}</CardBadge>
            </CardBody>
          </Card>
        </Grid.Item>

        <Grid.Item col={4}>
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
              <CardBadge>{getIncidentCount('week')} incident{getIncidentCount('week') > 1 ? 's' : ''}</CardBadge>
            </CardBody>
          </Card>
        </Grid.Item>

        <Grid.Item col={4}>
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
              <CardBadge>{getIncidentCount('month')} incident{getIncidentCount('month') > 1 ? 's' : ''}</CardBadge>
            </CardBody>
          </Card>
        </Grid.Item>
      </Grid.Root>
    </Box>
  );
};
