import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Button,
  Grid,
  Main,
} from '@strapi/design-system';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, request, getPrimaryMonitorId } from '../utils/helpers';
import DetailRow from '../components/reachability/DetailRow';
import StatusCard from '../components/reachability/StatusCard';
import LoadingCard from '../components/reachability/LoadingCard';
import PageHeader from '../components/PageHeader';
import { MonitorData, DomainCheckData } from '../utils/types';

export default function DomainCheck() {
  const [data, setData] = useState<DomainCheckData | null>(null);
  const [showMore, setShowMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);
  const [monitorId, setMonitorId] = useState<string | null>();
  const navigate = useNavigate();
  
  useEffect(() => {
    (async () => {
      const fetchedMonitorId = await getPrimaryMonitorId();
      if (!fetchedMonitorId) navigate('/plugins/upsnap/settings');
      setMonitorId(fetchedMonitorId);
    })();
  }, []);
  const getDomainCheckData = async (url: string, forceFetch: boolean = false) => {
    try {
      setLoading(true);
      const res = await request('/monitor/health-check/domain', {
        method: 'POST',
        data: { monitorUrl: url, force_fetch: forceFetch },
      });

      setData(res?.domainHealthCheckData || null);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getValidityColor = (days: number) => {
    if (days > 30) return 'green';
    if (days > 7) return 'yellow';
    return 'red';
  };

  // Fetch monitor details
  useEffect(() => {
    setLoading(true);
    request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
      setSelectedMonitor(res.monitor?.data || null);
      setLoading(false);
    });
  }, [monitorId]);

  useEffect(() => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      getDomainCheckData(selectedMonitor.monitor.config.meta.url);
    }
  }, [selectedMonitor]);

  const handleRefresh = async () => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      setRefreshing(true);
      await getDomainCheckData(selectedMonitor?.monitor?.config?.meta?.url, true);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingCard />;
  if (!data) return null;

  const isSuccess = data?.status === "success";
  const meta = data?.data?.result?.details?.domain?.meta;
  const durationSec = data ? (data?.data?.result?.durationMs / 1000).toFixed(2) : 'N/A';

  return (
    <Main>
      {/* Header with Refresh Button */}
      <PageHeader
        title="Domain Check"
        monitorUrl={selectedMonitor?.monitor?.config?.meta?.url}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
      {/* Status summary card */}
      <StatusCard
        status={data.status}
        message={data.message}
        error={data.error}
        cardData={data.data}
      />

      {/* Details Card */}
      {isSuccess && meta && (
        <Card style={{ width: '950px' }}>
          <CardBody display="flex" style={{ flexDirection: 'column' }}>
            <CardContent style={{ width: '850px' }}>
              <Typography variant="delta" fontWeight="bold">
                General Info
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              <DetailRow label="CNAME" value={meta.cname} />
              <DetailRow label="Host" value={meta.host} />
              <DetailRow label="Supported" value={meta.supported ? 'Yes' : 'No'} />
              <Box marginTop={5}></Box>
              {/* --- DNS Records --- */}
              <Typography variant="delta" fontWeight="bold">
                DNS Records
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              <DetailRow label="IPv4" value={meta.ipv4 ? meta.ipv4 : '–'} />
              <DetailRow
                label="IPv6"
                value={meta.ipv6 && meta.ipv6.length > 0 ? meta.ipv6 : '–'}
              />
              <DetailRow label="MX Records" value={meta.mxCount ?? '–'} />
              <DetailRow label="NS Records" value={meta.nsCount ?? '–'} />
              <DetailRow label="TXT Records" value={meta.txtCount ?? '–'} />
              <Box marginTop={5}></Box>
              {/* --- Domain Lifecycle --- */}
              <Typography variant="delta" fontWeight="bold">
                Domain Lifecycle
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              <DetailRow label="Registered On" value={formatDate(meta.domainRegistered)} />
              <DetailRow label="Expiration Date" value={formatDate(meta.domainExpirationDate)} />
              <DetailRow label="Days Until Expiration" value={meta.domainDays ?? '–'} />
              <DetailRow label="Expired" value={meta.expired ? 'Yes' : 'No'} />
              <DetailRow label="Expiring Soon" value={meta.expiringSoon ? 'Yes' : 'No'} />
              <DetailRow label="Last Changed" value={formatDate(meta.lastChanged)} />
              <DetailRow
                label="Last Updated in RDAP DB"
                value={formatDate(meta.lastUpdatedInRDAP)}
              />
              <Box marginTop={5}></Box>
              {/* --- Domain Status Codes --- */}
              <Typography variant="delta" fontWeight="bold">
                Domain Status Codes
              </Typography>
              <Divider marginTop={3} marginBottom={4} />
              {Array.isArray(meta.domainStatusCodes) && meta.domainStatusCodes.length > 0 ? (
                <Box>
                  {meta.domainStatusCodes.map((item: any, idx: number) => (
                    <DetailRow key={idx} label={item.eppStatusCode} value={item.status} />
                  ))}
                </Box>
              ) : (
                <DetailRow label="Status Codes" value="–" />
              )}
            </CardContent>
          </CardBody>
        </Card>
      )}
    </Main>
  );
}
