import { Page, Layouts } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { HomePage } from './HomePage';
import Settings from './Settings';
import Dashboard from './Dashboard';

const App = () => {
  return (
      <Layouts.Root
        sideNav={<SideNav />}
      >
        <Layouts.Header
          title="Upsnap"
          subtitle="Website health monitoring"
        />
        <Layouts.Content>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/settings' element={<Settings />} />
            <Route path="*" element={<Page.Error />} />
          </Routes>
        </Layouts.Content>
      </Layouts.Root>
  );
};

export { App };
