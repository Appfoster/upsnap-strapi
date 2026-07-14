import { Alert, Link } from '@strapi/design-system';
import { useNavigate } from 'react-router-dom';

export default function SelectPrimaryMonitorAlert() {
  const navigate = useNavigate();

  return (
    <Alert
      closeLabel="Close"
      margin={1}
      variant="warning"
      title="Please select a primary monitor to continue!"
      action={
        <Link
          href="#"
          onClick={(event: any) => {
            event.preventDefault();
            navigate('/plugins/upsnap/monitors');
          }}
        >
          Select Monitor
        </Link>
      }
    >
      Choose a primary monitor from your Monitors list to see live data here.
    </Alert>
  );
}
