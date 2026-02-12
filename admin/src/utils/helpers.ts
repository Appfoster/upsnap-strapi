import axios from 'axios';
import { MonitorSettings, UserDetails } from './types';
import { Monitor } from "./types";
import { REGIONS, MONITOR_TYPE } from "./constants";


export function getMonitorPrimaryRegion(monitor: Monitor) {
    return monitor.regions?.find((region) => region.is_primary);
}

export const request = async (url: string, options = {}) => {
  const response = await axios({
    url: `/upsnap${url}`,
    ...options,
  });
  return response.data;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  // Format: MM/DD/YYYY, HH:mm:ss
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const formatTitleToUppercase = (title: string): string => {
  const words = title.split('_');
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(' ');
} 

export	const getRangeTimestamps = (range: string) => {
  const now = Math.floor(Date.now() / 1000);
  const ranges: Record<string, number> = {
    last_hour: 60 * 60,
    last_24_hours: 60 * 60 * 24,
    last_7_days: 60 * 60 * 24 * 7,
    last_30_days: 60 * 60 * 24 * 30,
    last_year: 60 * 60 * 24 * 365,
  };
  const duration = ranges[range];
  return {
    start: now - duration,
    end: now,
  };
};

/**
 * Format check type keys for display:
 * - split on '_' and Title Case each word (e.g. mixed_content -> Mixed Content)
 * - single word -> capitalize first letter (e.g. domain -> Domain)
 * - exceptions (e.g. 'ssl') -> uppercase all letters
 */
export const formatCheckType = (key?: string | null) => {
    if (!key) return "";
    const k = String(key).toLowerCase().trim();
    const exceptions = ["ssl"];
    if (exceptions.includes(k)) return k.toUpperCase();

    const parts = k.split("_").filter(Boolean);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

export function formatDateTime(isoTimestamp: string) {
  if (!isoTimestamp) return "-";

  const date = new Date(isoTimestamp);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const getUserDetails = async (): Promise<UserDetails | null> => {
    try {
        const result = await request("/user/details", {
            method: "GET"
        });

        if (!result || result?.userDetailsData?.status !== "success") {
            console.error('Failed to fetch user details');
        } else {
            // Store user details data as a JSON string in localStorage
            // localStorage.setItem("userDetails", JSON.stringify(result.data));
            // setUserDetails(result.data);
            return result?.userDetailsData.data;
        }
        return null;
    } catch (error) {
        console.error('Error while fetching user details ', error);
        return null;
    }
}

export function enrichMonitorWithPrimaryRegionStatus(monitor: Monitor): Monitor {
  const primaryRegion = getMonitorPrimaryRegion(monitor);
  if (!primaryRegion) return monitor;

  const primaryRegionId = primaryRegion.id;
  const serviceChecks = monitor.service_last_checks?.[primaryRegionId];
  
  // Determine which service data to use based on monitor type
  let serviceData: { last_status?: string; last_checked_at?: string } | null = null;
  
  switch (monitor.service_type) {
    case MONITOR_TYPE.PORT:
      serviceData = serviceChecks?.port_check ?? null;
      break;
    case MONITOR_TYPE.KEYWORD:
      serviceData = serviceChecks?.keyword ?? null;
      break;
    case MONITOR_TYPE.WEBSITE:
    default:
      serviceData = serviceChecks?.uptime ?? null;
      break;
  }

  return {
    ...monitor,
    last_status: serviceData?.last_status ?? monitor.last_status,
    last_check_at: serviceData?.last_checked_at ?? monitor.last_check_at,
  };
}

/**
 * Fetch monitor settings from the new settings API endpoint
 * @param monitorId - The monitor ID
 * @returns MonitorSettings object
 */
export async function fetchMonitorSettings(
	monitorId: string
): Promise<MonitorSettings | null> {
	try {
		const res = await request(
			`/monitor/settings/${monitorId}`
		);

		if (!res) {
			console.error("Failed to fetch monitor settings");
			return null;
		}

		const result = await res.json();

		if (result.status === "success" && result.data) {
			return {
				monitor_id: result.data.monitor_id,
				settings: result.data.settings,
			};
		}

		console.error("Invalid response from monitor settings API:", result);
		return null;
	} catch (error) {
		console.error("Error fetching monitor settings:", error);
		return null;
	}
}

/**
 * Convert monitor settings to the config format used internally
 * @param settings - Settings object from the API
 * @returns Config object in the expected format
 */
export function settingsToConfig(
	settings: MonitorSettings["settings"]
): {
	meta: {
		url?: string;
		timeout?: number;
		follow_redirects?: boolean;
		host?: string;
		port?: number;
		monitor_interval?: number;
	};
	services?: Record<
		string,
		{
			enabled: boolean;
			monitor_interval?: number;
			notify_days_before_expiry?: number;
			retries?: number;
			timeout?: number;
			follow_redirects?: boolean;
			strategy?: string;
			max_pages?: number;
		}
	>;
} {
	return {
		meta: settings.meta,
		services: settings.services,
	};
}
