import { NavLink } from 'react-router-dom';
import { SubNav, SubNavHeader, SubNavLink, SubNavSection } from '@strapi/design-system';
import {
  Cog,
  Earth,
  ExternalLink,
  Globe,
  House,
  Link,
  Lock,
  Monitor,
  Palette,
} from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';

const SideNav = () => {
  // Create a flexible version of the component
 const CustomSubNavLink = SubNavLink as any;

  return (
    <SubNav aria-label="Upsnap navigation">
      <SubNavHeader label="Upsnap" />

      <SubNavSection label="Upsnap">
        <CustomSubNavLink
          as={NavLink}
          to={`dashboard`}
          icon={<House />}
          padding={2}
          marginBottom={1}
          marginLeft={2}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Dashboard
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`reachability`}
          icon={<Earth />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Reachability
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`security-certificates`}
          icon={<Lock />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Security Certificates
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`broken-links`}
          icon={<Link />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Broken Links
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`lighthouse`}
          icon={<Palette />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Lighthouse
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`domain-check`}
          icon={<Globe />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Domain Check
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`mixed-content`}
          icon={<ExternalLink />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Mixed Content
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`status-pages`}
          icon={<Monitor />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Status Pages
        </CustomSubNavLink>
        <CustomSubNavLink
          as={NavLink}
          to={`settings`}
          icon={<Cog />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Settings
        </CustomSubNavLink>
      </SubNavSection>
    </SubNav>
  );
};

export default SideNav;
