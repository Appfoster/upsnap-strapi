import { formatMessage } from "../utils/helpers";

/**
 * Returns a human-readable message based on the given HTTP status code.
 */
function getStatusMessage(statusCode?: number) : string {
  if (statusCode === undefined || statusCode === null) return "Status check completed";
  if (statusCode >= 200 && statusCode < 300) return "All good";
  if (statusCode >= 300 && statusCode < 400) return "Redirection detected, but reachable";
  if (statusCode >= 400 && statusCode < 500) return "Client error detected";
  if (statusCode >= 500) return "Server error detected";
  return "Status check completed";
}

/**
 * Normalize success response when microservice returns an internal "ok: true"
 */
export function buildReachabilitySuccessResponse(raw: any) {
  const meta = raw?.result?.details?.uptime?.meta || null;
  const durationMs = raw?.result?.durationMs ?? null;

  return {
    status: "success",
    message: getStatusMessage(meta?.statusCode),
    data: raw,
  };
}

/**
 * Normalize error response when microservice returns an internal "ok: false"
 */
export function buildReachabilityErrorResponse(raw: any) {
  const uptime = raw?.result?.details?.uptime || {};
  const summary = raw?.result?.summary || {};
  const errorMsg = uptime?.error ?? summary?.message ?? "Unknown error from healthcheck service";

  return {
    status: "error",
    message: "Failed to get the reachability reports",
    error: formatMessage(errorMsg),
    data: raw,
  };
}