import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Check, Sparkles, Clock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocationStore, POPULAR_DELIVERY_HUBS } from '@/stores/locationStore';

export default function DeliveryLocationModal() {
  const {
    currentLocation,
    isModalOpen,
    closeModal,
    setLocation,
    setPincode,
    detectCurrentGpsLocation,
    detecting,
  } = useLocationStore();

  const [pincodeInput, setPincodeInput] = useState(currentLocation.pincode);
  const [errorMsg, setErrorMsg] = useState('');
  const [gpsError, setGpsError] = useState('');
  const [cityTab, setCityTab] = useState<'All' | 'Chennai' | 'Coimbatore'>('All');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setPincodeInput(currentLocation.pincode);
      setCityTab(currentLocation.city === 'Coimbatore' ? 'Coimbatore' : 'All');
      setErrorMsg('');
      setGpsError('');
      // Small delay to allow DOM render
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isModalOpen, currentLocation.pincode, currentLocation.city]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) closeModal();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const handleApplyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = setPincode(pincodeInput);
    if (res.valid) {
      toast.success(res.message);
      closeModal();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleGpsDetect = async () => {
    setGpsError('');
    setErrorMsg('');

    // Check if geolocation API is available
    if (!navigator.geolocation) {
      setGpsError('Your browser does not support location detection. Please enter your PIN code manually.');
      return;
    }

    // Check permission state if available
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'denied') {
          setGpsError('Location access is blocked. Please enable it in your browser settings, or enter your PIN code manually.');
          return;
        }
      } catch {
        // permissions API not fully supported, continue
      }
    }

    try {
      const detected = await detectCurrentGpsLocation();
      toast.success(`📍 Location detected: ${detected.area}, ${detected.city}`);
      closeModal();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('denied') || msg.includes('permission')) {
        setGpsError('Location access was denied. Please allow location access in your browser or enter your PIN code manually.');
      } else if (msg.includes('timeout')) {
        setGpsError('Location detection timed out. Please try again or enter your PIN code manually.');
      } else if (msg.includes('unavailable')) {
        setGpsError('Location information is unavailable. Please enter your PIN code manually.');
      } else {
        setGpsError('Could not detect your location. Please enter your PIN code manually.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      aria-hidden="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl border-0 sm:border border-gray-100 overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <h2 id="location-modal-title" className="font-heading font-black text-base sm:text-lg text-gray-900 leading-tight">
                Choose Delivery Location
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Select your area for delivery estimates
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            onClick={closeModal}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Close location picker"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {/* Current Location Badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Currently Delivering To
                </span>
                <span className="font-extrabold text-sm text-gray-900 block">
                  {currentLocation.area}, {currentLocation.city} – {currentLocation.pincode}
                </span>
                <span className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                  <Clock size={11} className="text-emerald-700" aria-hidden="true" />
                  Est. <span className="font-bold text-emerald-800 ml-0.5">{currentLocation.estimatedTime}</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
              Active
            </span>
          </div>

          {/* GPS Detection */}
          <div>
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={detecting}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/40 hover:bg-amber-100/60 active:scale-[0.99] text-amber-950 font-bold text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-wait"
              aria-busy={detecting}
            >
              {detecting ? (
                <Loader2 size={18} className="animate-spin text-amber-600" aria-hidden="true" />
              ) : (
                <Navigation size={18} className="text-amber-600" aria-hidden="true" />
              )}
              <span>
                {detecting ? 'Detecting your location…' : 'Use My Current Location'}
              </span>
            </button>

            {gpsError && (
              <div
                role="alert"
                className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
              >
                <AlertCircle size={15} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-red-700 font-medium">{gpsError}</p>
              </div>
            )}
          </div>

          {/* Manual PIN Input */}
          <form onSubmit={handleApplyPincode} className="space-y-2">
            <label htmlFor="pincode-input" className="text-xs font-bold text-gray-800 block">
              Or enter your 6-digit PIN code
            </label>
            <div className="flex gap-2">
              <input
                id="pincode-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => {
                  setErrorMsg('');
                  setPincodeInput(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="e.g. 600040"
                className="flex-1 px-4 py-3 text-sm font-mono tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 min-h-[44px]"
                aria-describedby={errorMsg ? 'pincode-error' : undefined}
              />
              <button
                type="submit"
                className="px-4 py-3 bg-[var(--color-brand-primary-dark)] hover:bg-[var(--color-brand-chocolate)] text-white font-extrabold text-sm rounded-xl shadow-xs transition-colors min-h-[44px] flex-shrink-0"
              >
                Check &amp; Apply
              </button>
            </div>
            {errorMsg && (
              <p id="pincode-error" role="alert" className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle size={13} aria-hidden="true" /> {errorMsg}
              </p>
            )}
          </form>

          {/* Popular Hubs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Popular Delivery Areas
              </span>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                {(['All', 'Chennai', 'Coimbatore'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCityTab(tab)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      cityTab === tab
                        ? 'bg-white text-[var(--color-brand-chocolate)] shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {POPULAR_DELIVERY_HUBS
                .filter((hub) => cityTab === 'All' || hub.city === cityTab)
                .map((hub) => {
                  const isSelected = hub.pincode === currentLocation.pincode;
                  return (
                    <button
                      key={hub.pincode}
                      type="button"
                      onClick={() => {
                        setLocation(hub);
                        toast.success(`📍 Delivering to ${hub.area}, ${hub.city}`);
                        closeModal();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[var(--color-brand-primary-dark)] bg-amber-50/80 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-[var(--color-brand-primary-dark)] hover:bg-amber-50/30'
                      }`}
                      aria-pressed={isSelected}
                      aria-label={`${hub.area}, ${hub.city} – ${hub.estimatedTime}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-gray-900 block leading-tight truncate">
                            {hub.area}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {hub.city} • {hub.pincode}
                          </span>
                        </div>
                        {isSelected && <Check size={14} className="text-[var(--color-brand-chocolate)] flex-shrink-0" aria-hidden="true" />}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 block">
                        ⚡ {hub.estimatedTime}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--color-brand-primary-dark)]" aria-hidden="true" />
            Freshly baked to order daily
          </span>
          <button
            onClick={closeModal}
            className="text-xs font-bold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-200/60 transition-colors min-h-[44px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
