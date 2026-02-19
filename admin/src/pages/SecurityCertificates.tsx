import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardBody,
  Grid,
  Typography,
  Divider,
  Button,
} from '@strapi/design-system';
import { Main } from '@strapi/design-system';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrimaryMonitorId, request } from '../utils/helpers';
import DetailRow from '../components/reachability/DetailRow';
import StatusCard from '../components/reachability/StatusCard';
import LoadingCard from '../components/reachability/LoadingCard';
import CertificateChainVisualization from '../components/security-certificates/CertificateChain';
import PageHeader from '../components/PageHeader'; // You may need to create or adapt this
import { MonitorData, Region, SSLCheckData } from '../utils/types';

export default function SecurityCertificates() {
  const [data, setData] = useState<SSLCheckData | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<MonitorData | null>(null);
  const navigate = useNavigate();
  const [monitorId, setMonitorId] = useState<string | null>();
  
  useEffect(() => {
    (async () => {
      const fetchedMonitorId = await getPrimaryMonitorId();
      if (!fetchedMonitorId) navigate('/plugins/upsnap/settings');
      setMonitorId(fetchedMonitorId);
    })();
  }, []);
  // Fetch monitor details
  useEffect(() => {
    setLoading(true);
    request(`/monitor/${monitorId}`, { method: 'GET' }).then((res) => {
      setSelectedMonitor(res.monitor?.data || null);
      setLoading(false);
    });
  }, [monitorId]);

  // Fetch security certificates data
  const getSecurityCertificatesData = async (url: string, forceFetch: boolean = false) => {
    try {
      setLoading(true);
      const res = await request('/monitor/health-check/ssl', {
        method: 'POST',
        data: { monitorUrl: url, force_fetch: forceFetch },
      });
      setData(res?.sslHealthCheckData || null);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      getSecurityCertificatesData(selectedMonitor.monitor.config.meta.url);
    }
  }, [selectedMonitor]);

  const handleRefresh = async () => {
    if (selectedMonitor?.monitor?.config?.meta?.url) {
      setRefreshing(true);
      await getSecurityCertificatesData(selectedMonitor.monitor.config.meta.url, true);
      setRefreshing(false);
    }
  };

  function getValidityColor(daysUntilExpiry: number) {
    if (daysUntilExpiry > 30) return { background: '#d1fae5', color: '#065f46' };
    if (daysUntilExpiry > 7) return { background: '#fef3c7', color: '#92400e' };
    return { background: '#fee2e2', color: '#991b1b' };
  }

  if (loading) return <LoadingCard />;
  if (!data) return null;

  const isSuccess = data.status === 'success';
  const meta = data?.data.result?.details?.ssl?.meta;
  const leafCertificate = meta?.chain?.find((c: any) => c.depth === 0)?.info;
  const certificateChain = meta?.chain || [];
  const domainCoverage = meta?.domainCoverage;
  const monitorUrl = selectedMonitor?.monitor?.config?.meta?.url;

  return (
    <Main>
      {/* Header with Refresh Button */}
      <Box padding={4}>
        <PageHeader
          title="Security Certificates"
          monitorUrl={monitorUrl}
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
          <Grid.Root
            gap={{
              large: 6,
              medium: 2,
              initial: 1,
            }}
            style={{
              alignItems: 'start',
              alignContent: 'space-around',
              justifyItems: 'stretch',
              marginTop: '10px',
            }}
          >
            <Grid.Item col={12} xs={12}>
              <Card style={{ width: '100%' }}>
                <CardBody display="flex" style={{ flexDirection: 'column' }}>
                  <CardContent style={{ width: '100%' }}>
                    <Typography variant="delta" fontWeight="bold">
                      Certificate Details
                    </Typography>
                    <Divider marginTop={3} marginBottom={4} />
                    <DetailRow
                      label="Issuer"
                      value={leafCertificate?.issuer?.commonName || 'N/A'}
                    />
                    <DetailRow
                      label="Not Before"
                      value={
                        leafCertificate?.notBefore
                          ? new Date(leafCertificate.notBefore).toLocaleString()
                          : 'N/A'
                      }
                    />
                    <DetailRow
                      label="Not After"
                      value={
                        leafCertificate?.notAfter
                          ? new Date(leafCertificate.notAfter).toLocaleString()
                          : 'N/A'
                      }
                    />
                    <DetailRow
                      label="Expiry in days"
                      value={
                        leafCertificate?.daysUntilExpiry !== undefined
                          ? `${leafCertificate.daysUntilExpiry} days`
                          : 'N/A'
                      }
                      isChip={true}
                    />
                    <DetailRow
                      label="Serial Number"
                      value={leafCertificate?.serialNumber || 'N/A'}
                    />
                    <DetailRow
                      label="Signature Algorithm"
                      value={leafCertificate?.signatureAlgorithm || 'N/A'}
                    />
                    <DetailRow
                      label="Public Key Algorithm"
                      value={leafCertificate?.publicKey?.algorithm || 'N/A'}
                    />

                    {/* Domain Coverage Section */}
                    {domainCoverage && (
                      <>
                        <Box marginTop={4}></Box>
                        <Typography variant="delta" fontWeight="bold">
                          Domain Coverage
                        </Typography>
                        <Divider marginTop={3} marginBottom={4} />
                        <DetailRow
                          label="Wildcard"
                          value={domainCoverage.wildcard ? 'Yes' : 'No'}
                        />
                        <DetailRow
                          label="Subject Alternative Names (SANs):"
                          value={domainCoverage.sans}
                        />
                      </>
                    )}

                    {/* Certificate Chain Visualization */}
                    {showMore && isSuccess && certificateChain.length > 0 && (
                      <Box marginTop={4}>
                        <CertificateChainVisualization chain={certificateChain} />
                      </Box>
                    )}

                    {/* Show more / less button */}
                    <Box marginTop={2}>
                      <Button
                        variant="secondary"
                        onClick={() => setShowMore(!showMore)}
                        style={{
                          cursor: 'pointer',
                        }}
                      >
                        {showMore ? 'Show less' : 'Show more'}
                      </Button>
                    </Box>
                  </CardContent>
                </CardBody>
              </Card>
            </Grid.Item>
          </Grid.Root>
        )}
      </Box>
    </Main>
  );
}
