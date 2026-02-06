import React from 'react';
import { Card, CardBody, Typography, Box, Flex, Divider, Badge } from '@strapi/design-system';
import { CheckCircle, ArrowDown } from '@strapi/icons';
import { CardContent } from '@strapi/design-system';

interface CertificateInfo {
  daysUntilExpiry: number;
  extensions: any;
  isExpired: boolean;
  issuer: {
    commonName: string;
    countryName?: string;
    organizationName?: string;
  };
  notAfter: string;
  notBefore: string;
  publicKey: {
    algorithm: string;
    curve?: string;
  };
  serialNumber: string;
  signatureAlgorithm: string;
  subject: {
    commonName: string;
    countryName?: string;
    organizationName?: string;
  };
}

interface ChainItem {
  depth: number;
  info: CertificateInfo;
  type: 'leaf' | 'intermediate' | 'root';
}

interface CertificateChainProps {
  chain: ChainItem[];
}

export default function CertificateChain({ chain }: CertificateChainProps) {
  const getCertificateTypeLabel = (type: string) => {
    if (type === 'leaf') return 'End Entity Certificate';
    if (type === 'intermediate') return 'Intermediate Certificate';
    return 'Root Certificate';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  function getValidityColor(daysUntilExpiry: number) {
    if (daysUntilExpiry > 30) return { background: '#d1fae5', color: '#065f46' };
    if (daysUntilExpiry > 7) return { background: '#fef3c7', color: '#92400e' };
    return { background: '#fee2e2', color: '#991b1b' };
  }

  if (!chain || chain.length === 0) {
    return null;
  }

  return (
    <Box padding={4}>
      <Typography variant="delta" fontWeight="bold" marginBottom={4}>
        Certificate Chain
      </Typography>

      {chain.map((cert, index) => (
        <div key={index}>
          <Card width={{ initial: '100%', medium: '842px' }} marginTop={2}>
            <CardBody>
              <CardContent width={{ initial: '100%', medium: '842px' }}>
                <Flex
                  gap={{ initial: 1, medium: 1, large: 2 }}
                  direction={{ initial: 'column', medium: 'column' }}
                  alignItems={{ initial: 'center', medium: 'flex-start' }}
                >
                  <Flex
                    direction={{ initial: 'column', medium: 'row' }}
                    alignItems={{ initial: 'center', medium: 'flex-start' }}
                    justifyContent="space-between"
                    width="100%"
                  >
                    {/* Header Section */}
                    <Flex
                      gap={{ initial: 1, medium: 1, large: 2 }}
                      direction={{ initial: 'column', medium: 'column' }}
                      alignItems={{ initial: 'center', medium: 'flex-start' }}
                      justifyContent="space-between"
                      marginBottom={4}
                    >
                      <Flex gap={2}>
                        <Typography variant="beta" fontWeight="bold">
                          {cert.info.subject.commonName}
                        </Typography>
                        <CheckCircle color="#22c55e" width="24" height="24" />
                      </Flex>
                      <Flex gap={2}>
                        <Typography variant="pi" textColor="neutral600">
                          {getCertificateTypeLabel(cert.type)}
                        </Typography>
                      </Flex>
                    </Flex>
                    <Box marginBottom={4}>
                      <Badge>{`Valid for ${cert.info.daysUntilExpiry} days`}</Badge>
                    </Box>
                  </Flex>
                  {/* Certificate Details Grid */}
                  <Flex gap={8} wrap="wrap" alignItems="flex-start" justifyContent="space-between">
                    {/* Left Column */}
                    <Box style={{ minWidth: 250 }}>
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Signature Algorithm
                        </Typography>
                        <Typography variant="pi" fontWeight="bold">
                          {cert.info.signatureAlgorithm}
                        </Typography>
                      </Flex>
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Not Before
                        </Typography>
                        <Typography variant="pi" fontWeight="bold">
                          {formatDate(cert.info.notBefore)}
                        </Typography>
                      </Flex>
                      {cert.info.issuer.organizationName && (
                        <Flex marginBottom={2} gap={2}>
                          <Typography variant="sigma" textColor="neutral500">
                            Organization
                          </Typography>
                          <Typography variant="pi" fontWeight="bold">
                            {cert.info.issuer.organizationName}
                          </Typography>
                        </Flex>
                      )}
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Serial Number
                        </Typography>
                        <Typography
                          variant="pi"
                          fontWeight="bold"
                          style={{ wordBreak: 'break-all' }}
                        >
                          {cert.info.serialNumber}
                        </Typography>
                      </Flex>
                    </Box>
                    {/* Right Column */}
                    <Box style={{ minWidth: 250 }}>
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Key Algorithm
                        </Typography>
                        <Typography variant="pi" fontWeight="bold">
                          {cert.info.publicKey.algorithm}
                          {cert.info.publicKey.curve && ` (${cert.info.publicKey.curve})`}
                        </Typography>
                      </Flex>
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Not After
                        </Typography>
                        <Typography variant="pi" fontWeight="bold">
                          {formatDate(cert.info.notAfter)}
                        </Typography>
                      </Flex>
                      <Flex marginBottom={2} gap={2}>
                        <Typography variant="sigma" textColor="neutral500">
                          Issued By
                        </Typography>
                        <Typography variant="pi" fontWeight="bold">
                          {cert.info.issuer.commonName}
                        </Typography>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </CardContent>
            </CardBody>
          </Card>
          {/* Arrow between certificates */}
          {index < chain.length - 1 && (
            <Flex justifyContent="center" paddingTop={4} paddingBottom={4}>
              <ArrowDown color="#a3a3a3" />
            </Flex>
          )}
        </div>
      ))}
    </Box>
  );
}
