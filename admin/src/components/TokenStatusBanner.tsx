import { useEffect, useState } from 'react';
import { Alert, Box, Link } from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';
import { getTokenStatus } from '../utils/helpers';
import { TokenStatus } from '../utils/types';

const STATUS_MESSAGES: Record<string, string> = {
  account_expired:
    'Your 3-day free trial has expired. Please verify your email to continue using the service.',
  expired: 'Your API token has expired. Please generate a new token in the Upsnap Dashboard.',
  suspended: 'Your API token has been suspended. Update it in Settings.',
  deleted: 'Your API token is no longer valid. Please reconnect in Settings.',
};

export default function TokenStatusBanner() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getTokenStatus().then(setTokenStatus);
  }, []);

  if (
    dismissed ||
    !tokenStatus?.hasToken ||
    !tokenStatus.status ||
    tokenStatus.status === 'active' ||
    tokenStatus.status === 'unknown'
  ) {
    return null;
  }

  const message =
    STATUS_MESSAGES[tokenStatus.status] ||
    'Your API token is expired or suspended. Update it in Settings.';

  return (
    <Box paddingLeft={4} paddingRight={4} paddingTop={2}>
      <Alert
        closeLabel="Close"
        onClose={() => setDismissed(true)}
        variant="danger"
        title="Action required"
        action={
          <Link
            href="#"
            onClick={(event: any) => {
              event.preventDefault();
              navigate('/plugins/upsnap/settings');
            }}
          >
            Go to Settings
          </Link>
        }
      >
        {message}
      </Alert>
    </Box>
  );
}
