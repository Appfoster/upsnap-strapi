export type TokenStatus = {
  status: string;
  plan: string | null;
  planLimits: unknown;
  monitorsCount: number | null;
  checkedAt: string;
};

export type BillingStatus = {
  planName: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  checkedAt: string;
};

export type ExpiryAlert = {
  monitorId: string;
  monitorName: string;
  type: 'ssl' | 'domain';
  daysRemaining: number;
};

export type ExpirySummary = {
  alerts: ExpiryAlert[];
  checkedAt: string;
};

export type UpsnapSettings = {
  token: string;
  primaryMonitorId?: string;
  installationTracked?: boolean;
  installId?: string;
  tokenStatus?: TokenStatus;
  billingStatus?: BillingStatus;
  expirySummary?: ExpirySummary;
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
      };
    };
    durationMs: number;
  };
}

export interface Summary {
  ok: boolean;
  message: string;
}
