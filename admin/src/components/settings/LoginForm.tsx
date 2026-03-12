import { Box, Field, Flex, Divider, Link } from '@strapi/design-system';
import { useState } from 'react';
import { Typography } from '@strapi/design-system';
import { Button } from '@strapi/design-system';
import { loginSchema } from '../../utils/types';
import { z } from 'zod';
import { request } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

type LoginForm = z.infer<typeof loginSchema>;
type FormErrors = z.ZodError<LoginForm> | null;

export default function LogInForm({ setShowLoginForm } : {
    setShowLoginForm: (value: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(result.error);
      setLoading(false);
      return;
    }
    setErrors(null);
    const domainUrl = (window as any).strapi?.backendURL || window.location.origin;
    request('/signup', {
        method: "POST",
        data: {
            email,
            password,
            source: "strapi",
            site_url: domainUrl
        }
    }).then((res) => {
        if (res?.ok) {
            toast.success('UpSnap Connected.');
            toast.success('Your site is now being monitored every 5 minutes.')
            navigate('/plugins/upsnap/dashboard');
            return;
        }
        toast.error('Not able to register, please try again.');
    }).catch((err) => {
        toast.error('Not able to register, please try again.');
    }).finally(() => {
        setLoading(false);
    })
  };

  return (
    <Box padding={8} width="100%">
      <Flex marginBottom={3} direction="column" gap={1} justifyContent="start" alignItems="start">
        <Typography variant="beta">Register</Typography>
        <Typography variant="epsilon" textColor="neutral600" marginBottom={3}>
            Create a free UpSnap beta account to start monitoring your site.
        </Typography>
      </Flex>
      <Divider marginBottom={3} />
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap={3} width="100%">
          <Field.Root width="100%" error={errors?.issues.find((issue) => issue.path[0] === 'email')?.message}>
            <Field.Label required>Email</Field.Label>
            <Field.Input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <Field.Error />
          </Field.Root>
          <Field.Root width="100%" error={errors?.issues.find((issue) => issue.path[0] === 'password')?.message}>
            <Field.Label required>Password</Field.Label>
            <Field.Input
              type="password"
              placeholder="Enter a password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <Field.Error />
          </Field.Root>
          <Flex width="100%" justifyContent="end" marginTop={3}>
            <Button size="L" type="submit" loading={loading}>
              Start Free Beta Monitoring
            </Button>
          </Flex>
        </Flex>
      </form>
      <Flex justifyContent="center" marginTop={4}>
        <Link to="#" onClick={
            (e: any) => {
                e?.preventDefault();
                setShowLoginForm(false);
            }
        }>Already have an account?</Link>
      </Flex>
    </Box>
  );
}
