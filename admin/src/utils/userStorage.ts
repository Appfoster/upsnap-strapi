// utils/userStorage.ts

import { PLAN_TYPES } from "./constants";
import { getUserDetails } from "./helpers";

type UserData = {
  email: string;
  username: string;
  monitor_url: string;
  plan_limits: string;
};

type PlanLimits = {
    max_integrations: number;
    max_monitors: number;
    max_notifications_per_day: number;
    min_monitoring_interval: number;
    max_status_pages: number;
};

type UserInfo = {
    id: string;
    email: string;
    fullname?: string;
    created_at?: string;
    updated_at?: string;
    notifications_enabled?: boolean;
    organisation_id?: string;
    role?: string;
    status?: string;
    subscription_type?: string;
};

export type UserDetails = {
    plan_limits: PlanLimits;
    user: UserInfo;
    updated_at?: string; // local cache timestamp (ISO string)
};

/**
 * Retrieves the monitor URL from localStorage.
 */
export function getMonitorUrl(): string | null {
  if (typeof window === "undefined") return null; // Ensure we're on the client

  try {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) return null;

    const userData: UserData = JSON.parse(userDataString);
    return userData.monitor_url || null;
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
    return null;
  }
}

export function getUserData(): UserData | null {
  if (typeof window === "undefined") return null; // Ensure we're on the client

  try {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) return null;

    const userData: UserData = JSON.parse(userDataString);
    return userData;
  } catch (error) {
    console.error("Error parsing userData from localStorage:", error);
    return null;
  }
}

export function getUserPlan(): string | null {
  if (typeof window === "undefined") return null; // Ensure we're on the client
    const userData = getUserData();
    return userData?.plan || PLAN_TYPES.FREE;
}

/**
 * Removes user-related data from localStorage.
 */
export function deleteUserData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("userData");
  } catch (error) {
    console.error("Error clearing user data from localStorage:", error);
  }
}

/**
 * Updates the monitor URL in localStorage. If userData exists, only updates the monitor_url.
 * If no userData exists, does nothing.
 */
export function updateMonitorUrl(newUrl: string): void {
  if (typeof window === "undefined") return;

  try {
    const userDataString = localStorage.getItem("userData");

    if (userDataString) {
      const existingData = JSON.parse(userDataString);
      const updatedData = { ...existingData, monitor_url: newUrl };
      localStorage.setItem("userData", JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error("Error updating monitor_url in localStorage:", error);
  }
}

/**
 * Checks if user data is present in localStorage, indicating authentication.
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const userDataString = localStorage.getItem("userData");

    // Returns true if the item exists and is not an empty string
    return !!userDataString;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    // Return false in case of any localStorage access error
    return false;
  }
}

/**
 * Retrieves user details from localStorage and checks its freshness.
 * If the cached details are fresh (less than 5 minutes old), returns the cached details.
 * If the cached details are stale, fetches the details from the microservice.
 * @param {boolean} forceFetchFromMicroservice - Force fetching from the microservice regardless of cache freshness.
 * @returns {Promise<UserDetails | null>} - A promise that resolves to the user details if successful, or null if not.
 */
export async function getUserDetailsCached(forceFetchFromMicroservice = false): Promise<UserDetails | null> {
  if (typeof window === "undefined") return null; // Ensure we're on the client

  try {
    const userDetailsString = localStorage.getItem("userDetails");
    if (!userDetailsString) return null;

    if (!forceFetchFromMicroservice) {
      try {
        const cached: UserDetails = JSON.parse(userDetailsString);
        if (cached.updated_at) {
          const cachedTime = Date.parse(cached.updated_at);
          if (!isNaN(cachedTime)) {
            const ageMs = Date.now() - cachedTime;
            if (ageMs < 5 * 60 * 1000) {
              // fresh cache
              return cached;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing cached user details:", e);
      }
    }

    const data: UserDetails | null = await getUserDetails();
    // store with local timestamp
    if (!data) {
      return null;
    } 
    setUserDetails(data);
    return data;
  } catch (error) {
    console.error("Error parsing userDetails from localStorage:", error);
    return null;
  }
}

/**
 * Store user details in localStorage with local updated_at timestamp.
 */
export function setUserDetails(details: UserDetails): void {
  if (typeof window === "undefined") return;
  try {
    const toStore = { ...details, updated_at: new Date().toISOString() };
    localStorage.setItem("userDetails", JSON.stringify(toStore));
  } catch (error) {
    console.error("Error storing userDetails in localStorage:", error);
  }
}