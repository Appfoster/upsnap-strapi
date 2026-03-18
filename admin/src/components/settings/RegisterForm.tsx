import {
  Box,
  Field,
  Flex,
  Divider,
  Link,
  Card,
  CardBody,
  CardContent,
} from '@strapi/design-system';
import { useState } from 'react';
import { Typography } from '@strapi/design-system';
import { Button } from '@strapi/design-system';
import { registerSchema } from '../../utils/types';
import { z } from 'zod';
import { request } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

type RegisterForm = z.infer<typeof registerSchema>;
type FormErrors = z.ZodError<RegisterForm> | null;

export default function RegisterForm({
  setShowRegisterForm,
  setShowLoginForm,
  setShowExpiredMessage
}: {
  setShowRegisterForm: (value: boolean) => void;
  setShowLoginForm: (value: boolean) => void;
  setShowExpiredMessage: (value: string) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [errors, setErrors] = useState<FormErrors>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = registerSchema.safeParse({ email, password, fullName, confirmPassword });
    if (!result.success) {
      setErrors(result.error);
      setLoading(false);
      return;
    }
    setErrors(null);
    const domainUrl = (window as any).strapi?.backendURL || window.location.origin;
    request('/signup', {
      method: 'POST',
      data: {
        email,
        password,
        fullName,
        source: 'strapi',
        site_url: domainUrl,
      },
    })
      .then((res) => {
        if (res?.ok) {
          toast.success(res?.message || 'UpSnap Connected.');
          toast.success('Your site is now being monitored every 5 minutes.');
          navigate('/plugins/upsnap/dashboard');
          return;
        }
        toast.error('Not able to register, please try again.');
      })
      .catch((err) => {
        toast.error('Not able to register, please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box margin="auto" width={{ initial: '100%', medium: '55%' }}>
      <Card>
        <CardBody>
          <CardContent width="100%">
            <Box padding={4} width="100%">
              <Flex
                marginBottom={3}
                direction="column"
                gap={1}
                justifyContent="start"
                alignItems="start"
              >
                <Typography variant="beta">Register</Typography>
                <Typography variant="epsilon" textColor="neutral600" marginBottom={3}>
                  Create a free UpSnap beta account to start monitoring your site.
                </Typography>
              </Flex>
              <Divider marginBottom={3} />
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={3} width="100%">
                  <Field.Root
                    width="100%"
                    error={errors?.issues.find((issue) => issue.path[0] === 'fullName')?.message}
                    required
                  >
                    <Field.Label>Full Name</Field.Label>
                    <Field.Input
                      type="text"
                      placeholder="Ted Lasso"
                      value={fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFullName(e.target.value)
                      }
                    />
                    <Field.Error />
                  </Field.Root>
                  <Field.Root
                    width="100%"
                    error={errors?.issues.find((issue) => issue.path[0] === 'email')?.message}
                    required
                  >
                    <Field.Label required>Email</Field.Label>
                    <Field.Input
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                    />
                    <Field.Error />
                  </Field.Root>
                  <Field.Root
                    width="100%"
                    error={errors?.issues.find((issue) => issue.path[0] === 'password')?.message}
                    required
                  >
                    <Field.Label required>Password</Field.Label>
                    <Field.Input
                      type="password"
                      placeholder="Enter a password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setPassword(value);
                      }}
                    />
                    <Field.Error />
                  </Field.Root>
                  <Field.Root
                    width="100%"
                    error={
                      errors?.issues.find((issue) => issue.path[0] === 'confirmPassword')
                        ?.message || confirmPasswordError
                    }
                    required
                  >
                    <Field.Label required>Confirm Password</Field.Label>
                    <Field.Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        setConfirmPassword(value);
                        if (password && value && password !== value) {
                          setConfirmPasswordError('Passwords do not match');
                        } else {
                          setConfirmPasswordError('');
                        }
                      }}
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
                <Link
                  to="#"
                  onClick={(e: any) => {
                    e?.preventDefault();
                    setShowRegisterForm(false);
                    setShowLoginForm(true);
                  }}
                >
                  Already have an account?
                </Link>
              </Flex>
            </Box>
          </CardContent>
        </CardBody>
      </Card>
    </Box>
  );
}
