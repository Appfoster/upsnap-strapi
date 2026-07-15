import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Badge,
  Box,
  Flex,
  SubNav,
  SubNavHeader,
  SubNavLink,
  SubNavSection,
  Tooltip,
} from '@strapi/design-system';
import { Cog, House, Monitor, BulletList, Server, Bell, Star } from '@strapi/icons';
import {
  ACCOUNT_CHANGED_EVENT,
  getBillingStatus,
  request,
  enrichMonitorWithPrimaryRegionStatus,
} from '../utils/helpers';
import { hasActivePaidPlan } from '../utils/constants';

const NAV_ITEMS = [
  { to: 'dashboard', label: 'Dashboard', icon: House },
  { to: 'monitors', label: 'Monitors', icon: Server },
  { to: 'incidents', label: 'Incidents', icon: BulletList },
  { to: 'status-pages', label: 'Status Pages', icon: Monitor },
  { to: 'notification-channels', label: 'Notification Channels', icon: Bell },
  { to: 'settings', label: 'Settings', icon: Cog },
];

const DOWN_MONITORS_POLL_MS = 60 * 1000;

const SideNav = () => {
  // Create a flexible version of the component
  const CustomSubNavLink = SubNavLink as any;
  const [paid, setPaid] = useState<boolean | null>(null);
  const [downCount, setDownCount] = useState(0);
  const [accountTick, setAccountTick] = useState(0);

  useEffect(() => {
    const handler = () => setAccountTick((tick) => tick + 1);
    window.addEventListener(ACCOUNT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(ACCOUNT_CHANGED_EVENT, handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setPaid(null);
    getBillingStatus().then((billing) => {
      if (!cancelled) setPaid(billing?.hasToken ? hasActivePaidPlan(billing) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [accountTick]);

  useEffect(() => {
    if (!paid) return;
    let cancelled = false;

    const fetchDownCount = async () => {
      try {
        const res = await request('/monitors', { method: 'GET' });
        const monitors = res?.monitorsData?.data?.monitors;
        if (!Array.isArray(monitors) || cancelled) return;
        const count = monitors.filter(
          (m: any) => m.is_enabled && enrichMonitorWithPrimaryRegionStatus(m).last_status !== 'up'
        ).length;
        if (!cancelled) setDownCount(count);
      } catch {
        return;
      }
    };

    fetchDownCount();
    const interval = setInterval(fetchDownCount, DOWN_MONITORS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [paid]);

  return (
    <SubNav aria-label="Upsnap navigation">
      <SubNavHeader label="Upsnap" />

      <SubNavSection label="">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Box key={to} position="relative">
            <CustomSubNavLink
              as={NavLink}
              to={to}
              icon={<Icon />}
              style={{ marginLeft: '10px', marginBottom: '10px' }}
            >
              {label}
            </CustomSubNavLink>
            {to === 'monitors' && paid === false && (
              <Box position="absolute" top="0.3rem" right="1.2rem">
                <Tooltip label="Upgrade to Pro for live alerts">
                  <Flex
                    width="1.6rem"
                    height="1.6rem"
                    background="alternative600"
                    borderRadius="50%"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Star fill="neutral0" width="0.9rem" height="0.9rem" />
                  </Flex>
                </Tooltip>
              </Box>
            )}
            {to === 'monitors' && paid === true && downCount > 0 && (
              <Box position="absolute" top="0.2rem" right="1.2rem">
                <Tooltip label={`${downCount} monitor${downCount === 1 ? '' : 's'} down`}>
                  <span style={{ display: 'inline-flex', cursor: 'default' }}>
                    <Badge size="S" textColor="neutral0" background="danger600">
                      {downCount}
                    </Badge>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        ))}
      </SubNavSection>
    </SubNav>
  );
};

export default SideNav;
