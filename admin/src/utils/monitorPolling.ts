type PollingEntry = {
  timeoutId: ReturnType<typeof setTimeout>;
};

const MONITOR_POLL_INTERVAL_MS = 30_000;

class MonitorPollingService {
  private activePolls = new Map<string, PollingEntry>();
  private subscribers = new Set<(monitor: any) => void>();

  subscribe(callback: (monitor: any) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(monitor: any) {
    this.subscribers.forEach(callback => callback(monitor));
  }

  start(
    monitorId: string,
    fetchFn: (id: string) => Promise<any>
  ) {
    if (this.activePolls.has(monitorId)) return;

    const poll = async () => {
      try {
        const monitor = await fetchFn(monitorId);

        // 🔥 broadcast to all subscribers
        this.notify(monitor);

        if (monitor.is_enabled === true && monitor.last_status === null) {
          const timeoutId = setTimeout(poll, MONITOR_POLL_INTERVAL_MS);
          this.activePolls.set(monitorId, { timeoutId });
        } else {
          this.stop(monitorId);
        }
      } catch {
        this.stop(monitorId);
      }
    };

    const timeoutId = setTimeout(poll, MONITOR_POLL_INTERVAL_MS);
    this.activePolls.set(monitorId, { timeoutId });
  }

  stop(monitorId: string) {
    const entry = this.activePolls.get(monitorId);
    if (entry) clearTimeout(entry.timeoutId);
    this.activePolls.delete(monitorId);
  }
}

let clientInstance: MonitorPollingService | null = null;

export function getMonitorPollingService() {
  if (typeof window === "undefined") {
    throw new Error("MonitorPollingService must be used on the client");
  }

  if (!clientInstance) {
    clientInstance = new MonitorPollingService();
  }

  return clientInstance;
}
