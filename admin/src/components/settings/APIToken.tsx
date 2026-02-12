import { Box, Button, TextInput, Typography } from '@strapi/design-system';
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
    <Box padding={8}>
      <Typography variant="alpha">Token Settings</Typography>
      <Box marginTop={6} width="50%">
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
