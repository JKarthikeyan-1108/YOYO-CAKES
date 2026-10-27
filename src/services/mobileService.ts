import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Checks if the application is running in a native Capacitor shell (Android / iOS).
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Checks if the application is running as an installed PWA (Home Screen standalone mode).
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = Boolean((window.navigator as any).standalone);
  return isStandalone || isIOSStandalone;
}

/**
 * Checks if user is on a mobile device (phone / tablet).
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

/**
 * Triggers native haptic tactile feedback.
 * Uses Capacitor Haptics on native devices with a fallback to Web Vibration API.
 */
export async function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> {
  try {
    if (Capacitor.isPluginAvailable('Haptics')) {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
      return;
    }
  } catch {
    // Graceful fallback for web browsers
  }

  // Web Vibration API fallback
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') navigator.vibrate(10);
      else if (type === 'medium') navigator.vibrate(25);
      else if (type === 'heavy') navigator.vibrate(45);
      else if (type === 'success') navigator.vibrate([20, 40, 20]);
      else if (type === 'error') navigator.vibrate([50, 50, 50]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

/**
 * Synchronizes the native status bar theme color on iOS / Android.
 */
export async function syncMobileStatusBar(isDark: boolean): Promise<void> {
  const color = isDark ? '#17110F' : '#FFF8F0';

  // 1. Sync native Capacitor StatusBar plugin if available
  try {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color });
      }
    }
  } catch {
    // Ignore error on platforms without native status bar
  }

  // 2. Sync browser HTML theme-color meta tag
  if (typeof document !== 'undefined') {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }
  }
}

/**
 * Initializes native Android back button and app lifecycle event listeners.
 */
export function initMobileAppListeners(onBackNavigate?: () => void): () => void {
  if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('App')) {
    return () => {};
  }

  let backListenerRemove: (() => Promise<void>) | null = null;

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && onBackNavigate) {
      onBackNavigate();
    } else if (canGoBack && typeof window !== 'undefined') {
      window.history.back();
    } else {
      App.exitApp();
    }
  }).then((handle) => {
    backListenerRemove = handle.remove;
  }).catch(() => {});

  return () => {
    if (backListenerRemove) {
      backListenerRemove().catch(() => {});
    }
  };
}

/**
 * Listens for online/offline connectivity changes.
 */
export function setupNetworkListener(onChange: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
