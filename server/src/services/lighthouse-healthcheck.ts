import { LIGHTHOUSE_CHECKS } from "../utils/constants";

/**
 * Returns a readable message based on Lighthouse category scores.
 */
function getLighthouseMessage(meta?: any): string {
  if (!meta) return "Lighthouse audit completed";

  const categories = ["performance", "accessibility", "bestPractices", "seo", "pwa"];
  const lowScores = categories.filter(
    (cat) => meta[cat]?.score !== undefined && meta[cat]?.score < 50
  );
  const mediumScores = categories.filter(
    (cat) => meta[cat]?.score >= 50 && meta[cat]?.score < 90
  );

  if (lowScores.length > 0)
    return `Poor scores.`;
  if (mediumScores.length > 0)
    return `Some scores could be improved.`;
  return "Excellent.";
}

/**
 * Builds success response for valid Lighthouse audits.
 */
export function buildLighthouseSuccessResponse(raw: any) {
  const meta = raw?.result?.details?.lighthouse?.meta || {};
  const durationMs = raw?.result?.durationMs ?? null;

  // Determine overall status
  const categories = LIGHTHOUSE_CHECKS;
  const allScores = categories.map((cat) => meta[cat]?.score ?? null);
  const minScore = Math.min(...allScores.filter((v) => v !== null));

  let status: "success" | "warning" | "error" = "success";
  if (minScore < 50) status = "warning";
  else if (minScore < 90) status = "warning";

  return {
    status,
    message: getLighthouseMessage(meta),
    data: raw,
  };
}

/**
 * Builds error response when Lighthouse audit fails.
 */
export function buildLighthouseErrorResponse(raw: any) {
  const lighthouseDetails = raw?.result?.details?.lighthouse || {};
  const summary = raw?.result?.summary || {};
  const errorMsg =
    lighthouseDetails?.error ??
    summary?.message ??
    "Unknown error from Lighthouse audit service";

  return {
    status: "error",
    message: "Failed to get Lighthouse report",
    error: errorMsg,
    data: raw,
  };
}