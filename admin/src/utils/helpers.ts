import axios from 'axios';
import { UserDetails } from './types';

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
        const response = await request("/user-details", {
            method: "GET"
        });

        const result = await response.json();
        if (!response.ok || result.status !== "success") {
            console.error('Failed to fetch user details');
        } else {
            // Store user details data as a JSON string in localStorage
            // localStorage.setItem("userDetails", JSON.stringify(result.data));
            // setUserDetails(result.data);
            return result.data;
        }
        return null;
    } catch (error) {
        console.error('Error while fetching user details ', error);
        return null;
    }
}
