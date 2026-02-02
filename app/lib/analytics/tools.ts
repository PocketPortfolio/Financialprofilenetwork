/**
 * Tool Usage Analytics
 * Tracks usage of SEO monetization tools
 */

import { trackMicroConversion, trackConversion, trackFunnelStage, trackFunnelDropOff } from './conversion';

export type ToolType = 'tax_converter' | 'google_sheets' | 'advisor_tool' | 'ticker_csv';

export interface ToolUsageMetadata {
  toolType: ToolType;
  sourceBroker?: string;
  targetSoftware?: string;
  ticker?: string;
  fileSize?: number;
  fileType?: string;
  maxSize?: number;
  tradeCount?: number;
  conversionPair?: string;
  apiKeyType?: 'demo' | 'custom';
  hasCorporateLicense?: boolean;
  hasLogo?: boolean;
  success?: boolean;
  errorType?: string;
  errorMessage?: string;
  copiedContent?: 'formula' | 'link' | 'data';
}

/**
 * Track tool page view
 */
export function trackToolPageView(toolType: ToolType, metadata?: Partial<ToolUsageMetadata>): void {
  trackFunnelStage('landing', `tool_${toolType}`, {
    tool_type: toolType,
    ...metadata
  });

  trackMicroConversion('button_click', {
    elementId: `tool_${toolType}_page`,
    elementType: 'page_view',
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    metadata: {
      tool_type: toolType,
      ...metadata
    }
  });

  // Also track to Firestore
  trackToolUsageToFirestore(toolType, 'page_view', metadata).catch(() => {
    // Fail silently
  });
}

/**
 * Track tool interaction start
 */
export function trackToolInteraction(
  toolType: ToolType,
  action: 'file_upload' | 'formula_generate' | 'ticker_input' | 'logo_upload',
  metadata?: Partial<ToolUsageMetadata>
): void {
  trackMicroConversion('form_start', {
    elementId: `${toolType}_${action}`,
    elementType: 'tool_interaction',
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    metadata: {
      tool_type: toolType,
      action,
      ...metadata
    }
  });

  // Also track to Firestore
  trackToolUsageToFirestore(toolType, action, metadata).catch(() => {
    // Fail silently
  });
}

/**
 * Track successful tool conversion
 */
export function trackToolSuccess(
  toolType: ToolType,
  metadata?: Partial<ToolUsageMetadata>
): void {
  trackConversion(`tool_${toolType}_success`, 1, 'USD', {
    tool_type: toolType,
    ...metadata
  });

  // Track as funnel completion
  trackFunnelStage('activated', `tool_${toolType}`, {
    tool_type: toolType,
    success: true,
    ...metadata
  });

  // Track to Firestore with success flag
  trackToolUsageToFirestore(toolType, 'success', {
    ...metadata,
    success: true
  }).catch(() => {
    // Fail silently
  });
}

/**
 * Track tool download/export
 */
export function trackToolDownload(
  toolType: ToolType,
  fileType: 'csv' | 'pdf' | 'formula',
  metadata?: Partial<ToolUsageMetadata>
): void {
  trackMicroConversion('download_start', {
    elementId: `${toolType}_download_${fileType}`,
    elementType: 'download',
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    value: 1,
    metadata: {
      tool_type: toolType,
      file_type: fileType,
      ...metadata
    }
  });

  // Also track as conversion
  trackConversion(`tool_${toolType}_download`, 1, 'USD', {
    tool_type: toolType,
    file_type: fileType,
    ...metadata
  });

  // Track to Firestore
  trackToolUsageToFirestore(toolType, `download_${fileType}`, metadata).catch(() => {
    // Fail silently
  });
}

/**
 * Track tool error/drop-off
 */
export function trackToolError(
  toolType: ToolType,
  errorType: string,
  metadata?: Partial<ToolUsageMetadata>
): void {
  trackFunnelDropOff('landing', errorType, {
    tool_type: toolType,
    error_type: errorType,
    ...metadata
  });

  // Track to Firestore
  trackToolUsageToFirestore(toolType, 'error', {
    ...metadata,
    errorType
  }).catch(() => {
    // Fail silently
  });
}

/**
 * Track copy to clipboard action
 */
export function trackToolCopy(
  toolType: ToolType,
  copiedContent: 'formula' | 'link' | 'data',
  metadata?: Partial<ToolUsageMetadata>
): void {
  trackMicroConversion('button_click', {
    elementId: `${toolType}_copy_${copiedContent}`,
    elementType: 'copy_button',
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    metadata: {
      tool_type: toolType,
      copied_content: copiedContent,
      ...metadata
    }
  });

  // Track to Firestore
  trackToolUsageToFirestore(toolType, 'copy', {
    ...metadata,
    copiedContent
  }).catch(() => {
    // Fail silently
  });
}

/**
 * Track tool usage to Firestore for admin dashboard
 */
export async function trackToolUsageToFirestore(
  toolType: ToolType,
  action: string,
  metadata?: Partial<ToolUsageMetadata>
): Promise<void> {
  try {
    await fetch('/api/tool-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolType,
        action,
        metadata
      })
    });
  } catch (error) {
    console.error('Failed to track tool usage:', error);
    // Fail silently - don't block user experience
  }
}

