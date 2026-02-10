/**
 * Returns a human-readable message based on SSL certificate chain details.
 */
function getSecurityCertMessage(meta?: any): string {
  if (!meta?.chain || !Array.isArray(meta.chain)) {
    return "Security certificates check completed";
  }

  const leafCert = meta.chain.find((c: any) => c.depth === 0)?.info;
  if (!leafCert) return "Unable to verify SSL certificate chain";

  const { daysUntilExpiry, isExpired } = leafCert;

  if (isExpired) {
    return "Certificate has expired!";
  }

  if (daysUntilExpiry <= 0) {
    return "Expires today.";
  }

  if (daysUntilExpiry <= 7) {
    return `Expiring soon (in ${daysUntilExpiry} day${
      daysUntilExpiry > 1 ? "s" : ""
    })!`;
  }

  if (daysUntilExpiry <= 15) {
    return `Expires in ${daysUntilExpiry} days. Consider renewing soon.`;
  }

  return `Valid for ${daysUntilExpiry} more day${
    daysUntilExpiry > 1 ? "s" : ""
  }.`;
}

/**
 * Builds success response for valid SSL checks.
 */
export function buildSslSuccessResponse(raw: any) {
  const meta = raw?.result?.details?.ssl?.meta || {};
  const durationMs = raw?.result?.durationMs ?? null;

  const leafCert = meta?.chain?.find((c: any) => c.depth === 0)?.info;
  const daysUntilExpiry = leafCert?.daysUntilExpiry ?? null;
  const isExpired = leafCert?.isExpired ?? false;

  let status: "success" | "warning" | "error" = "success";

  if (isExpired) {
    status = "error";
  } else if (daysUntilExpiry !== null && daysUntilExpiry <= 15) {
    status = "warning";
  }

  return {
    status,
    message: getSecurityCertMessage(meta),
    data: raw,
  };
}

/**
 * Builds error response when SSL check fails at microservice level.
 */
export function buildSslErrorResponse(raw: any) {
  const sslDetails = raw?.result?.details?.ssl || {};
  const summary = raw?.result?.summary || {};
  const errorMsg =
    sslDetails?.error ??
    summary?.message ??
    "Unknown error from SSL check service";

  return {
    status: "error",
    message: "Failed to get SSL certificate report",
    error: errorMsg,
    data: raw,
  };
}