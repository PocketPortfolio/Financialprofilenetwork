/**
 * Device analytics utilities for mobile UX optimization
 * Tracks device category and mobile-specific interactions
 */

import { getDeviceInfo, DeviceCategory } from '../utils/device';

// Analytics event types for mobile
export type MobileAnalyticsEvent = 
  | 'device_category_detected'
  | 'mobile_nav_tap'
  | 'mobile_card_expand'
  | 'mobile_filter_open'
  | 'mobile_csv_submit'
  | 'mobile_sheet_open'
  | 'mobile_sheet_close'
  | 'mobile_touch_target_tap'
  | 'mobile_pull_to_refresh'
  | 'mobile_form_submit'
  | 'mobile_file_upload'
  | 'mobile_swipe_gesture';

export interface MobileAnalyticsPayload {
  device_category: DeviceCategory;
  viewport_width: number;
  viewport_height: number;
  has_touch: boolean;
  user_agent?: string;
  timestamp: number;
  // Event-specific data
  event_data?: Record<string, any>;
}

/**
 * Track device category on first page load
 */
export function trackDeviceCategory(): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: Date.now(),
    };

    // Emit to analytics (replace with your analytics provider)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'device_category_detected', {
        device_category: payload.device_category,
        viewport_width: payload.viewport_width,
        viewport_height: payload.viewport_height,
        has_touch: payload.has_touch,
      });
    }

    console.log('📱 Device category detected:', payload);
  } catch (error) {
    console.error('Failed to track device category:', error);
  }
}

/**
 * Track mobile navigation interactions
 */
export function trackMobileNavTap(target: string): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        target,
        interaction_type: 'navigation',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_nav_tap', {
        target,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile nav tap:', payload);
  } catch (error) {
    console.error('Failed to track mobile nav tap:', error);
  }
}

/**
 * Track mobile card interactions
 */
export function trackMobileCardExpand(cardType: string, action: 'expand' | 'collapse'): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        card_type: cardType,
        action,
        interaction_type: 'card_expand',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_card_expand', {
        card_type: cardType,
        action,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile card expand:', payload);
  } catch (error) {
    console.error('Failed to track mobile card expand:', error);
  }
}

/**
 * Track mobile filter interactions
 */
export function trackMobileFilterOpen(filterType: string): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        filter_type: filterType,
        interaction_type: 'filter_open',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_filter_open', {
        filter_type: filterType,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile filter open:', payload);
  } catch (error) {
    console.error('Failed to track mobile filter open:', error);
  }
}

/**
 * Track mobile CSV import
 */
export function trackMobileCsvSubmit(fileCount: number, fileSize: number): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        file_count: fileCount,
        total_size: fileSize,
        interaction_type: 'csv_submit',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_csv_submit', {
        file_count: fileCount,
        total_size: fileSize,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile CSV submit:', payload);
  } catch (error) {
    console.error('Failed to track mobile CSV submit:', error);
  }
}

/**
 * Track mobile sheet/modal interactions
 */
export function trackMobileSheetOpen(sheetType: string): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        sheet_type: sheetType,
        interaction_type: 'sheet_open',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_sheet_open', {
        sheet_type: sheetType,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile sheet open:', payload);
  } catch (error) {
    console.error('Failed to track mobile sheet open:', error);
  }
}

export function trackMobileSheetClose(sheetType: string, duration: number): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        sheet_type: sheetType,
        duration_ms: duration,
        interaction_type: 'sheet_close',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_sheet_close', {
        sheet_type: sheetType,
        duration_ms: duration,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile sheet close:', payload);
  } catch (error) {
    console.error('Failed to track mobile sheet close:', error);
  }
}

/**
 * Track touch target interactions
 */
export function trackMobileTouchTarget(targetType: string, targetId: string): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        target_type: targetType,
        target_id: targetId,
        interaction_type: 'touch_target',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_touch_target_tap', {
        target_type: targetType,
        target_id: targetId,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile touch target:', payload);
  } catch (error) {
    console.error('Failed to track mobile touch target:', error);
  }
}

/**
 * Track form submissions on mobile
 */
export function trackMobileFormSubmit(formType: string, success: boolean): void {
  try {
    const deviceInfo = getDeviceInfo();
    
    const payload: MobileAnalyticsPayload = {
      device_category: deviceInfo.category,
      viewport_width: deviceInfo.width,
      viewport_height: deviceInfo.height,
      has_touch: deviceInfo.hasTouch,
      timestamp: Date.now(),
      event_data: {
        form_type: formType,
        success,
        interaction_type: 'form_submit',
      },
    };

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_form_submit', {
        form_type: formType,
        success,
        device_category: payload.device_category,
      });
    }

    console.log('📱 Mobile form submit:', payload);
  } catch (error) {
    console.error('Failed to track mobile form submit:', error);
  }
}

/**
 * Initialize mobile analytics
 * Call this on app startup
 */
export function initializeMobileAnalytics(): void {
  if (typeof window === 'undefined') {
    return; // SSR
  }

  // Track device category on first load
  trackDeviceCategory();

  // Track viewport changes
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      trackDeviceCategory();
    }, 250);
  });

  console.log('📱 Mobile analytics initialized');
}






