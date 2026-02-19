import { formatMessage } from '../utils/helpers';

/**
 * Returns a human-readable message for domain checks.
 */
function getDomainCheckMessage(meta?: any): string {
  if (!meta) return 'Domain check completed';
  if (meta?.message) return meta.message;

  const { domainExpired, domainExpiring, domainDays } = meta;

  if (domainExpired) {
    return 'Domain has expired! Immediate renewal is required.';
  }

  if (domainExpiring) {
    return 'Domain is expiring soon! Please renew your registration.';
  }

  if (domainDays <= 7) {
    return `Expiring in ${domainDays} day${domainDays > 1 ? 's' : ''}! Renew immediately.`;
  }

  if (domainDays <= 15) {
    return `Expires in ${domainDays} days. Consider renewing soon.`;
  }

  if (domainDays <= 30) {
    return `Valid for ${domainDays} more days. Renewal window approaching.`;
  }

  if (domainDays > 365) {
    return 'Renewed for more than a year.';
  }

  return 'Domain is active and healthy.';
}

/**
 * Builds success response for valid domain checks.
 */
export function buildDomainSuccessResponse(raw: any) {
  const meta = raw?.result?.details?.domain?.meta || {};
  const durationMs = raw?.result?.durationMs ?? null;

  const domainExpired = meta?.domainExpired ?? false;
  const domainExpiring = meta?.domainExpiring ?? false;
  const domainDays = meta?.domainDays ?? null;

  let status: 'success' | 'warning' | 'error' = 'success';

  if (domainExpired) {
    status = 'error';
  } else if (domainExpiring || meta?.message || (domainDays !== null && domainDays <= 30)) {
    status = 'warning';
  }

  return {
    status,
    message: getDomainCheckMessage(meta),
    data: raw,
  };
}

/**
 * Builds error response when domain check fails at microservice level.
 */
export function buildDomainErrorResponse(raw: any) {
  const domainDetails = raw?.result?.details?.domain || {};
  const summary = raw?.result?.summary || {};
  const errorMsg =
    domainDetails?.error ?? summary?.message ?? 'Unknown error from domain check service';

  return {
    status: 'error',
    message: 'Failed to get domain report',
    error: formatMessage(errorMsg),
    data: raw,
  };
}
