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
  CardBadge
} from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { request } from '../utils/helpers';
import { Monitor, MonitorData } from '../utils/types';

export default function Dashboard() {
 const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
 const [uptimeStats, setUptimeStats] = useState(null);
 const id = '9bd97575-21ae-4d59-9dc9-e9b31b4dea92'
 useEffect(() => {
    request(`/monitor/${id}`, {
        method: 'GET'
    }).then(res => {
      console.log('res ', res);
      setMonitorData(res.monitor?.data || null);
    })
    request(`/monitor/${id}/uptime-stats`, {
        method: 'GET'
    }).then(res => {
      console.log('uptime stats ', res);
      setUptimeStats(res.uptimeStatsData?.data || null);
    })
 }, [])

  return (
    <Main>
    <Box padding={5}>
        <Typography variant="beta" marginBottom={6}>
            Dashboard
        </Typography>

        <Grid.Root gap={5}>
        <Grid.Item col={6}>
           <Card
                style={{
                    width: '240px',
                }}
                id="fourth"
            >
            <CardBody>
                <CardContent paddingLeft={1}>
                <CardTitle fontSize={3}>Current Status</CardTitle>
                <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>{monitorData?.monitor?.service_last_checks
?.default?.uptime?.last_status}</CardSubtitle>
                </CardContent>
                <CardBadge>Doc</CardBadge>
            </CardBody>
            </Card>
        </Grid.Item>

        <Grid.Item col={6}>
            <Card>
            <CardHeader>
                <Typography fontWeight="bold">Performance</Typography>
            </CardHeader>
            <CardBody>
                <Typography>Fast</Typography>
            </CardBody>
            </Card>
        </Grid.Item>

        <Grid.Item col={6}>
            <Card>
            <CardHeader>
                <Typography fontWeight="bold">SSL Status</Typography>
            </CardHeader>
            <CardBody>
                <Typography>Valid</Typography>
            </CardBody>
            </Card>
        </Grid.Item>

        <Grid.Item col={6}>
            <Card>
            <CardHeader>
                <Typography fontWeight="bold">Broken Links</Typography>
            </CardHeader>
            <CardBody>
                <Typography>3 found</Typography>
            </CardBody>
            </Card>
        </Grid.Item>
        </Grid.Root>
    </Box>
    </Main>
  );
}
