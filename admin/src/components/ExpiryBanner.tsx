import { useEffect, useState } from 'react';
import { Alert, Box, Flex, IconButton, Link, Typography } from '@strapi/design-system';
import { Cross, WarningCircle } from '@strapi/icons';
import { ACCOUNT_CHANGED_EVENT, getBillingStatus, getExpirySummary } from '../utils/helpers';
import { hasActivePaidPlan, BILLING_UPGRADE_DISMISS_KEY, DASHBOARD_URL } from '../utils/constants';
import { ExpiryAlert } from '../utils/types';

const ALERTS_DISMISS_KEY = 'upsnap_expiry_alerts_dismissed';

const alertKey = (alert: ExpiryAlert) => `${alert.monitorId}:${alert.type}`;

function readDismissedAlertKeys(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(ALERTS_DISMISS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function ExpiryBanner() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [dismissedUpgrade, setDismissedUpgrade] = useState(
    () => sessionStorage.getItem(BILLING_UPGRADE_DISMISS_KEY) === 'true'
  );
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<string[]>(readDismissedAlertKeys);
  const [accountTick, setAccountTick] = useState(0);

  useEffect(() => {
    const handler = () => {
      setDismissedUpgrade(false);
      setDismissedAlertKeys([]);
      setAccountTick((tick) => tick + 1);
    };
    window.addEventListener(ACCOUNT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    setPaid(null);
    setAlerts([]);
    (async () => {
      const billing = await getBillingStatus();
      if (!billing?.hasToken) return;

      const paidPlan = hasActivePaidPlan(billing);
      setPaid(paidPlan);

      if (paidPlan) {
        const summary = await getExpirySummary();
        setAlerts(summary?.alerts || []);
      }
    })();
  }, [accountTick]);

  if (paid === null) return null;

  if (!paid) {
    if (dismissedUpgrade) return null;

    return (
      <Flex
        background="alternative600"
        paddingLeft={4}
        paddingRight={4}
        paddingTop={2}
        paddingBottom={2}
        justifyContent="space-between"
        alignItems="center"
        gap={3}
      >
        <Flex gap={2} alignItems="center">
          <WarningCircle fill="neutral0" />
          <Typography textColor="neutral0">
            Upgrade UpSnap to receive SSL &amp; domain expiry alerts before it&apos;s too late.{' '}
            <Link href={DASHBOARD_URL} isExternal color="neutral0" style={{ textDecoration: 'underline' }}>
              Upgrade now →
            </Link>
          </Typography>
        </Flex>
        <IconButton
          label="Close"
          variant="ghost"
          onClick={() => {
            sessionStorage.setItem(BILLING_UPGRADE_DISMISS_KEY, 'true');
            setDismissedUpgrade(true);
          }}
        >
          <Cross fill="neutral0" />
        </IconButton>
      </Flex>
    );
  }

  const visibleAlerts = alerts.filter((alert) => !dismissedAlertKeys.includes(alertKey(alert)));
  if (visibleAlerts.length === 0) return null;

  const summaryText = visibleAlerts
    .map(
      (alert) =>
        `${alert.monitorName} ${alert.type === 'ssl' ? 'SSL' : 'domain'} expires in ${alert.daysRemaining} day${alert.daysRemaining === 1 ? '' : 's'}`
    )
    .join(', ');

  return (
    <Box paddingLeft={4} paddingRight={4} paddingTop={2}>
      <Alert
        closeLabel="Close"
        variant="danger"
        title={`${visibleAlerts.length} site${visibleAlerts.length === 1 ? '' : 's'} need${visibleAlerts.length === 1 ? 's' : ''} attention`}
        onClose={() => {
          const keys = Array.from(new Set([...dismissedAlertKeys, ...visibleAlerts.map(alertKey)]));
          sessionStorage.setItem(ALERTS_DISMISS_KEY, JSON.stringify(keys));
          setDismissedAlertKeys(keys);
        }}
        action={
          <Link href={DASHBOARD_URL} isExternal>
            View in Upsnap
          </Link>
        }
      >
        {summaryText}
      </Alert>
    </Box>
  );
}
