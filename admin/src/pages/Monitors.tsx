import { Main, Box } from '@strapi/design-system';
import Monitors from '../components/settings/monitors/Monitors';

export default function MonitorsPage() {
  return (
    <Main>
      <Box padding={4}>
        <Monitors />
      </Box>
    </Main>
  );
}
