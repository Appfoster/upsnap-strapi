import { useEffect, useState } from 'react';
import { Badge, Box, Button, Field, Flex, Link, Typography } from '@strapi/design-system';
import { toast } from 'react-toastify';
import { request, getTokenStatus } from '../../utils/helpers';
import { DASHBOARD_URL } from '../../utils/constants';

interface Props {
  currentToken: string | null;
  onSaved: () => void;
}

function maskToken(token: string): string {
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}${'X'.repeat(token.length - 8)}${token.slice(-4)}`;
}

const STATUS_BADGE: Record<string, { background: string; textColor: string; label: string }> = {
  active: { background: 'success100', textColor: 'success700', label: 'Active' },
  suspended: { background: 'danger100', textColor: 'danger700', label: 'Suspended' },
  expired: { background: 'danger100', textColor: 'danger700', label: 'Expired' },
  account_expired: { background: 'danger100', textColor: 'danger700', label: 'Expired' },
  deleted: { background: 'danger100', textColor: 'danger700', label: 'Invalid' },
};

export default function ApiKeyManagement({ currentToken, onSaved }: Props) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!currentToken) {
      setStatus(null);
      return;
    }
    getTokenStatus().then((result) => setStatus(result?.status || null));
  }, [currentToken]);

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error('Please enter an API key.');
      return;
    }
    setSaving(true);
    try {
      const res = await request('/settings', { method: 'POST', data: { token: value.trim() } });
      if (res?.ok) {
        toast.success('API key saved successfully.');
        setValue('');
        onSaved();
      } else {
        toast.error(res?.error || 'Invalid API key.');
      }
    } catch {
      toast.error('Failed to save API key.');
    } finally {
      setSaving(false);
    }
  };

  const badge = status ? STATUS_BADGE[status] : null;

  return (
    <Box padding={4} width="100%">
      <Flex justifyContent="space-between" alignItems="start" marginBottom={4} gap={3}>
        <Flex direction="column" gap={1} alignItems="flex-start">
          <Typography variant="delta" fontWeight="bold">
            API Key
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Enter your Upsnap API key to enable monitoring. To find your key, visit the{' '}
            <Link href={DASHBOARD_URL} isExternal>
              Upsnap Dashboard
            </Link>
            .
          </Typography>
        </Flex>
        {badge && (
          <Badge background={badge.background} textColor={badge.textColor}>
            {badge.label}
          </Badge>
        )}
      </Flex>
      {currentToken && (
        <Box marginBottom={4}>
          <Typography variant="pi" textColor="neutral500">
            Current key
          </Typography>
          <Typography style={{ fontFamily: 'monospace' }}>{maskToken(currentToken)}</Typography>
        </Box>
      )}
      <Flex gap={3} direction={{ initial: 'column', medium: 'row' }} alignItems="end">
        <Box width="100%">
          <Field.Root>
            <Field.Label>{currentToken ? 'Replace API Key' : 'API Key'}</Field.Label>
            <Field.Input
              value={value}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            />
          </Field.Root>
        </Box>
        <Button onClick={handleSave} loading={saving}>
          Save
        </Button>
      </Flex>
    </Box>
  );
}
