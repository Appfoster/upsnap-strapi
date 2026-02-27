import {
  Box,
  Card,
  Link,
  CardBody,
  CardContent,
  CardTitle,
  CardSubtitle,
  CardHeader,
  Flex,
  Loader,
} from '@strapi/design-system';
import { formatDate, formatTitleToUppercase, request } from '../../utils/helpers';
import {
  BrokenLinksCheckData,
  DomainCheckData,
  LighthouseCheckData,
  MixedContentData,
  MonitorData,
  SSLCheckData,
  UptimeHealthCheckData,
} from '../../utils/types';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowsCounterClockwise, CrossCircle, SealCheck } from '@strapi/icons';
import { Typography } from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';

interface Props {
  monitorData: MonitorData | null;
  isLoading: boolean;
}

export const HealthCards = ({ monitorData, isLoading }: Props) => {
  const [uptimeHealthCheck, setUptimeHealthCheck] = useState<UptimeHealthCheckData | null>(null);
  const [sslHealthCheck, setSslHealthCheck] = useState<SSLCheckData | null>(null);
  const [lighthouseHealthCheck, setLighthouseHealthCheck] = useState<LighthouseCheckData | null>(
    null
  );
  const [domainHealthCheck, setDomainHealthCheck] = useState<DomainCheckData | null>(null);
  const [brokenLinksHealthCheck, setBrokenLinksHealthCheck] = useState<BrokenLinksCheckData | null>(
    null
  );
  const [mixedContentHealthCheck, setMixedContentHealthCheck] = useState<MixedContentData | null>(
    null
  );
  const [loading, setLoading] = useState<string>('');
  const navigate = useNavigate();
  useEffect(() => {
    const monitorUrl = monitorData?.monitor?.config?.meta?.url;
    if (!monitorUrl) return;
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

  const handleCheckNow = async (type: string) => {
    setLoading(type);
    const monitorUrl = monitorData?.monitor?.config?.meta?.url;
    switch (type) {
      case 'reachability':
        request('/monitor/health-check/uptime', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setUptimeHealthCheck(res.uptimeHealthCheckData || null);
          setLoading('');
        });
        break;
      case 'broken_links':
        request('/monitor/health-check/broken-links', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setBrokenLinksHealthCheck(res.brokenLinksHealthCheckData || null);
          setLoading('');
        });
        break;
      case 'security_certificates':
        request('/monitor/health-check/ssl', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setSslHealthCheck(res.sslHealthCheckData || null);
          setLoading('');
        });
        break;
      case 'domain_check':
        request('/monitor/health-check/domain', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setDomainHealthCheck(res.domainHealthCheckData || null);
          setLoading('');
        });
        break;
      case 'lighthouse':
        request('/monitor/health-check/lighthouse', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setLighthouseHealthCheck(res.lighthouseHealthCheckData || null);
          setLoading('');
        });
        break;
      case 'mixed_content':
        request('/monitor/health-check/mixed-content', {
          method: 'POST',
          data: { monitorUrl },
        }).then((res) => {
          setMixedContentHealthCheck(res.mixedContentHealthCheckData || null);
          setLoading('');
        });
        break;
    }
  };
  const handleView = async (type: string) => {
    switch (type) {
      case 'reachability':
        navigate('/plugins/upsnap/reachability');
        break;
      case 'broken_links':
        navigate('/plugins/upsnap/broken-links');
        break;
      case 'security_certificates':
        navigate('/plugins/upsnap/security-certificates');
        break;
      case 'domain_check':
        navigate('/plugins/upsnap/domain-check');
        break;
      case 'lighthouse':
        navigate('/plugins/upsnap/lighthouse');
        break;
      case 'mixed_content':
        navigate('/plugins/upsnap/mixed-content');
        break;
    }
  };
  const RenderHealthCard = ({ data, name }: any) => (
    <Card>
      <CardBody>
        <CardContent paddingLeft={1} width="100%">
          {loading === name ? (
            <Loader small></Loader>
          ) : (
            <>
              <CardHeader fontSize={3}>{formatTitleToUppercase(name)}</CardHeader>
              {data &&
                (data?.status === 'error' || data?.status === 'warning' ? (
                  <CardTitle marginTop={3} fontSize={3}>
                    <Flex direction="row" alignItems="center" gap={1}>
                      <Box width={'20px'}>
                        <CrossCircle
                          color={'danger700'}
                          style={{ color: 'rgb(238, 94, 82)' }}
                        />{' '}
                      </Box>
                      <Typography style={{ wordBreak: 'break-word' }}>
                        {' '}
                        {data?.error || data?.message}
                      </Typography>
                    </Flex>
                  </CardTitle>
                ) : (
                  <CardTitle marginTop={3} fontSize={3}>
                    <Flex direction="row" alignItems="center" gap={1}>
                      <Box width={'20px'}>
                        <SealCheck color="success700" style={{ color: '#10b981' }} />{' '}
                      </Box>
                      <Typography>{data?.message}</Typography>
                    </Flex>
                  </CardTitle>
                ))}
              <CardSubtitle marginTop={1} fontSize={3}>
                <Typography>Last checked at: </Typography> {formatDate(data?.data?.checkedAt)}
                <Flex marginTop={2} justifyContent="space-between">
                  <Link
                    onClick={(e: any) => {
                      e.preventDefault();
                      handleCheckNow(name);
                    }}
                  >
                    <Flex alignItems="center" gap="3px" cursor="pointer">
                      <ArrowsCounterClockwise /> <Typography> Check Now </Typography>
                    </Flex>
                  </Link>
                  <Link
                    onClick={(e: any) => {
                      e.preventDefault();
                      handleView(name);
                    }}
                  >
                    <Flex alignItems={'flex-end'} gap={'3px'} cursor="pointer">
                      <Typography>View Details</Typography>
                      <ArrowRight />
                    </Flex>
                  </Link>
                </Flex>
              </CardSubtitle>
            </>
          )}
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
      <RenderHealthCard data={domainHealthCheck} name={'domain_check'} />
      <RenderHealthCard data={brokenLinksHealthCheck} name={'broken_links'} />
      <RenderHealthCard data={mixedContentHealthCheck} name={'mixed_content'} />
    </Box>
  );
};
