// admin/src/pages/Settings/index.tsx
import { useState, useEffect } from 'react';
import SettingsTabs from '../components/settings/SettingsTabs';
import { request } from '../utils/helpers';
import LogInForm from '../components/settings/LoginForm';
import RegisterForm from '../components/settings/RegisterForm';
import { Alert, Box } from '@strapi/design-system';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('monitors');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showExpiredMessage, setShowExpiredMessage] = useState('');
  useEffect(() => {
    request('/settings', {
      method: 'GET',
    }).then((res) => {
      if (!res?.token) {
        setShowRegister(true);
        setShowLogin(false);
      };
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

  return (
    <>
      {showExpiredMessage && (
        <Box margin={2}>
         <Alert closeLabel="Close" title="" variant="danger">
          {showExpiredMessage.charAt(0).toUpperCase() + showExpiredMessage.slice(1)}
        </Alert>
        </Box>
      )}
      {showLogin && <LogInForm setShowLoginForm={setShowLogin} setShowRegisterForm={setShowRegister} setShowExpiredMessage={setShowExpiredMessage} />}
      {showRegister && (
        <RegisterForm setShowRegisterForm={setShowRegister} setShowLoginForm={setShowLogin} setShowExpiredMessage={setShowExpiredMessage} />
      )} 
      {!showLogin && !showRegister && (
        <SettingsTabs
          tabs={[
            { name: 'Monitors', value: 'monitors' },
            { name: 'Notification Channels', value: 'notification_channels' },
          ]}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </>
  );
}
