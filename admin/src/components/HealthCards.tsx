import { Box, Card, CardBody, CardContent, CardTitle, CardSubtitle } from '@strapi/design-system';
import { formatDate } from '../utils/helpers';
import { HistogramData, MonitorData, UptimeStatsData } from '../utils/types';
import { HistogramChart } from '../components/Histogram';

interface Props {
  monitorData: MonitorData | null;
  uptimeStats: UptimeStatsData | null;
  histogramData: HistogramData | null;
  isLoading: boolean;
}

export const HealthCards = ({ monitorData, uptimeStats, histogramData, isLoading }: Props) => {
  return (
    <Box display="flex" style={{ flexDirection: 'column', gap: '16px'}}
      flex={{ initial: '1 1 auto', medium: '1', large: '1 1 0' }}>
      <Card>
        <CardBody>
          <CardContent paddingLeft={1}>
            <CardTitle fontSize={3}>Current Status</CardTitle>
            <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
              {monitorData?.monitor?.service_last_checks?.default?.uptime?.last_status || 'N/A'}
            </CardSubtitle>
          </CardContent>
        </CardBody>
      </Card>

      <Card>
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

      <Card>
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

      <Card>
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

      <Card>
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

      <Card>
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
    </Box>
  );
};