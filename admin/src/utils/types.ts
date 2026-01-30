export interface MonitorResponseData {
    data: {
        monitor: Monitor;
    }
    status: string;
}

export interface MonitorData {
    monitor: Monitor;
}

export interface Monitor {
    id: string;
    service_last_checks: {
        default: {
            uptime: {
                last_status: string;
            }
        }
    };
    is_enabled: boolean;
}