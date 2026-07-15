import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Main,
  Box,
  Flex,
  Card,
  CardBody,
  CardContent,
  Typography,
  Badge,
  Divider,
  Link,
  Accordion,
  Button,
} from '@strapi/design-system';
import { ArrowLeft } from '@strapi/icons';
import { toast } from 'react-toastify';
import { request, formatCheckType, formatDateTime, fetchRegionsData } from '../../../utils/helpers';
import DetailRow from '../../../components/reachability/DetailRow';
import LoadingCard from '../../../components/reachability/LoadingCard';
import { Region } from '../../../utils/types';

interface ActivityLogEntry {
  date: string;
  reason: string;
  alertLogType?: string;
}

interface AiSummary {
  summary?: string;
  likely_causes?: string[];
  what_to_check?: string[];
}

interface MonitoredFrom {
  location?: string;
  ip?: string;
  org?: string;
  timezone?: string;
}

interface IncidentMeta {
  durationMs?: number;
  finalURL?: string;
  monitoredFrom?: MonitoredFrom;
  resolvedIPs?: string[];
}

interface IncidentDetailData {
  id: number | string;
  monitor_id: string;
  monitor_name: string;
  check_type: string;
  region: string;
  status: string;
  status_code: number | null;
  error_message: string;
  severity?: string;
  timestamp: number;
  checks_failed_count?: number;
  notifications_sent_count?: number;
  meta?: IncidentMeta;
  activity_log?: ActivityLogEntry[];
  suggested_actions?: string[];
  ai_summary?: AiSummary | string;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
}

export default function IncidentDetail() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const [searchParams] = useSearchParams();
  const monitorId = searchParams.get('monitorId');
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentDetailData | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRegionsData().then(setRegions);
  }, []);

  useEffect(() => {
    if (!incidentId || !monitorId) {
      setError('Missing incident or monitor reference.');
      setLoading(false);
      return;
    }
    request(`/monitor/incidents/${incidentId}?monitorId=${monitorId}`, { method: 'GET' })
      .then((res) => {
        if (res?.incidentData?.status === 'success' && res?.incidentData?.data) {
          setIncident(res.incidentData.data);
        } else {
          setError('Failed to load incident.');
        }
      })
      .catch(() => setError('Failed to load incident.'))
      .finally(() => setLoading(false));
  }, [incidentId, monitorId]);

  const getRegionName = (regionId: string) =>
    regions.find((r) => r.id === regionId)?.name || regionId || 'N/A';

  const handleBack = () => {
    navigate(
      monitorId ? `/plugins/upsnap/incidents?monitorId=${monitorId}` : '/plugins/upsnap/incidents'
    );
  };

  if (loading) return <LoadingCard />;

  if (error || !incident) {
    return (
      <Main>
        <Box padding={4}>
          <Typography>{error || 'Incident not found.'}</Typography>
        </Box>
      </Main>
    );
  }

  const isResolved = incident.status === 'resolved';
  const aiSummary: AiSummary | null =
    typeof incident.ai_summary === 'string'
      ? { summary: incident.ai_summary }
      : incident.ai_summary || null;

  return (
    <Main>
      <Box padding={4}>
        <Link onClick={handleBack} isExternal={false}>
          <Flex alignItems="center" gap={2} marginBottom={4}>
            <ArrowLeft />
            Incidents
          </Flex>
        </Link>

        <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
          <Flex direction="column" gap={1} alignItems="flex-start">
            <Typography variant="beta">{formatCheckType(incident.check_type)} Incident</Typography>
            <Typography variant="pi" textColor="neutral600">
              {incident.monitor_name}
            </Typography>
          </Flex>
          <Badge
            size="M"
            backgroundColor={isResolved ? 'success100' : 'danger100'}
            textColor={isResolved ? 'success700' : 'danger700'}
          >
            {isResolved ? 'Resolved' : 'Ongoing'}
          </Badge>
        </Flex>

        <Flex
          gap={4}
          direction={{ initial: 'column', large: 'row' }}
          alignItems="start"
          width="100%"
        >
          <Box width="100%" style={{ flex: 7 }}>
            <Card marginBottom={4}>
              <CardBody>
                <CardContent width="100%">
                  <Typography variant="delta" fontWeight="bold">
                    Overview
                  </Typography>
                  <Divider marginTop={3} marginBottom={2} />
                  <DetailRow label="Check Type" value={formatCheckType(incident.check_type)} />
                  <DetailRow label="Region" value={getRegionName(incident.region)} />
                  <DetailRow label="Message" value={incident.error_message || 'N/A'} />
                  <DetailRow label="Status Code" value={incident.status_code ?? '—'} isChip />
                  <DetailRow label="Severity" value={incident.severity || 'N/A'} isChip />
                  <DetailRow label="Occurred At" value={formatDateTime(new Date(incident.timestamp * 1000).toISOString())} />
                  <DetailRow label="Checks Failed" value={incident.checks_failed_count ?? '—'} />
                  <DetailRow label="Notifications Sent" value={incident.notifications_sent_count ?? '—'} />
                </CardContent>
              </CardBody>
            </Card>

            {incident.suggested_actions && incident.suggested_actions.length > 0 && (
              <Card marginBottom={4}>
                <CardBody>
                  <CardContent width="100%">
                    <Typography variant="delta" fontWeight="bold">
                      Suggested Actions
                    </Typography>
                    <Divider marginTop={3} marginBottom={3} />
                    <Box tag="ol" style={{ paddingLeft: 20 }}>
                      {incident.suggested_actions.map((action, idx) => (
                        <li key={idx}>
                          <Typography variant="omega">{action}</Typography>
                        </li>
                      ))}
                    </Box>
                  </CardContent>
                </CardBody>
              </Card>
            )}

            {aiSummary && (
              <Card marginBottom={4}>
                <CardBody>
                  <CardContent width="100%">
                    <Typography variant="delta" fontWeight="bold">
                      AI Summary
                    </Typography>
                    <Divider marginTop={3} marginBottom={3} />
                    {aiSummary.summary && (
                      <Typography variant="omega" style={{ display: 'block' }}>
                        {aiSummary.summary}
                      </Typography>
                    )}
                    {aiSummary.likely_causes && aiSummary.likely_causes.length > 0 && (
                      <Box marginTop={4}>
                        <Typography variant="delta" fontWeight="bold">
                          Likely Causes
                        </Typography>
                        <Box tag="ul" style={{ paddingLeft: 20 }}>
                          {aiSummary.likely_causes.map((cause, idx) => (
                            <li key={idx}>
                              <Typography variant="omega">{cause}</Typography>
                            </li>
                          ))}
                        </Box>
                      </Box>
                    )}
                    {aiSummary.what_to_check && aiSummary.what_to_check.length > 0 && (
                      <Box marginTop={4}>
                        <Typography variant="delta" fontWeight="bold">
                          What To Check
                        </Typography>
                        <Box tag="ul" style={{ paddingLeft: 20 }}>
                          {aiSummary.what_to_check.map((item, idx) => (
                            <li key={idx}>
                              <Typography variant="omega">{item}</Typography>
                            </li>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </CardBody>
              </Card>
            )}

            {(incident.meta?.finalURL || incident.meta?.monitoredFrom) && (
              <Card marginBottom={4}>
                <CardBody>
                  <CardContent width="100%">
                    <Accordion.Root>
                      <Accordion.Item value="http-headers">
                        <Accordion.Header>
                          <Accordion.Trigger
                            caretPosition="right"
                            description="Request details captured during this check"
                          >
                            HTTP Headers & Request Info
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content>
                          <Box padding={4}>
                            <Flex justifyContent="space-between" alignItems="center" marginBottom={2}>
                              <Typography variant="sigma">HTTP Headers</Typography>
                              <Button
                                variant="tertiary"
                                size="S"
                                onClick={() =>
                                  copyToClipboard(
                                    `Status Code : ${incident.status_code ?? 'N/A'}\nFinal URL : ${incident.meta?.finalURL ?? 'N/A'}\nDuration (ms) : ${incident.meta?.durationMs ?? 'N/A'}`
                                  )
                                }
                              >
                                Copy
                              </Button>
                            </Flex>
                            <Box background="neutral800" padding={4} hasRadius>
                              <Typography
                                textColor="neutral0"
                                style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                              >
                                {`Status Code : ${incident.status_code ?? 'N/A'}\nFinal URL : ${incident.meta?.finalURL ?? 'N/A'}\nDuration (ms) : ${incident.meta?.durationMs ?? 'N/A'}`}
                              </Typography>
                            </Box>

                            {incident.meta?.monitoredFrom && (
                              <>
                                <Flex
                                  justifyContent="space-between"
                                  alignItems="center"
                                  marginTop={4}
                                  marginBottom={2}
                                >
                                  <Typography variant="sigma">Request Info</Typography>
                                  <Button
                                    variant="tertiary"
                                    size="S"
                                    onClick={() =>
                                      copyToClipboard(
                                        `Monitored From : ${incident.meta?.monitoredFrom?.location ?? 'N/A'}\nIP Address : ${incident.meta?.monitoredFrom?.ip ?? 'N/A'}\nISP : ${incident.meta?.monitoredFrom?.org ?? 'N/A'}\nTimezone : ${incident.meta?.monitoredFrom?.timezone ?? 'N/A'}\nResolved IPs : ${(incident.meta?.resolvedIPs || []).join(', ') || 'N/A'}`
                                      )
                                    }
                                  >
                                    Copy
                                  </Button>
                                </Flex>
                                <Box background="neutral800" padding={4} hasRadius>
                                  <Typography
                                    textColor="neutral0"
                                    style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                                  >
                                    {`Monitored From : ${incident.meta.monitoredFrom.location ?? 'N/A'}\nIP Address : ${incident.meta.monitoredFrom.ip ?? 'N/A'}\nISP : ${incident.meta.monitoredFrom.org ?? 'N/A'}\nTimezone : ${incident.meta.monitoredFrom.timezone ?? 'N/A'}\nResolved IPs : ${(incident.meta.resolvedIPs || []).join(', ') || 'N/A'}`}
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>
                  </CardContent>
                </CardBody>
              </Card>
            )}
          </Box>

          <Box width="100%" style={{ flex: 3 }}>
            <Card>
              <CardBody>
                <CardContent width="100%">
                  <Typography variant="delta" fontWeight="bold">
                    Timeline
                  </Typography>
                  <Divider marginTop={3} marginBottom={3} />
                  {incident.activity_log && incident.activity_log.length > 0 ? (
                    <Flex direction="column" gap={4} alignItems="flex-start">
                      {incident.activity_log.map((event, idx) => (
                        <Flex key={idx} gap={2} alignItems="start">
                          <Box paddingTop={1}>
                            <Badge
                              size="S"
                              backgroundColor={
                                event.alertLogType === 'Down' ? 'danger100' : 'success100'
                              }
                              textColor={
                                event.alertLogType === 'Down' ? 'danger700' : 'success700'
                              }
                            >
                              {' '}
                            </Badge>
                          </Box>
                          <Flex direction="column" alignItems="flex-start" gap={0}>
                            <Typography variant="omega" fontWeight="semiBold">
                              {event.reason}
                            </Typography>
                            <Typography variant="pi" textColor="neutral600">
                              {formatDateTime(event.date)}
                            </Typography>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    <Typography variant="pi" textColor="neutral600">
                      No timeline events.
                    </Typography>
                  )}
                </CardContent>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Box>
    </Main>
  );
}
