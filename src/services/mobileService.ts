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
  type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> {
  try {
    if (Capacitor.isPluginAvailable('Haptics')) {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'selection') {
        if (Capacitor.isNativePlatform()) {
          await Haptics.selectionStart();
        } else {
          await Haptics.impact({ style: ImpactStyle.Light });
        }
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
      if (type === 'selection') navigator.vibrate(8);
      else if (type === 'light') navigator.vibrate(12);
      else if (type === 'medium') navigator.vibrate(28);
      else if (type === 'heavy') navigator.vibrate(45);
      else if (type === 'success') navigator.vibrate([20, 40, 20]);
      else if (type === 'warning') navigator.vibrate([30, 30]);
      else if (type === 'error') navigator.vibrate([60, 40, 60]);
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }
}

/**
 * Convenient shorthand object for invoking haptics.
 */
export const haptic = {
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
  selection: () => triggerHaptic('selection'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
};

/**
 * Automatically binds tactile haptic feedback to interactive elements across the site.
 * Elements with [data-haptic="light|medium|heavy|success|selection"] or buttons/tabs
 * trigger tactile response seamlessly.
 */
export function initHapticListeners(): () => void {
  if (typeof window === 'undefined') return () => {};

  let lastHapticTime = 0;

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const now = Date.now();
    // Throttle rapid clicks to at least 40ms to prevent actuator queuing
    if (now - lastHapticTime < 40) return;

    // 1. Explicit data-haptic override
    const hapticEl = target.closest('[data-haptic]') as HTMLElement | null;
    if (hapticEl) {
      const type = (hapticEl.getAttribute('data-haptic') || 'light') as any;
      lastHapticTime = now;
      triggerHaptic(type);
      return;
    }

    // 2. Buttons, interactive links, tabs, and checkboxes/radios
    const interactive = target.closest(
      'button:not([data-no-haptic]), [role="button"]:not([data-no-haptic]), [role="tab"]:not([data-no-haptic]), .btn:not([data-no-haptic]), input[type="radio"], input[type="checkbox"]'
    );
    if (interactive) {
      lastHapticTime = now;
      triggerHaptic('light');
    }
  };

  document.addEventListener('click', handleClick, { capture: true, passive: true });
  return () => {
    document.removeEventListener('click', handleClick, { capture: true });
  };
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
