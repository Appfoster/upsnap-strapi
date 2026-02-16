export type UpsnapSettings = {
  token: string;
  primaryMonitorId?: string;
};

export interface Uptime {
  checkedAt: string;
  url: string;
  result: {
    summary: Summary;
    details: {
      uptime: {
        ok: boolean;
        meta: any;
      }
    };
    durationMs: number;
  }
}

export interface Summary {
  ok: boolean;
  message: string;
}