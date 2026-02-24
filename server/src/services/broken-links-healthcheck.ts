import { formatMessage } from '../utils/helpers';

/**
 * Returns a human-readable message for broken link checks.
 */
function getBrokenLinksMessage(meta?: any): string {
  if (!meta) return 'Broken link check completed';

  const { broken = 0, redirected = 0 } = meta;

  if (broken === 0 && redirected === 0) return 'No broken links!';
  if (broken > 0) return `${broken} broken ${broken > 1 ? 'links' : 'link'} found.`;
  if (redirected > 0)
    return `${redirected} redirected ${redirected > 1 ? 'links' : 'link'} detected.`;

  return 'Scan completed with mixed results.';
}

/**
 * Normalize success response (ok: true)
 */
export function buildBrokenLinksSuccessResponse(raw: any) {
  const meta = raw?.result?.details?.broken_links?.meta || null;
  const durationMs = raw?.result?.durationMs ?? null;

  const { broken = 0, redirected = 0 } = meta || {};

  let status: 'success' | 'warning' = 'success';

  if (broken > 0 || redirected > 0) {
    status = 'warning';
  }

  return {
    status: status,
    message: getBrokenLinksMessage(meta),
    data: raw,
  };
}

/**
 * Normalize error response (ok: false)
 */
export function buildBrokenLinksErrorResponse(raw: any) {
  const brokenLinks = raw?.result?.details?.broken_links || {};
  const summary = raw?.result?.summary || {};
  const errorMsg =
    brokenLinks?.error ?? summary?.message ?? 'Unknown error from broken links check service';

  return {
    status: 'error',
    message: 'Failed to get broken links report',
    error: formatMessage(errorMsg),
    data: raw,
  };
}
