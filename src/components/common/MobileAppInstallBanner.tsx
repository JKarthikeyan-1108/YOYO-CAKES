import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { isNativePlatform, isPWA, isMobileDevice, triggerHaptic } from '@/services/mobileService';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function MobileAppInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const isIOS = typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

  useEffect(() => {
    // If running inside native app or standalone PWA, never show install banner
    if (isNativePlatform() || isPWA()) return;

    // Check if dismissed in last 7 days
    const dismissedUntil = localStorage.getItem('yoyo_pwa_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Listen for beforeinstallprompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on mobile iOS safari, show banner after a gentle delay
    if (isIOS && isMobileDevice()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    triggerHaptic('medium');

    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIOSInstructions(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } catch {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    setIsVisible(false);
    setShowIOSInstructions(false);
    // Dismiss for 7 days
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('yoyo_pwa_dismissed_until', String(nextWeek));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Floating App Banner */}
      <aside 
        aria-label="Install mobile application"
        className="fixed top-2 sm:top-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-md mx-auto sm:mx-0 animate-slide-up"
      >
        <div className="bg-[var(--color-brand-surface)] border-2 border-[var(--color-brand-primary)] rounded-2xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
          
          {/* Brand Logo & Text */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--color-brand-border)] flex-shrink-0 bg-[var(--color-brand-cream)] p-0.5">
              <img
                src="/images/logo.png"
                alt="YOYO App"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-heading text-xs sm:text-sm font-black text-[var(--color-brand-chocolate)] leading-tight truncate">
                  YOYO CAKES App
                </p>
                <span className="bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] text-[9px] font-black uppercase px-1.5 py-0.2 rounded-sm flex-shrink-0">
                  FAST
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-brand-muted)] font-medium leading-tight truncate mt-0.5">
                1-Tap Ordering • Live Kitchen Tracking
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Download size={13} /> Install
            </button>
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream)] flex items-center justify-center transition-colors"
              aria-label="Dismiss app banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS "Add to Home Screen" Bottom Sheet Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--color-brand-surface)] rounded-t-3xl sm:rounded-3xl p-6 border border-[var(--color-brand-border)] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Native drag handle */}
            <div className="w-12 h-1.5 rounded-full bg-[var(--color-brand-border)] mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img src="/images/logo.png" alt="" className="w-9 h-9 rounded-xl border border-[var(--color-brand-border)]" />
                <div>
                  <h3 className="font-heading text-base font-extrabold text-[var(--color-brand-chocolate)]">
                    Install YOYO CAKES
                  </h3>
                  <p className="text-xs text-[var(--color-brand-muted)]">Add to your Home Screen in 2 taps</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-8 h-8 rounded-full bg-[var(--color-brand-cream)] text-[var(--color-brand-muted)] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 my-5 text-xs text-[var(--color-brand-chocolate)]">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  1
                </div>
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    Tap the Share button <Share size={13} className="text-[var(--color-brand-primary)]" />
                  </p>
                  <p className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                    Found at the bottom menu bar in Safari or Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  2
                </div>
                <div>
                  <p className="font-bold flex items-center gap-1.5">
                    Select "Add to Home Screen" <PlusSquare size={13} className="text-[var(--color-brand-primary)]" />
                  </p>
                  <p className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                    Scroll down in the share sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Zero download wait • Instant launch</span>
              </div>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-xl bg-[var(--color-brand-primary)] text-white text-xs font-bold shadow-xs active:scale-95"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
