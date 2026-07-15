import { Main, Box } from '@strapi/design-system';
import IncidentsList from "../components/incidents/IncidentsList";

export default function IncidentsPage() {
	return (
		<Main>
			<Box padding={4}>
				<IncidentsList />
			</Box>
		</Main>
	);
}
