/**
 * Returns a human-readable message based on mixed content meta.
 */
export function getMixedContentMessage(meta?: any): string {
  if (!meta) return 'Mixed content check completed';

  const mixedCount = meta.mixedCount ?? 0;

  if (mixedCount === 0) return 'No mixed content found.';
  if (mixedCount === 1) return '1 mixed content item detected.';
  return `${mixedCount} mixed content items detected!`;
}

/**
 * Normalize success response when microservice returns ok: true
 */
export function buildSuccessResponse(raw: any) {
  const meta = raw?.result?.details?.mixed_content?.meta || {};
  const durationMs = raw?.result?.durationMs ?? null;

  const mixedCount = meta?.mixedCount ?? 0;

  let status: 'success' | 'warning' | 'error' = 'success';
  if (mixedCount > 0) status = 'warning';

  return {
    status,
    message: getMixedContentMessage(meta),
    data: raw,
  };
}
