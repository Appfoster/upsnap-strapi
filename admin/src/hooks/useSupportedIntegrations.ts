import { useState, useEffect, useCallback } from "react";
import { request } from "../utils/helpers";

// Types for supported integrations API response
export interface ConfigField {
  name: string;
  label: string;
  type: "email" | "url" | "password" | "text" | "phone_array";
  required: boolean;
  placeholder: string;
  description: string;
}

export interface ConfigSchema {
  fields: ConfigField[];
}

export interface SupportedChannel {
  type: string;
  label: string;
  description: string;
  icon: string;
  config_schema: ConfigSchema;
}

export interface SupportedIntegrationsResponse {
    supportedIntegrationsData: {
        status: string;
        message: string;
        data: {
            channels: SupportedChannel[];
        };
    }
}

// Sidebar filter categories mapping
export const SIDEBAR_FILTER_CATEGORIES: Record<
  string,
  {
    id: string;
    name: string;
    channelTypes: string[];
    enabled: boolean;
  }
> = {
  my: {
    id: "my",
    name: "My Integrations",
    channelTypes: [], // Shows user's integrations, not filtered by type
    enabled: true,
  },
  all: {
    id: "all",
    name: "All",
    channelTypes: [], // Shows all available channels
    enabled: true,
  },
  chat: {
    id: "chat",
    name: "Chat",
    channelTypes: ["google_chat", "telegram", "slack", "discord"],
    enabled: true,
  },
  email_sms: {
    id: "email_sms",
    name: "Email & SMS",
    channelTypes: ["email", "sms"],
    enabled: true,
  },
  custom: {
    id: "custom",
    name: "Custom",
    channelTypes: ["webhook"],
    enabled: true,
  },
};

export type SidebarFilterId = keyof typeof SIDEBAR_FILTER_CATEGORIES;

export function useSupportedIntegrations() {
  const [channels, setChannels] = useState<SupportedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportedIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await request("/integrations/supported", {
        method: "GET"
      });
      if (!data) return;

      if (!data) {
        throw new Error("Failed to fetch supported integrations");
      }

      if (data.supportedIntegrationsData.status === "success") {
        setChannels(data.supportedIntegrationsData.data.channels);
      } else {
        throw new Error(data.supportedIntegrationsData.message || "Failed to fetch supported integrations");
      }
    } catch (err) {
      console.error("Error fetching supported integrations:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportedIntegrations();
  }, [fetchSupportedIntegrations]);

  // Filter channels by sidebar category
  const getChannelsByFilter = useCallback(
    (filterId: SidebarFilterId): SupportedChannel[] => {
      const filter = SIDEBAR_FILTER_CATEGORIES[filterId];

      // My integrations handled separately in the page component
      if (!filter || filterId === "my") {
        return [];
      }

      // "all" filter returns all channels
      if (filterId === "all") {
        return channels;
      }

      // Filter by channel types specified in the filter category
      if (filter.channelTypes && filter.channelTypes.length > 0) {
        return channels.filter((channel) =>
          filter.channelTypes.includes(channel.type)
        );
      }

      // Default: return all channels if no specific types defined
      return channels;
    },
    [channels]
  );

  // Get channel by type
  const getChannelByType = useCallback(
    (type: string): SupportedChannel | undefined => {
      return channels.find((channel) => channel.type === type);
    },
    [channels]
  );

  return {
    channels,
    loading,
    error,
    refetch: fetchSupportedIntegrations,
    getChannelsByFilter,
    getChannelByType,
  };
}
