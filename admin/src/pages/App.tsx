import { Page, Layouts } from '@strapi/strapi/admin';
import { Routes, Route } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { HomePage } from './HomePage';
import Settings from './Settings';
import Dashboard from './Dashboard';
import Reachability from './Reachability';
import SecurityCertificates from './SecurityCertificates';
import BrokenLinks from './BrokenLinks';
import Lighthouse from './Lighthouse';
import DomainCheck from './DomainCheck';
import MixedContent from './MixedContent';
import ListStatusPages from './StatusPages';
import CreateStatusPage from './StatusPages/new';
import UpdateStatusPage from './StatusPages/edit';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import CreateMonitor from './monitors/new';

const StyledContainer = styled(ToastContainer)`
  // https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
  &&&.Toastify__toast-container {
    font-size: 15px;
  }
  &&& .Toastify__toast {
    font-size: 15px;
  }
`;

const App = () => {
  return (
    <Layouts.Root sideNav={<SideNav />}>
      <Layouts.Header title="Upsnap" subtitle="Website health monitoring" />
      <Layouts.Content>
        <StyledContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reachability" element={<Reachability />} />
          <Route path="/security-certificates" element={<SecurityCertificates />} />
          <Route path="/broken-links" element={<BrokenLinks />} />
          <Route path="/lighthouse" element={<Lighthouse />} />
          <Route path="/domain-check" element={<DomainCheck />} />
          <Route path="/mixed-content" element={<MixedContent />} />
          <Route path="/status-pages" element={<ListStatusPages />} />
          <Route path="/status-pages/new" element={<CreateStatusPage />} />
          <Route path="/status-pages/:id" element={<UpdateStatusPage />} />
          <Route path="/monitors/new" element={<CreateMonitor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Page.Error />} />
        </Routes>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export { App };
