// admin/src/pages/Settings/index.tsx
import { useState, useEffect } from 'react';
import SettingsTabs from '../components/settings/SettingsTabs';
import { handleLogout, request } from '../utils/helpers';
import LogInForm from '../components/settings/LoginForm';
import RegisterForm from '../components/settings/RegisterForm';
import { Alert, Box, Flex, Button } from '@strapi/design-system';
import { toast } from 'react-toastify';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('monitors');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showExpiredMessage, setShowExpiredMessage] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    request('/settings', {
      method: 'GET',
    }).then((res) => {
      if (!res?.token) {
        setShowRegister(true);
        setShowLogin(false);
      }
    });
  }, []);
  const handleTabChange = (tab: string) => {
    if (tab === 'api_key') {
      setShowLogin(true);
      setShowRegister(false);
      return;
    }
    setActiveTab(tab);
  };

  const logOut = async () => {
    setLoading(true);
    const result = await handleLogout();
    if (result) {
      toast.success('Logged out successfully.');
      setLoading(false);
      setShowLogin(true);
      return;
    }
    setLoading(false);
    toast.error('Not able to log out, please try again.');
    return;
  };

  return (
    <>
      {showExpiredMessage && (
        <Box margin={2}>
          <Alert closeLabel="Close" title="" variant="danger">
            {showExpiredMessage.charAt(0).toUpperCase() + showExpiredMessage.slice(1)}
          </Alert>
        </Box>
      )}
      {showLogin && (
        <LogInForm
          setShowLoginForm={setShowLogin}
          setShowRegisterForm={setShowRegister}
          setShowExpiredMessage={setShowExpiredMessage}
          onTabChange={handleTabChange}
        />
      )}
      {showRegister && (
        <RegisterForm
          setShowRegisterForm={setShowRegister}
          setShowLoginForm={setShowLogin}
          setShowExpiredMessage={setShowExpiredMessage}
          onTabChange={handleTabChange}
        />
      )}
      {!showLogin && !showRegister && (
        <>
          <Box width="100%" paddingRight={8}>
            <Flex justifyContent="end">
              <Button onClick={logOut} loading={loading}>
                Log out
              </Button>
            </Flex>
          </Box>
          <SettingsTabs
            tabs={[
              { name: 'Monitors', value: 'monitors' },
              { name: 'Notification Channels', value: 'notification_channels' },
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </>
      )}
    </>
  );
}
