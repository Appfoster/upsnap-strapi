// import { useEffect, useMemo } from "react";
// import { getMonitorPollingService } from "../../utils/monitorPolling";
// import { request } from "../../utils/helpers";
// import { enrichMonitorWithPrimaryRegionStatus } from "../../utils/helpers";

// export function useMonitorPolling(
//   onMonitorUpdate?: (monitor: any) => void
// ) {
//   const pollingService = useMemo(
//     () => getMonitorPollingService(),
//     []
//   );

//   // Helper to fetch histogram for a single monitor
//   const fetchMonitorHistogram = async (monitorId: string) => {
//     try {
//       const res = await request(`/api/monitors/${monitorId}/histogram`);
//       if (!res) return undefined;
//       const data = await res.json();
//       if (data.status === "success") {
//         return data.data?.histogram;
//       }
//       return undefined;
//     } catch {
//       return undefined;
//     }
//   };

//   // Helper to fetch uptime stats for a single monitor
//   const fetchMonitorUptimeStats = async (monitorId: string) => {
//     try {
//       const res = await apiFetch(`/api/monitors/${monitorId}/${MONITOR_API_TYPES.UPTIME_STATS}`);
//       if (!res) return undefined;
//       const data = await res.json();
//       if (data.status === "success") {
//         return data.data?.uptime_stats;
//       }
//       return undefined;
//     } catch {
//       return undefined;
//     }
//   };

//   const fetchMonitorById = async (id: string) => {
//     const res = await apiFetch(`/api/monitors/${id}`);
//     const json = await res.json();
//     let monitor = enrichMonitorWithPrimaryRegionStatus(json.data.monitor);
//     // Fetch and append histogram data
//     const histogram = await fetchMonitorHistogram(id);
//     if (histogram) {
//       monitor = { ...monitor, histogram };
//     }
//     // Fetch and append uptime stats data
//     const uptime_stats = await fetchMonitorUptimeStats(id);
//     if (uptime_stats) {
//       monitor = { ...monitor, uptime_stats };
//     }
//     return monitor;
//   };

//   useEffect(() => {
//     if (!onMonitorUpdate) return;
//     return pollingService.subscribe(onMonitorUpdate);
//   }, [onMonitorUpdate, pollingService]);

//   const startPolling = (monitorId: string) => {
//     pollingService.start(monitorId, fetchMonitorById);
//   };

//   return { startPolling };
// }