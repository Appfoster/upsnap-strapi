import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { handleLogout, notifyAccountChanged, request } from '../utils/helpers';
import LogInForm from '../components/settings/LoginForm';
import RegisterForm from '../components/settings/RegisterForm';
import ApiKeyManagement from '../components/settings/ApiKeyManagement';
import { Alert, Box, Flex, Button, Main, Card, CardBody, Tabs, Typography } from '@strapi/design-system';
import { toast } from 'react-toastify';

export default function Settings() {
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get('show') === 'login');
  const [showRegister, setShowRegister] = useState(!showLogin);
  const [showExpiredMessage, setShowExpiredMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('auth');

  const loadSettings = () => {
    request('/settings', { method: 'GET' }).then((res) => {
      setToken(res?.token || null);
    });
  };

  const handleAccountChanged = () => {
    loadSettings();
    notifyAccountChanged();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const logOut = async () => {
    setLoading(true);
    const result = await handleLogout();
    if (result) {
      toast.success('Logged out successfully.');
      setLoading(false);
      setToken(null);
      setShowLogin(false);
      setShowRegister(true);
      notifyAccountChanged();
      return;
    }
    setLoading(false);
    toast.error('Not able to log out, please try again.');
  };

  if (token === undefined) return null;

  if (token) {
    return (
      <Main>
        <Box padding={4}>
          <Flex justifyContent="space-between" alignItems="center" marginBottom={4}>
            <Typography variant="beta">Settings</Typography>
            <Button variant="danger-light" onClick={logOut} loading={loading}>
              Log out
            </Button>
          </Flex>
          <Card width="100%">
            <ApiKeyManagement currentToken={token} onSaved={handleAccountChanged} />
          </Card>
        </Box>
      </Main>
    );
  }

  return (
    <Main>
      <Box padding={4}>
        <Typography variant="beta" marginBottom={4}>
          Settings
        </Typography>
        {showExpiredMessage && (
          <Box marginBottom={4}>
            <Alert closeLabel="Close" title="" variant="danger">
              {showExpiredMessage.charAt(0).toUpperCase() + showExpiredMessage.slice(1)}
            </Alert>
          </Box>
        )}
        <Card width="100%">
          <CardBody width="100%" direction="column">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} variant="simple">
              <Tabs.List aria-label="Settings">
                <Tabs.Trigger value="auth">Register / Sign In</Tabs.Trigger>
                <Tabs.Trigger value="api-key">API Key Management</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="auth">
                <Box paddingTop={4} paddingBottom={4}>
                  {showLogin && (
                    <LogInForm
                      setShowLoginForm={setShowLogin}
                      setShowRegisterForm={setShowRegister}
                      setShowExpiredMessage={setShowExpiredMessage}
                      onTabChange={handleAccountChanged}
                    />
                  )}
                  {showRegister && (
                    <RegisterForm
                      setShowRegisterForm={setShowRegister}
                      setShowLoginForm={setShowLogin}
                      setShowExpiredMessage={setShowExpiredMessage}
                      onTabChange={handleAccountChanged}
                    />
                  )}
                </Box>
              </Tabs.Content>
              <Tabs.Content value="api-key">
                <ApiKeyManagement currentToken={null} onSaved={handleAccountChanged} />
              </Tabs.Content>
            </Tabs.Root>
          </CardBody>
        </Card>
      </Box>
    </Main>
  );
}
