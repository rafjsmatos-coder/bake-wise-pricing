/**
 * Safe external URL opener that works on both mobile and desktop.
 * 
 * On mobile browsers (especially Safari iOS), window.open() after an await 
 * is blocked by popup blockers due to losing the "user gesture" context.
 * 
 * This helper handles navigation differently based on the device:
 * - Safari iOS & Mobile: Navigate in the same tab using location.assign()
 * - Desktop: Open in a new tab (pre-opened to avoid popup blocking)
 */

/**
 * Detects if the current browser is Safari on iOS
 */
const isSafariIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);
  return isIOS && isSafari;
};

/**
 * Detects if the current device is mobile
 */
const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

interface OpenExternalOptions {
  /**
   * Force same tab navigation even on desktop
   */
  forceSameTab?: boolean;
}

/**
 * Opens an external URL after an async operation.
 * Call this BEFORE the async operation to get a navigator function,
 * then call the navigator with the URL after the operation completes.
 * 
 * @example
 * const navigate = prepareExternalNavigation();
 * const url = await fetchCheckoutUrl();
 * navigate(url);
 */
export function prepareExternalNavigation(options: OpenExternalOptions = {}) {
  const { forceSameTab = false } = options;
  
  // Safari iOS and mobile: ALWAYS use same-tab navigation
  // This is the most reliable approach for these browsers
  if (isSafariIOS() || isMobile() || forceSameTab) {
    return (url: string | null) => {
      if (url) {
        // Use assign() which is more reliable than setting href directly
        window.location.assign(url);
      }
    };
  }
  
  // Desktop: pre-open a blank window synchronously (during user gesture)
  // This avoids popup blockers that trigger after async operations
  const newWindow = window.open('about:blank', '_blank');
  
  return (url: string | null) => {
    if (url && newWindow && !newWindow.closed) {
      newWindow.location.href = url;
    } else if (url) {
      // Fallback if window was blocked or closed
      window.location.assign(url);
    } else if (newWindow && !newWindow.closed) {
      // No URL returned, close the blank window
      newWindow.close();
    }
  };
}

/**
 * Simple check if we're on mobile
 */
export function isMobileDevice(): boolean {
  return isMobile();
}

/**
 * Simple check if we're on Safari iOS
 */
export function isSafariIOSDevice(): boolean {
  return isSafariIOS();
}
