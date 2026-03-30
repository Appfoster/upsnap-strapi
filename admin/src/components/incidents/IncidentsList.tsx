import {
  Typography,
  TextInput,
  Button,
  SingleSelect,
  SingleSelectOption,
  Badge,
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  EmptyStateLayout,
  Pagination,
  PageLink,
  NextLink,
  PreviousLink,
  SimpleMenu,
  MenuItem,
  Alert,
  Link,
  IconButton,
  Dots
} from '@strapi/design-system';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getPrimaryMonitorId, request } from '../../utils/helpers';
import { Search, FileCsv, FilePdf, CaretUp, CaretDown } from '@strapi/icons';
import { formatCheckType } from '../../utils/helpers';
import {
  fetchIncidentsFromBackend,
  getSortField,
  getSortOrder,
  type FetchIncidentsParams,
} from '../../utils/incidents';
import { Monitor } from '../../utils/types';
import { fetchRegionsData } from '../../utils/helpers';
import { Region } from '../../utils/types';
import {
  DEFAULT_REGION,
  INCIDENT_CHECK_TYPE_KEYS,
  INCIDENTS_EXPORT_TYPES,
} from '../../utils/constants';
import { toast } from 'react-toastify';
import IncidentsFilter from './IncidentsFilter';
import LoadingCard from '../reachability/LoadingCard';

interface IncidentsListProps {
  defaultMonitorId?: string;
}

export default function IncidentsList({ defaultMonitorId }: IncidentsListProps) {
  const getBadgeColor = (statusCode: number | string | undefined) => {
    if (!statusCode) return { backgroundColor: 'neutral100', textColor: 'neutral600' };
    const code = typeof statusCode === 'string' ? parseInt(statusCode) : statusCode;
    if (code >= 200 && code < 300)
      return { backgroundColor: 'success100', textColor: 'success600' };
    if (code >= 300 && code < 400)
      return { backgroundColor: 'primary100', textColor: 'primary600' };
    if (code >= 400 && code < 500)
      return { backgroundColor: 'warning100', textColor: 'warning600' };
    if (code >= 500) return { backgroundColor: 'danger100', textColor: 'danger600' };
    return { backgroundColor: 'neutral100', textColor: 'neutral600' };
  };

  const getRegionName = (regionId: string): string => {
    const region = regions.find((item) => item?.id === regionId);
    return region?.name || regionId || 'N/A';
  };

  const [searchParams] = useSearchParams();
  const params = useParams();
  const timeRangeParam = searchParams.get('time_range') || '24h';
  const monitorIdFromQuery = searchParams.get('monitorId');
  const navigate = useNavigate();

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regionsData = await fetchRegionsData();
        const sortedRegions = regionsData.sort((a, b) => {
          if (a.id === DEFAULT_REGION.id) return -1;
          if (b.id === DEFAULT_REGION.id) return 1;
          return 0;
        });
        setRegions(sortedRegions);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    loadRegions();
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>('');
  const [incidentTypeFilters, setIncidentTypeFilters] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>('Occurred ↓');
  const [searchValue, setSearchValue] = useState<string>('');
  const [incidentsData, setIncidentsData] = useState<any>({
    incidents: [],
    total_count: 0,
    page: 1,
    page_size: 100,
    total_pages: 0,
    incidents_by_check: {},
  });
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [hasNoMonitors, setHasNoMonitors] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [regions, setRegions] = useState<Region[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPaginationClickRef = useRef<boolean>(false);

  const monitorIdFromParams =
    typeof params.monitorId === 'string' ? params.monitorId : params.monitorId?.[0];
  const effectiveMonitorId = selectedMonitorId || defaultMonitorId || monitorIdFromParams;

  const normalizedTimeRange = (() => {
    if (timeRangeParam === 'day' || timeRangeParam === '24h') return '24h';
    if (timeRangeParam === 'week') return '7D';
    if (timeRangeParam === 'month') return '1M';
    if (timeRangeParam === 'year') return '1Y';
    return timeRangeParam || '24h';
  })();

  useEffect(() => {
    (async () => {
      const fetchedMonitorId = await getPrimaryMonitorId();
      if (!fetchedMonitorId) {
        setHasNoMonitors(true);
        setIsLoading(false);

        setIncidentsData((prev: any) => ({
          ...prev,
          incidents: [
            {
              id: 1,
              check_type: 'uptime',
              region: 'us-east-1',
              error_message: 'Connection timed out after 30s',
              status_code: 503,
              timestamp: 1773935580, // Mar 19, 2026, 03:53 PM UTC
            },
            {
              id: 2,
              check_type: 'ssl',
              region: 'eu-west-1',
              error_message: 'certificate expires in 7 days',
              status_code: 200,
              timestamp: 1773931500, // Mar 19, 2026, 02:45 PM UTC
            },
            {
              id: 3,
              check_type: 'broken_links',
              region: 'ap-southeast-1',
              error_message: 'Not Found: /about/team',
              status_code: 404,
              timestamp: 1773929820, // Mar 19, 2026, 02:17 PM UTC
            },
            {
              id: 4,
              check_type: 'domain',
              region: 'eu-central-1',
              error_message: 'Domain expires in 14 days',
              status_code: 200,
              timestamp: 1773878400, // Mar 19, 2026, 12:00 AM UTC
            },
            {
              id: 5,
              check_type: 'mixed_content',
              region: 'us-east-1',
              error_message: 'Insecure HTTP resource loaded on HTTPS page',
              status_code: 200,
              timestamp: 1773853260, // Mar 18, 2026, 07:41 PM UTC
            },
          ],
          total_count: 5,
          page: 1,
          page_size: 20,
          total_pages: 1,
          incidents_by_check: {},
        }));
        return;
      }
      // setSelectedMonitorId(fetchedMonitorId);
      setHasNoMonitors(false);
      // setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!defaultMonitorId && !monitorIdFromParams) {
      fetchMonitors();
    } else {
      setSelectedMonitorId(defaultMonitorId || monitorIdFromParams || '');
    }
  }, [defaultMonitorId, monitorIdFromParams]);

  const fetchMonitors = async () => {
    try {
      const response = await request('/monitors', {
        method: 'GET',
      });

      const fetchedMonitors = response?.monitorsData?.data?.monitors || [];
      setMonitors(fetchedMonitors);

      if (fetchedMonitors.length === 0) {
        setHasNoMonitors(true);
        setSelectedMonitorId('');
        setIsLoading(false);
        return;
      }

      if (fetchedMonitors.length > 0) {
        if (monitorIdFromQuery && fetchedMonitors.some((m: any) => m.id === monitorIdFromQuery)) {
          setSelectedMonitorId(monitorIdFromQuery);
        } else {
          const firstMonitorId = fetchedMonitors[0].id;
          setSelectedMonitorId(firstMonitorId);
          if (!monitorIdFromParams) {
            navigate(`/plugins/upsnap/incidents?monitorId=${firstMonitorId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching monitors:', error);
    }
  };

  const fetchMonitor = async () => {
    try {
      if (!effectiveMonitorId) return;
      const result = await request(`/monitor/${effectiveMonitorId}`);
      if (result) {
        setMonitor(result.monitor?.data?.monitor);
      }
    } catch (error) {
      console.error('Error fetching monitor:', error);
    }
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('time_range', newTimeRange);

    if (monitorIdFromQuery) {
      currentParams.set('monitorId', monitorIdFromQuery);
    }

    navigate(`/plugins/upsnap/incidents?${currentParams.toString()}`);
  };

  const fetchIncidents = useCallback(
    async (page: number = 1, searchTerm?: string) => {
      if (!effectiveMonitorId) return;

      try {
        setIsLoading(true);

        let timeRange = timeRangeParam || '24h';
        if (timeRangeParam === 'day') timeRange = '24h';
        else if (timeRangeParam === 'week') timeRange = '7D';
        else if (timeRangeParam === 'month') timeRange = '1M';
        else if (timeRangeParam === 'year') timeRange = '1Y';

        const params: FetchIncidentsParams = {
          monitorId: effectiveMonitorId,
          timeRange,
          page,
          pageSize,
          checkType: incidentTypeFilters.length > 0 ? incidentTypeFilters.join(',') : undefined,
          region: regionFilter.length > 0 ? regionFilter.join(',') : undefined,
          search: searchTerm || undefined,
          sortBy: getSortField(sortOption),
          sortOrder: getSortOrder(sortOption),
        };

        const result = await fetchIncidentsFromBackend(params, 10000);

        if (result) {
          setIncidentsData(result);
          if (!isPaginationClickRef.current) {
            setCurrentPage(page);
          }
          isPaginationClickRef.current = false;
        } else {
          console.error('Failed to fetch incidents');
          toast.error('Failed to fetch incidents');
        }
      } catch (error) {
        console.error('Error fetching incidents:', error);
        toast.error('Error fetching incidents');
      } finally {
        setIsLoading(false);
      }
    },
    [effectiveMonitorId, timeRangeParam, incidentTypeFilters, regionFilter, sortOption, pageSize]
  );

  useEffect(() => {
    if (!effectiveMonitorId || hasNoMonitors) return;
    fetchMonitor();
  }, [effectiveMonitorId, hasNoMonitors]);

  useEffect(() => {
    if (!effectiveMonitorId || hasNoMonitors) return;

    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchIncidents(1, searchValue);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [
    effectiveMonitorId,
    timeRangeParam,
    incidentTypeFilters,
    regionFilter,
    sortOption,
    pageSize,
    searchValue,
    hasNoMonitors,
  ]);

  useEffect(() => {
    if (!effectiveMonitorId || hasNoMonitors) return;
    isPaginationClickRef.current = true;
    fetchIncidents(currentPage, searchValue);
  }, [currentPage, effectiveMonitorId, hasNoMonitors]);

  const handleMonitorChange = (newMonitorId: string) => {
    setSelectedMonitorId(newMonitorId);
    if (!monitorIdFromParams) {
      navigate(`/plugins/upsnap/incidents?monitorId=${newMonitorId}`);
    }
  };

  const handleExport = async (format: string = INCIDENTS_EXPORT_TYPES.csv) => {
    if (!effectiveMonitorId) return;
    try {
      const params: any = {};

      const now = Math.floor(Date.now() / 1000);
      let start: number;
      const end = now;

      const SECONDS_PER_DAY = 24 * 60 * 60;
      switch (normalizedTimeRange) {
        case '7D':
          start = now - 7 * SECONDS_PER_DAY;
          break;
        case '1M':
          start = now - 30 * SECONDS_PER_DAY;
          break;
        default:
          start = now - SECONDS_PER_DAY;
          break;
      }
      params.start_time = start.toString();
      params.end_time = end.toString();
      params.file_type = format;

      const type = incidentTypeFilters.length > 0 ? incidentTypeFilters.join(',') : '';
      if (type) {
        params.type = type;
      }

      if (regionFilter.length > 0) {
        params.region = regionFilter.join(',');
      }

      if (searchValue) {
        params.search = searchValue;
      }
      params.monitorId = effectiveMonitorId;
      const monitorName = monitor?.name ? monitor.name.replace(/[^a-zA-Z0-9_-]+/g, '_') : 'monitor';
      const startDate = new Date(start * 1000).toISOString().slice(0, 10);
      const fileName = `incidents_${monitorName}_${startDate}`;

      const url = '/monitor/incidents/export';
      const response = await request(url, { method: 'POST', data: params, responseType: 'blob' });

      const blob = response.data;
      const fileExtension = format === INCIDENTS_EXPORT_TYPES.pdf ? 'pdf' : 'csv';
      const successMessage =
        format === INCIDENTS_EXPORT_TYPES.pdf
          ? 'PDF exported successfully'
          : 'CSV exported successfully';

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.${fileExtension}`;
      link.click();

      URL.revokeObjectURL(link.href);

      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export incidents');
    }
  };

  const filterOptions = useMemo(() => {
    return INCIDENT_CHECK_TYPE_KEYS;
  }, []);

  function getPaginationItems(currentPage: number, totalPages: number) {
    const items: (number | 'dots')[] = [];

    if (totalPages <= 6) {
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) items.push(pageNumber);
      return items;
    }

    // Always show first two pages
    items.push(1, 2);

    // Show dots if currentPage is far from start
    if (currentPage > 4) items.push('dots');

    // Show currentPage-1, currentPage, currentPage+1 if in the middle
    for (let page = Math.max(3, currentPage - 1); page <= Math.min(totalPages - 2, currentPage + 1); page++) {
      if (page > 2 && page < totalPages - 1) items.push(page);
    }

    // Show dots if currentPage is far from end
    if (currentPage < totalPages - 3) items.push('dots');

    // Always show last two pages
    items.push(totalPages - 1, totalPages);

    // Remove duplicates and sort
    return Array.from(new Set(items.filter(i => typeof i === 'number' && i >= 1 && i <= totalPages || i === 'dots')));
  }

  const incidents = incidentsData?.incidents || [];
  const totalCount = incidentsData?.total_count || 0;
  const totalPages = incidentsData?.total_pages || 0;

  return (
    <>
      <Box marginBottom={4}>
        <Flex justifyContent="space-between" alignItems="start">
          <Flex direction="column" gap={2} justifyContent="start" alignItems="start">
            <Typography variant="beta">Incidents</Typography>
            <Typography variant="epsilon" textColor="neutral600">
              {monitor?.name ? (
                <>
                  Incidents for <strong>{monitor.name}</strong>
                </>
              ) : (
                'View incidents across a monitor'
              )}
            </Typography>
          </Flex>
          {monitors.length > 0 && (
            <Box width="300px">
              <SingleSelect
                aria-label="Select Monitor"
                value={selectedMonitorId}
                onChange={(val: any) => handleMonitorChange(val || '')}
              >
                {monitors.map((monitor) => (
                  <SingleSelectOption key={monitor.id} value={monitor.id}>
                    {monitor.name}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Box>
          )}
        </Flex>
      </Box>
      {hasNoMonitors && (
        <Flex direction="column" gap={4} paddingBottom={4} width="100%">
          <Alert
            closeLabel=""
            variant="warning"
            title="This is a demo preview of your incidents page."
            action={
              <Link href="#" onClick={(event: any) =>{
                event.preventDefault();
                navigate('/plugins/upsnap/settings');
              }}>
                Register
              </Link>
            }
            width="100%"
          >
            Register here to start monitoring your sites and see real incident data here.
          </Alert>
        </Flex>
      )}
      <Box
        background="neutral0"
        shadow="sm"
        hasRadius
        borderColor="neutral200"
        borderStyle="solid"
        borderWidth="1px"
      >
        <Box padding={4}>
          <Flex justifyContent="space-between" alignItems="start">
            <Flex gap={3}>
              <Box width="200px">
                <SingleSelect
                  aria-label="Select Time Frame"
                  value={normalizedTimeRange || '24h'}
                  onChange={(val: any) => val && handleTimeRangeChange(val)}
                  disabled={hasNoMonitors}
                >
                  <SingleSelectOption value="24h">Last 24 Hours</SingleSelectOption>
                  <SingleSelectOption value="7D">Last 7 Days</SingleSelectOption>
                  <SingleSelectOption value="1M">Last 30 Days</SingleSelectOption>
                </SingleSelect>
              </Box>
              <Box width="300px">
                <TextInput
                  value={searchValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchValue(e.target.value)
                  }
                  placeholder="Search by check type or message"
                  startAction={<Search />}
                  disabled={hasNoMonitors}
                />
              </Box>
            </Flex>
            <Flex gap={2}>
              <IncidentsFilter
                incidentTypeFilters={incidentTypeFilters}
                regionFilter={regionFilter}
                onIncidentTypeChange={setIncidentTypeFilters}
                onRegionChange={setRegionFilter}
                incidentTypeOptions={filterOptions}
                regions={regions}
                hasNoMonitors={hasNoMonitors}
              />
              <SimpleMenu label="Export" disabled={hasNoMonitors || totalCount === 0}>
                <MenuItem
                  startIcon={<FileCsv />}
                  onSelect={() => handleExport(INCIDENTS_EXPORT_TYPES.csv)}
                >
                  CSV
                </MenuItem>
                <MenuItem
                  startIcon={<FilePdf />}
                  onSelect={() => handleExport(INCIDENTS_EXPORT_TYPES.pdf)}
                >
                  PDF
                </MenuItem>
              </SimpleMenu>
            </Flex>
          </Flex>
        </Box>
        <Table colCount={5} rowCount={incidents.length || 5}>
          <Thead>
            <Tr>
              {['Check Type', 'Region', 'Message', 'Status Code', 'Occurred At'].map((header) => {
                const currentSort = sortOption?.includes(header) ? sortOption : null;
                const isDescending = currentSort?.includes('↓');
                return (
                  <Th
                    key={header}
                    action={
                      <IconButton
                        variant="ghost"
                        onClick={() => {
                          setSortOption(isDescending ? `${header} ↑` : `${header} ↓`);
                          setCurrentPage(1);
                        }}
                        label={`Sort by ${header} ${isDescending ? 'ascending' : 'descending'}`}
                      >
                        {isDescending ? <CaretDown /> : <CaretUp />}
                      </IconButton>
                    }
                  >
                    <Typography variant="sigma">{header}</Typography>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5}>
                  <LoadingCard />
                </Td>
              </Tr>
            ) : incidents.length === 0 ? (
              <Tr>
                <Td colSpan={5}>
                  <EmptyStateLayout content="No incidents found" />
                </Td>
              </Tr>
            ) : (
              incidents.map((incident: any) => (
                <Tr key={incident.id}>
                  <Td>
                    <Typography>{formatCheckType(incident.check_type)}</Typography>
                  </Td>
                  <Td>
                    <Typography>{getRegionName(incident.region)}</Typography>
                  </Td>
                  <Td>
                    <Typography>{incident.error_message || 'N/A'}</Typography>
                  </Td>
                  <Td>
                    {incident.status_code ? (
                      <Badge {...getBadgeColor(incident.status_code)}>{incident.status_code}</Badge>
                    ) : (
                      <Typography>N/A</Typography>
                    )}
                  </Td>
                  <Td>
                    <Typography>
                      {incident.timestamp && new Date(incident.timestamp * 1000).toLocaleString()}
                    </Typography>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
        {!hasNoMonitors && totalPages > 1 && (
          <Box padding={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex>
                <Typography variant="sigma">
                  Showing {Math.max(1, (currentPage - 1) * pageSize + 1)} to{' '}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                </Typography>
              </Flex>
              <Pagination activePage={currentPage} pageCount={totalPages}>
                <PreviousLink onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
                  Go to previous page
                </PreviousLink>
                {getPaginationItems(currentPage, totalPages).map((item, idx) =>
                  item === 'dots' ? (
                    <Dots key={`dots-${idx}`}>…</Dots>
                  ) : (
                    <PageLink
                      key={item}
                      number={item as number}
                      onClick={() => setCurrentPage(item as number)}
                    >
                      Go to page {item}
                    </PageLink>
                  )
                )}
                <NextLink onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
                  Go to next page
                </NextLink>
              </Pagination>
              <Flex gap={2} alignItems="center">
                <Box paddingLeft={2}>
                  <Typography variant="sigma">Rows per page</Typography>
                </Box>
                <Box width="100px">
                  <SingleSelect
                    aria-label="Rows per page"
                    value={String(pageSize)}
                    onChange={(value: any) => {
                      if (value) {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }
                    }}
                  >
                    <SingleSelectOption value="20">20</SingleSelectOption>
                    <SingleSelectOption value="50">50</SingleSelectOption>
                    <SingleSelectOption value="100">100</SingleSelectOption>
                    <SingleSelectOption value="200">200</SingleSelectOption>
                  </SingleSelect>
                </Box>
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>
    </>
  );
}
