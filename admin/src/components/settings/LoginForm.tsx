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
import { loginSchema } from '../../utils/types';
import { z } from 'zod';
import { request } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

type LoginForm = z.infer<typeof loginSchema>;
type FormErrors = z.ZodError<LoginForm> | null;

export default function LogInForm({
  setShowLoginForm,
  setShowRegisterForm,
  setShowExpiredMessage,
}: {
  setShowLoginForm: (value: boolean) => void;
  setShowRegisterForm: (value: boolean) => void;
  setShowExpiredMessage: (value: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors(result.error);
      setLoading(false);
      return;
    }
    setErrors(null);

    request('/login', {
      method: 'POST',
      data: {
        email,
        password,
      },
    })
      .then((res) => {
        if (res?.ok) {
          toast.success('Login Successful');
          navigate('/plugins/upsnap/dashboard');
          return;
        }
        toast.error(res?.message || 'Not able to login, please try again.');
        setShowExpiredMessage(res?.message);
      })
      .catch((err) => {
        toast.error('Not able to login, please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleForgotPassword = () => {
    if (!email) {
      setForgotPasswordError('Please enter the email.');
      return;
    }
    setForgotPasswordError('');
    request('/forgot-password', {
      method: 'POST',
      data: {
        email,
      },
    })
      .then((res) => {
        if (res?.ok) {
          toast.success(res?.message);
          return;
        }
        toast.error(res?.message || 'Not able to login, please try again.');
        setShowExpiredMessage(res?.message);
      })
      .catch((err) => {
        toast.error('Not able to send email, please try again.');
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
                <Typography variant="beta">Sign In</Typography>
                <Typography variant="epsilon" textColor="neutral600" marginBottom={3}>
                  Enter your email and password to Sign In.
                </Typography>
              </Flex>
              <Divider marginBottom={3} />
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={3} width="100%">
                  <Field.Root
                    width="100%"
                    error={
                      errors?.issues.find((issue) => issue.path[0] === 'email')?.message ||
                      forgotPasswordError
                    }
                    required
                  >
                    <Field.Label>Email</Field.Label>
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
                    <Field.Label>Password</Field.Label>
                    <Field.Input
                      type="password"
                      placeholder="Enter a password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <Field.Error />
                  </Field.Root>
                  <Box width="100%">
                    <Flex justifyContent="end" marginTop={4}>
                      <Link
                        onClick={(e: any) => {
                          e?.preventDefault();
                          handleForgotPassword();
                        }}
                      >
                        forgot password?
                      </Link>
                    </Flex>
                  </Box>
                  <Flex width="100%" justifyContent="end" marginTop={3}>
                    <Button size="L" type="submit" loading={loading}>
                      Sign In
                    </Button>
                  </Flex>
                </Flex>
              </form>
              <Flex justifyContent="center" marginTop={4}>
                <Link
                  onClick={(e: any) => {
                    e?.preventDefault();
                    setShowLoginForm(false);
                    setShowRegisterForm(true);
                  }}
                >
                  Not registered? Create account
                </Link>
              </Flex>
            </Box>
          </CardContent>
        </CardBody>
      </Card>
    </Box>
  );
}
