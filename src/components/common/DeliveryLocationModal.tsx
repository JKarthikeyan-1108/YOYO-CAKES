import { useState } from 'react';
import { MapPin, Navigation, X, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocationStore, POPULAR_DELIVERY_HUBS } from '@/stores/locationStore';

export default function DeliveryLocationModal() {
  const { currentLocation, isModalOpen, closeModal, setLocation, setPincode, detectCurrentGpsLocation, detecting } =
    useLocationStore();

  const [pincodeInput, setPincodeInput] = useState(currentLocation.pincode);
  const [errorMsg, setErrorMsg] = useState('');

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
      toast.error(res.message);
    }
  };

  const handleGpsDetect = async () => {
    setErrorMsg('');
    try {
      const detected = await detectCurrentGpsLocation();
      toast.success(`Location detected: ${detected.area}, ${detected.city}!`);
    } catch {
      toast.error('Location detection permission denied or timed out. Please enter your PIN code.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <MapPin size={22} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-gray-900 leading-tight">
                Choose Delivery Location
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Check express delivery speeds and slot availability
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current Selection Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Delivering Currently To
                </span>
                <span className="font-extrabold text-sm text-gray-900 block">
                  {currentLocation.area}, {currentLocation.city} – {currentLocation.pincode}
                </span>
                <span className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                  <Clock size={11} className="text-emerald-700" />
                  Express Bakery Dispatch: <span className="font-bold text-emerald-800">{currentLocation.estimatedTime}</span>
                </span>
              </div>
            </div>
            <span className="badge badge-success badge-sm font-bold text-white text-[10px]">
              Active
            </span>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={detecting}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/40 hover:bg-amber-100/60 active:scale-[0.99] text-amber-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <Navigation size={16} className={`text-amber-600 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting current GPS coordinates...' : 'Use My Current Location (1-Click GPS)'}</span>
          </button>

          {/* Manual Pincode Input Form */}
          <form onSubmit={handleApplyPincode} className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 block">
              Or Enter 6-digit Delivery Pincode
            </label>
            <div className="join w-full">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => {
                  setErrorMsg('');
                  setPincodeInput(e.target.value.replace(/\D/g, ''));
                }}
                placeholder="e.g. 600040 or 641002"
                className="join-item input input-bordered flex-1 text-sm font-mono tracking-widest uppercase focus:outline-amber-600"
              />
              <button
                type="submit"
                className="join-item btn bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-extrabold px-5 text-xs shadow-2xs"
              >
                Check & Apply
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle size={13} /> {errorMsg}
              </p>
            )}
          </form>

          {/* Popular Delivery Hubs */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Popular Delivery Hubs
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                Chennai & Coimbatore
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {POPULAR_DELIVERY_HUBS.map((hub) => {
                const isSelected = hub.pincode === currentLocation.pincode;
                return (
                  <button
                    key={hub.pincode}
                    type="button"
                    onClick={() => {
                      setLocation(hub);
                      toast.success(`Location set to ${hub.area}, ${hub.city}!`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="font-bold text-xs text-gray-900 block leading-tight">
                          {hub.area}
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          {hub.city} • {hub.pincode}
                        </span>
                      </div>
                      {isSelected && <Check size={14} className="text-amber-700 flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
                      ⚡ {hub.estimatedTime}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            Free delivery on orders above ₹500
          </span>
          <button
            onClick={closeModal}
            className="text-xs font-bold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-200/60 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
