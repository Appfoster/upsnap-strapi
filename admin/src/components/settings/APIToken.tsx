import { Box, Button, TextInput, Typography, Flex, Link } from '@strapi/design-system';
import { useState, useEffect } from 'react';
import { request } from '../../utils/helpers';

export default function APIToken() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    request('/settings', {
      method: 'GET',
    }).then((res) => {
      setToken(res.token || '');
    });
  }, []);

  const save = async () => {
    setLoading(true);
    await request('/settings', {
      method: 'POST',
      data: { token },
    });
    setLoading(false);
  };

  return (
    <Box padding={3}>
      <Flex direction="column" gap={2} alignItems="start">
        <Typography variant="alpha">Token Settings</Typography>
        <Typography variant="omega">
          Enter the Upsnap API Key and save to enable Healthcheck settings. To access the API key,
          please visit the{' '}
          <Link href="https://upsnap.ai" isExternal>
            Upsnap Dashboard
          </Link>
        </Typography>
      </Flex>
      <Box marginTop={6} width="100%">
        <TextInput
          label="API Token"
          type="password"
          value={token}
          onChange={(e: any) => setToken(e.target.value)}
        />

        <Box marginTop={4}>
          <Button loading={loading} onClick={save}>
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
