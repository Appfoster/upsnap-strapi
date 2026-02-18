import React, { useState, useMemo } from 'react';
import {
  Card,
  CardBody,
  Flex,
  Typography,
  CardContent,
  Box,
  SingleSelect,
  SingleSelectOption,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Link,
} from '@strapi/design-system';

interface BrokenLink {
  classification: string;
  culprit: string;
  external: boolean;
  href: string;
  info: string;
  name: string;
  page: string;
  ref_url: string;
  resolved: boolean;
  result: string;
  rid: string | null;
  title: string;
  url: string;
}

interface BrokenLinksTableProps {
  brokenLinks: BrokenLink[];
  blockedLinks?: any[];
}

export default function BrokenLinksTable({
  brokenLinks,
  blockedLinks = [],
}: BrokenLinksTableProps) {
  const MAX_MESSAGE_LENGTH = 15;
  const [linkTypeFilter, setLinkTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Flatten the data structure
  const flattenedData = useMemo(() => {
    if (!brokenLinks) return [];
    // Each element has an 'items' array, so flatten all items into one array
    return brokenLinks.flatMap((entry: any) => entry.items || []);
  }, [brokenLinks]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = flattenedData;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((link) =>
        link.result?.toLowerCase().includes(statusFilter.toLowerCase())
      );
    }

    if (linkTypeFilter !== 'all') {
      if (linkTypeFilter === 'external') {
        filtered = filtered.filter((link) => link.external === true);
      } else if (linkTypeFilter === 'internal') {
        filtered = filtered.filter((link) => link.external === false);
      }
    }

    return filtered;
  }, [flattenedData, statusFilter, linkTypeFilter]);

  const formatIssueMessage = (row: BrokenLink) => {
    let message = row?.culprit || row.title || 'No issue details';
    console.log('Formatting issue message: ', message);
    if (message.length > MAX_MESSAGE_LENGTH) {
      return message.slice(0, MAX_MESSAGE_LENGTH) + '...';
    }
    return message;
  };

  if (!brokenLinks || brokenLinks.length === 0) {
    return (
      <Card>
        <CardBody>
          <Typography>No broken links found</Typography>
        </CardBody>
      </Card>
    );
  }

  return (
    <Box>
      <Flex alignItems="center" gap={2} marginBottom={4}>
        <Typography variant="delta" fontWeight="bold">
          Broken Links Details{' '}
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          ({filteredData.length} broken link
          {filteredData.length !== 1 ? 's' : ''} found)
        </Typography>
      </Flex>
      <Card>
        {/* Filters */}
        <CardContent>
          <Box padding={4} display="flex" gap={4}>
            <Flex gap={4} alignItems={{initial: "start", medium: "center"}} direction={{initial: "column", medium: "row"}}>
              <SingleSelect
                label="Select Status"
                value={statusFilter}
                onChange={(val: string) => setStatusFilter(val || 'all')}
                style={{ minWidth: 150 }}
              >
                <SingleSelectOption value="all">All Status</SingleSelectOption>
                <SingleSelectOption value="404">404 Not Found</SingleSelectOption>
                <SingleSelectOption value="500">500 Server Error</SingleSelectOption>
                <SingleSelectOption value="timeout">Timeout</SingleSelectOption>
              </SingleSelect>
              <SingleSelect
                label="Select Link Type"
                value={linkTypeFilter}
                onChange={(val: string) => setLinkTypeFilter(val || 'all')}
                style={{ minWidth: 150 }}
              >
                <SingleSelectOption value="all">All</SingleSelectOption>
                <SingleSelectOption value="internal">Internal</SingleSelectOption>
                <SingleSelectOption value="external">External</SingleSelectOption>
              </SingleSelect>
            </Flex>
          </Box>
          <Box style={{ overflowX: 'auto' }}>
            <Table colCount={6} rowCount={filteredData.length}>
              <Thead>
                <Tr>
                  <Th variant="sigma">
                    <Typography variant="sigma">Broken URL</Typography>
                  </Th>
                  <Th variant="sigma">
                    <Typography variant="sigma">Found On Page</Typography>
                  </Th>
                  <Th variant="sigma">
                    <Typography variant="sigma">Status</Typography>
                  </Th>
                  <Th variant="sigma">
                    <Typography variant="sigma">Classification</Typography>
                  </Th>
                  <Th variant="sigma">
                    <Typography variant="sigma">Link Type</Typography>
                  </Th>
                  <Th variant="sigma">
                    <Typography variant="sigma">Issue</Typography>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.length ? (
                  filteredData.map((row, idx) => (
                    <Tr key={idx}>
                      <Td>
                        {row.url?.length > MAX_MESSAGE_LENGTH ? (
                          <Tooltip description={row.url}>
                            <Link
                              href={row.url}
                              isExternal
                              rel="noopener noreferrer"
                              style={{ wordBreak: 'break-all' }}
                            >
                              {row.url.slice(0, 21) + '...'}
                            </Link>
                          </Tooltip>
                        ) : (
                          <Link
                            href={row.url}
                            isExternal
                            rel="noopener noreferrer"
                            style={{ wordBreak: 'break-all' }}
                          >
                            {row.url}
                          </Link>
                        )}
                      </Td>
                      <Td>
                        <Link
                          href={row.page}
                          isExternal
                          rel="noopener noreferrer"
                          style={{ wordBreak: 'break-all', fontSize: '10px' }}
                        >
                          <Typography variant={'pi'}>{row.page}</Typography>
                        </Link>
                      </Td>
                      <Td>
                        <Badge backgroundColor="danger100" textColor="danger700">
                          {row.result}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          backgroundColor={
                            row.classification === 'major'
                              ? 'danger100'
                              : row.classification === 'minor'
                                ? 'warning100'
                                : 'primary100'
                          }
                          textColor={
                            row.classification === 'major'
                              ? 'danger700'
                              : row.classification === 'minor'
                                ? 'warning700'
                                : 'primary700'
                          }
                        >
                          {row.classification}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          backgroundColor={row.external ? 'primary100' : 'success100'}
                          textColor={row.external ? 'primary700' : 'success700'}
                        >
                          {row.external ? 'External' : 'Internal'}
                        </Badge>
                      </Td>
                      <Td>
                        {' '}
                        <Tooltip description={row?.culprit || row.title}>
                          <Typography variant={'omega'}>{formatIssueMessage(row)}</Typography>
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6}>
                      <Flex padding={5} justifyContent="center" alignItems="center">
                        <Typography>No broken links found</Typography>
                      </Flex>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
