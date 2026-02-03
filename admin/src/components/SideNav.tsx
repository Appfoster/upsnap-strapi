import { NavLink } from 'react-router-dom';
import { SubNav, SubNavHeader, SubNavLink, SubNavSection } from '@strapi/design-system';
import { Cog, Earth, House } from '@strapi/icons';
import { PLUGIN_ID } from '../pluginId';
import '../styles/custom-styles.css';

const SideNav = () => {
  return (
    <SubNav aria-label="Upsnap navigation">
      <SubNavHeader label="Upsnap" />

      <SubNavSection>
        <SubNavLink
          as={NavLink}
          to={`dashboard`}
          icon={<House />}
          padding={2}
          marginBottom={1}
          marginLeft={2}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Dashboard
        </SubNavLink>
        <SubNavLink
          as={NavLink}
          to={`reachability`}
          icon={<Earth />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Reachability
        </SubNavLink>

        <SubNavLink
          as={NavLink}
          to={`settings`}
          icon={<Cog />}
          style={{ marginLeft: '10px', marginBottom: '10px' }}
        >
          Settings
        </SubNavLink>
      </SubNavSection>
    </SubNav>
  );
};

export default SideNav;
