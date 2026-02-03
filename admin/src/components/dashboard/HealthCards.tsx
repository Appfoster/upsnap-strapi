import {
  Box,
  Card,
  Link,
  CardBody,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardHeader,
} from '@strapi/design-system';
import { formatDate, formatTitleToUppercase, request } from '../../utils/helpers';
import {  MonitorData } from '../../utils/types';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowsCounterClockwise, CrossCircle, SealCheck } from '@strapi/icons';
import { Typography } from '@strapi/design-system';

interface Props {
  monitorData: MonitorData | null;
  isLoading: boolean;
}

export const HealthCards = ({ monitorData, isLoading }: Props) => {

  const [uptimeHealthCheck, setUptimeHealthCheck] = useState<any>(null);
  const [sslHealthCheck, setSslHealthCheck] = useState<any>(null);
  const [lighthouseHealthCheck, setLighthouseHealthCheck] = useState<any>(null);
  const [domainHealthCheck, setDomainHealthCheck] = useState<any>(null);
  const [brokenLinksHealthCheck, setBrokenLinksHealthCheck] = useState<any>(null);
  const [mixedContentHealthCheck, setMixedContentHealthCheck] = useState<any>(null);

  useEffect(() => {
    const monitorUrl = monitorData?.monitor?.config?.meta?.url;
    if (!monitorUrl) return;
    console.log('monitor url ', monitorUrl);
    request('/monitor/health-check/uptime', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setUptimeHealthCheck(res.uptimeHealthCheckData || null);
    });
    request('/monitor/health-check/ssl', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setSslHealthCheck(res.sslHealthCheckData || null);
    });
    request('/monitor/health-check/lighthouse', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setLighthouseHealthCheck(res.lighthouseHealthCheckData || null);
    });
    request('/monitor/health-check/domain', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setDomainHealthCheck(res.domainHealthCheckData || null);
    });
    request('/monitor/health-check/broken-links', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setBrokenLinksHealthCheck(res.brokenLinksHealthCheckData || null);
    });
    request('/monitor/health-check/mixed-content', {
      method: 'POST',
      data: { monitorUrl },
    }).then((res) => {
      setMixedContentHealthCheck(res.mixedContentHealthCheckData || null);
    });
  }, [monitorData]);
  const RenderHealthCard = ({data, name}: any) => (
    <Card>
      <CardBody>
        <CardContent paddingLeft={1}>
          <CardHeader fontSize={3}>{formatTitleToUppercase(name)}</CardHeader>
          {data &&
            (data?.result?.summary?.ok ? (
              <CardTitle marginTop={3} fontSize={3}>
                <SealCheck color="success700" style={{ color: '#10b981' }} />
                <Typography> {data?.result?.summary?.message}</Typography>
              </CardTitle>
            ) : (
              <CardTitle marginTop={3} fontSize={3} textColor={'red'}>
                <CrossCircle color="danger700" />{' '}
                <Typography>{data?.result?.summary?.message}</Typography>
              </CardTitle>
            ))}
          <CardSubtitle marginTop={1} fontSize={3} textColor={'green'}>
            <Typography>Last checked at: </Typography> {formatDate(data?.checkedAt)}
            <Box display="flex" marginTop={2} style={{ justifyContent: 'space-between' }}>
              <Link href="#">
                <Box display="flex" style={{ alignItems: 'center', gap: '3px' }} cursor="pointer">
                  <ArrowsCounterClockwise /> <Typography> Check Now </Typography>
                </Box>
              </Link>
              <Link href="#">
                <Box display="flex" style={{ alignItems: 'flex-end', gap: '3px' }} cursor="pointer">
                  <Typography>View Details</Typography>
                  <ArrowRight />
                </Box>
              </Link>
            </Box>
          </CardSubtitle>
        </CardContent>
      </CardBody>
    </Card>
  );
  return (
    <Box
      display="flex"
      style={{ flexDirection: 'column', gap: '16px' }}
      flex={{ initial: '1 1 auto', medium: '1', large: '1 1 0' }}
    >
      <RenderHealthCard data={uptimeHealthCheck} name={'reachability'} />
      <RenderHealthCard data={sslHealthCheck} name={'security_certificates'} />
      <RenderHealthCard data={lighthouseHealthCheck} name={'lighthouse'} />
      <RenderHealthCard data={domainHealthCheck} name={'domain_check'}/>
      <RenderHealthCard data={brokenLinksHealthCheck} name={'broken_links'}/>
      <RenderHealthCard data={mixedContentHealthCheck} name={'mixed_content'}/>

    </Box>
  );
};
