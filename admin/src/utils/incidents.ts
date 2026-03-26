import { request } from "./helpers";

export interface FetchIncidentsParams {
	monitorId: string;
	timeRange?: string;
	page?: number;
	pageSize?: number;
	checkType?: string;
	region?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface IncidentsResponse {
	status: string;
	data: {
		incidents: any[];
		total_count: number;
		page: number;
		page_size: number;
		total_pages: number;
		incidents_by_check?: Record<string, number>;
	};
}

/**
 * Fetch incidents from the backend with filtering, sorting, and pagination
 * @param params - Query parameters for incidents
 * @param timeout - Request timeout in milliseconds
 * @returns Incidents data with pagination info
 */
export const fetchIncidentsFromBackend = async (
	params: FetchIncidentsParams,
	timeout: number = 10000,
): Promise<IncidentsResponse | null> => {
	try {

		// Create abort controller for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const result = await request(`/monitor/all-incidents`, {
                method: "POST",
                data: params,
            });

			if (!result) {
 				console.error("Failed to fetch incidents: no response received");
 				return null;
 			}

			clearTimeout(timeoutId);

			if (!result?.incidentsData) {
				console.error("Failed to fetch incidents:", result.status);
				return null;
			}


			if (result?.incidentsData?.status === "success") {
				return result?.incidentsData?.data as IncidentsResponse;
			}

			console.error("Incidents API error:", result?.incidentsData?.data?.message);
			return null;
		} catch (error: any) {
			clearTimeout(timeoutId);
			if (error.name === "AbortError") {
				console.error("Incidents request timeout");
			} else {
				console.error("Error fetching incidents:", error);
			}
			return null;
		}
	} catch (error) {
		console.error("Error in fetchIncidentsFromBackend:", error);
		return null;
	}
};

/**
 * Debounce function to delay API calls
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => Promise<any>>(
	func: T,
	delay: number,
): ((...args: Parameters<T>) => Promise<void>) => {
	let timeoutId: NodeJS.Timeout;

	return async (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		return new Promise<void>((resolve) => {
			timeoutId = setTimeout(async () => {
				try {
					await func(...args);
					resolve();
				} catch (error) {
					console.error("Debounced function error:", error);
					resolve();
				}
			}, delay);
		});
	};
};

/**
 * Sort option to sortBy parameter mapping
 */
export const sortOptionToBackendParam = (
	sortOption: string | null,
): string | undefined => {
	if (!sortOption) return undefined;

	const sortMap: Record<string, string> = {
		"Occurred ↓": "timestamp",
		"Occurred ↑": "timestamp",
		"Check Type ↓": "check_type",
		"Check Type ↑": "check_type",
		"Status Code ↓": "status_code",
		"Status Code ↑": "status_code",
		"Message ↓": "message",
		"Message ↑": "message",
		"Region ↓": "region",
		"Region ↑": "region",
	};

	return sortMap[sortOption];
};

/**
 * Get sort field from sort option
 */
export const getSortField = (sortOption: string | null): string | undefined => {
	return sortOptionToBackendParam(sortOption);
};

/**
 * Get sort order from sort option (asc or desc)
 */
export const getSortOrder = (
	sortOption: string | null,
): "asc" | "desc" | undefined => {
	if (!sortOption) return undefined;
	// Check if sort is descending (↓) or ascending (↑)
	const isDescending = sortOption.includes("↓");
	return isDescending ? "desc" : "asc";
};

/**
 * Build sort_by parameter (deprecated - use getSortField instead)
 */
export const buildSortParam = (
	sortOption: string | null,
): string | undefined => {
	return getSortField(sortOption);
};
