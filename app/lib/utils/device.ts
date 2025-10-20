/**
 * Device detection utilities for responsive design and analytics
 * Provides device category detection and viewport information
 */

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  category: DeviceCategory;
  width: number;
  height: number;
  hasTouch: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Get device information based on viewport and user agent
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    // SSR fallback
    return {
      category: 'desktop',
      width: 1920,
      height: 1080,
      hasTouch: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Touch detection
  const hasTouch = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;

  // Device category detection
  let category: DeviceCategory;
  let isMobile = false;
  let isTablet = false;
  let isDesktop = false;

  // Mobile detection
  if (width < 768 || /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    category = 'mobile';
    isMobile = true;
  }
  // Tablet detection
  else if (width < 1024 || /ipad|android(?!.*mobile)/i.test(userAgent)) {
    category = 'tablet';
    isTablet = true;
  }
  // Desktop
  else {
    category = 'desktop';
    isDesktop = true;
  }

  return {
    category,
    width,
    height,
    hasTouch,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  return getDeviceInfo().isMobile;
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  return getDeviceInfo().isTablet;
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  return getDeviceInfo().isDesktop;
}

/**
 * Check if device has touch capability
 */
export function hasTouch(): boolean {
  return getDeviceInfo().hasTouch;
}

/**
 * Get current viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl'): boolean {
  const { width } = getViewportDimensions();
  
  switch (breakpoint) {
    case 'sm':
      return width >= 640;
    case 'md':
      return width >= 768;
    case 'lg':
      return width >= 1024;
    case 'xl':
      return width >= 1280;
    default:
      return false;
  }
}

/**
 * Get responsive class names based on device
 */
export function getResponsiveClasses(): string {
  const deviceInfo = getDeviceInfo();
  
  if (deviceInfo.isMobile) {
    return 'mobile';
  } else if (deviceInfo.isTablet) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Debounced resize handler for device changes
 */
export function onDeviceChange(callback: (deviceInfo: DeviceInfo) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let timeoutId: NodeJS.Timeout;
  
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(getDeviceInfo());
    }, 150);
  };

  window.addEventListener('resize', handleResize);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(timeoutId);
  };
}
