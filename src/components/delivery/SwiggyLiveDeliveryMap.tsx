import { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle2,
  Share2,
  Play,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/services/mobileService';
import { type Order, type OrderStatus } from '@/lib/orders';

interface SwiggyLiveDeliveryMapProps {
  order: Order;
  className?: string;
  autoSimulate?: boolean;
}

// 5-Stage Swiggy / Zepto delivery milestones
const LIVE_STAGES: {
  key: OrderStatus;
  title: string;
  subtitle: string;
  etaMins: number;
  icon: string;
}[] = [
  { key: 'placed', title: 'Order Confirmed', subtitle: 'Kitchen team assigned & preheating', etaMins: 45, icon: '📋' },
  { key: 'confirmed', title: 'Confirmed by Patisserie', subtitle: 'Ingredients measured & sponge layered', etaMins: 40, icon: '👨‍🍳' },
  { key: 'preparing', title: 'Baking & Ganache Glaze', subtitle: 'Crisp chocolate shell & velvet cocoa dust', etaMins: 30, icon: '🎂' },
  { key: 'ready', title: 'Packed in Insulated Cold-Box', subtitle: 'Quality-checked & sealed at 4°C', etaMins: 20, icon: '❄️' },
  { key: 'out_for_delivery', title: 'Rider on the Way', subtitle: 'Live GPS tracked on route to you', etaMins: 12, icon: '🛵' },
  { key: 'delivered', title: 'Delivered at Doorstep', subtitle: 'Enjoy your fresh eggless bake!', etaMins: 0, icon: '🎉' },
];

export default function SwiggyLiveDeliveryMap({
  order,
  className = '',
  autoSimulate = true,
}: SwiggyLiveDeliveryMapProps) {
  // Simulation progress between 0% (at bakery) and 100% (at doorstep)
  const initialProgress =
    order.orderStatus === 'delivered'
      ? 100
      : order.orderStatus === 'out_for_delivery'
      ? 45
      : order.orderStatus === 'ready'
      ? 20
      : 5;

  const [progress, setProgress] = useState(initialProgress);
  const [isSimulating, setIsSimulating] = useState(() => Boolean(autoSimulate && order.orderStatus === 'out_for_delivery'));

  // Dynamic ETA calculation
  const remainingMinutes = Math.max(
    0,
    Math.round(25 * (1 - progress / 100))
  );

  const riderName = order.dispatchDetails?.riderName || 'Karthik Raja';
  const riderPhone = order.dispatchDetails?.riderPhone || '9840123456';
  const destinationAddress =
    order.deliveryAddressSnapshot?.addressLine1 ||
    order.customer.address ||
    'Anna Nagar West, Chennai';

  // Smooth live transit simulation
  useEffect(() => {
    let interval: any = null;
    if (isSimulating && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1.2;
          if (next >= 100) {
            triggerHaptic('success');
            toast.success('🎉 Delivery partner arrived at your doorstep!', { duration: 5000, icon: '🎂' });
            setIsSimulating(false);
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, progress]);

  const handleToggleSimulation = () => {
    triggerHaptic('medium');
    if (progress >= 100) {
      setProgress(15);
      setIsSimulating(true);
      toast.success('Live GPS simulation restarted!');
    } else {
      setIsSimulating(!isSimulating);
      toast.success(isSimulating ? 'Tracking paused' : 'Live rider movement simulated!');
    }
  };

  const handleCopyTrackingLink = async () => {
    triggerHaptic('light');
    const url = `${window.location.origin}/track/${order.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Live tracking link copied to clipboard!');
    } catch {
      toast.success(`Tracking link: ${url}`);
    }
  };

  // SVG Curving Route Geometry
  // Point A (Bakery Kitchen): 60, 220
  // Control Point 1: 180, 80
  // Control Point 2: 320, 260
  // Point B (Customer Doorstep): 440, 90
  const pathData = 'M 60 220 C 180 80, 320 260, 440 90';

  // Calculate approximate point along cubic bezier path based on progress (0 to 1)
  const t = Math.min(Math.max(progress / 100, 0), 1);
  const p0 = { x: 60, y: 220 };
  const p1 = { x: 180, y: 80 };
  const p2 = { x: 320, y: 260 };
  const p3 = { x: 440, y: 90 };

  const oneMinusT = 1 - t;
  const riderX =
    Math.pow(oneMinusT, 3) * p0.x +
    3 * Math.pow(oneMinusT, 2) * t * p1.x +
    3 * oneMinusT * Math.pow(t, 2) * p2.x +
    Math.pow(t, 3) * p3.x;

  const riderY =
    Math.pow(oneMinusT, 3) * p0.y +
    3 * Math.pow(oneMinusT, 2) * t * p1.y +
    3 * oneMinusT * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y;

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Top Telemetry Bar */}
      <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 relative">
            <Truck size={24} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--color-brand-surface)] animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Live GPS Active
              </span>
              <span className="text-xs text-[var(--color-brand-muted)] font-mono">
                Order #{order.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--color-brand-chocolate)] mt-0.5">
              {progress >= 100
                ? 'Arrived at your Doorstep! 🎉'
                : `Arriving in ~${remainingMinutes} Mins`}
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)]">
              {progress >= 100
                ? 'Delivered in shock-isolated cold container'
                : `Partner ${riderName} is on the way with your cake`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleToggleSimulation}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
              isSimulating
                ? 'bg-amber-500 text-neutral-900 font-black'
                : 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)] text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <RotateCcw size={14} className="animate-spin" /> Pause Radar
              </>
            ) : progress >= 100 ? (
              <>
                <Play size={14} /> Replay Route
              </>
            ) : (
              <>
                <Play size={14} /> Simulate Live Transit
              </>
            )}
          </button>

          <button
            onClick={handleCopyTrackingLink}
            className="p-2 bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] hover:text-[var(--color-brand-primary)] rounded-xl cursor-pointer active:scale-95 transition-all"
            title="Share Live Tracking Link"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Swiggy / Zepto Style Animated Route Map Container */}
      <div className="relative bg-[#1A120E] text-white rounded-2xl overflow-hidden border border-[#3E271D] shadow-lg">
        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-[#241712]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#4E342B] flex items-center gap-2 pointer-events-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-amber-100">
              Swiggy / Zepto Fast Express Route
            </span>
          </div>

          <div className="bg-[#241712]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#4E342B] text-[11px] font-mono text-amber-200 pointer-events-auto">
            {Math.round(progress)}% of trip completed
          </div>
        </div>

        {/* Vector Interactive Map Canvas */}
        <div className="relative w-full h-[280px] sm:h-[340px] bg-gradient-to-br from-[#1C110C] via-[#241712] to-[#140C08] flex items-center justify-center select-none overflow-hidden">
          {/* Subtle Grid Roads Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* SVG Map Layer */}
          <svg
            viewBox="0 0 500 300"
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C9A184" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#22C55E" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#EAB308" stopOpacity="0.8" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* City Street Road Grid Lines */}
            <path d="M 20 50 L 480 50" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M 20 150 L 480 150" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M 20 250 L 480 250" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M 120 20 L 120 280" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M 260 20 L 260 280" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />
            <path d="M 380 20 L 380 280" stroke="#3A251C" strokeWidth="2" strokeDasharray="4 6" />

            {/* Inactive Base Route Shadow */}
            <path
              d={pathData}
              fill="none"
              stroke="#2C1B14"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Active Highlighted Polyline Route */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              className="animate-pulse"
            />

            {/* Origin Marker: YOYO Central Patisserie */}
            <g transform={`translate(${p0.x}, ${p0.y})`}>
              <circle r="18" fill="#7F5643" fillOpacity="0.3" />
              <circle r="12" fill="#C9A184" />
              <circle r="5" fill="#1C110C" />
              <text
                x="0"
                y="26"
                textAnchor="middle"
                fill="#F3E5DC"
                fontSize="9"
                fontWeight="bold"
              >
                YOYO Central Kitchen
              </text>
            </g>

            {/* Destination Marker: Customer Home */}
            <g transform={`translate(${p3.x}, ${p3.y})`}>
              <circle r="22" fill="#22C55E" fillOpacity="0.2" className="animate-ping" />
              <circle r="14" fill="#22C55E" />
              <path d="M -5 -2 L 0 -7 L 5 -2 L 3 -2 L 3 4 L -3 4 L -3 -2 Z" fill="#FFFFFF" />
              <text
                x="0"
                y="26"
                textAnchor="middle"
                fill="#86EFAC"
                fontSize="9"
                fontWeight="bold"
              >
                Your Doorstep
              </text>
            </g>

            {/* Live Moving Delivery Partner (Scooter / Cold-Van) */}
            <g transform={`translate(${riderX}, ${riderY})`} filter="url(#glow)">
              {/* Radar Wave Pulse */}
              <circle r="24" fill="#EAB308" fillOpacity="0.2" className="animate-ping" />
              <circle r="16" fill="#F59E0B" fillOpacity="0.4" />
              <circle r="11" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
              {/* Scooter/Vehicle silhouette */}
              <text x="0" y="4" textAnchor="middle" fontSize="12">
                🛵
              </text>
            </g>
          </svg>

          {/* Floating Rider Live Tooltip Tag */}
          <div
            className="absolute pointer-events-none transition-all duration-300"
            style={{
              left: `${(riderX / 500) * 100}%`,
              top: `${(riderY / 300) * 100}%`,
              transform: 'translate(-50%, -140%)',
            }}
          >
            <div className="bg-[#2D1B13] border border-[#D4A373] text-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{riderName}</span>
              <span className="text-amber-300 font-mono">({Math.round(progress)}%)</span>
            </div>
          </div>
        </div>

        {/* Cold-Chain Security & Live Status Banner */}
        <div className="bg-[#241712] border-t border-[#3E271D] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center flex-shrink-0">
              ❄️
            </span>
            <div>
              <p className="font-bold text-amber-100">
                Cold-Chain Thermally Insulated Transit
              </p>
              <p className="text-[11px] text-amber-200/70">
                Cake held at 4.2°C • Zero melting guarantee with shock absorption
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] font-mono text-amber-200/80">
              Avg Speed: <strong className="text-white">28 km/h</strong>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              GPS Signal: High Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Swiggy / Zepto Delivery Partner Card */}
      <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] font-black text-base flex items-center justify-center border border-[var(--color-brand-primary)]/30 flex-shrink-0">
              {riderName[0]}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-[var(--color-brand-chocolate)]">
                  {riderName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  ⭐ 4.9 (1,240 deliveries)
                </span>
              </div>
              <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
                Express Patisserie Delivery Specialist • Insulated Van
              </p>
              <p className="text-[11px] text-[var(--color-brand-muted)] mt-1 flex items-center gap-1">
                <MapPin size={11} className="text-emerald-600 flex-shrink-0" />
                <span>To: <strong className="text-[var(--color-brand-chocolate)]">{destinationAddress}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Call & WhatsApp Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${riderPhone}`}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-cream-dark)] border border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Phone size={14} className="text-emerald-600" />
              <span>Call Partner</span>
            </a>

            <a
              href={`https://wa.me/91${riderPhone}?text=${encodeURIComponent(
                `Hello ${riderName}, I am checking on my YOYO CAKES order #${order.id}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Swiggy / Zepto Multi-Stage Timeline */}
      <div className="bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-brand-chocolate)] mb-4">
          Fulfillment Milestones
        </h3>

        <div className="space-y-4">
          {LIVE_STAGES.map((stg, i) => {
            const isCompleted =
              order.orderStatus === 'delivered' ||
              (order.orderStatus === 'out_for_delivery' && i <= 4) ||
              (order.orderStatus === 'ready' && i <= 3) ||
              (order.orderStatus === 'preparing' && i <= 2) ||
              (order.orderStatus === 'confirmed' && i <= 1) ||
              i === 0;

            const isCurrent =
              (order.orderStatus === 'delivered' && i === 5) ||
              (order.orderStatus === 'out_for_delivery' && i === 4) ||
              (order.orderStatus === 'ready' && i === 3) ||
              (order.orderStatus === 'preparing' && i === 2) ||
              (order.orderStatus === 'confirmed' && i === 1) ||
              (order.orderStatus === 'placed' && i === 0);

            return (
              <div key={stg.key} className="flex items-start gap-3.5 relative">
                {/* Connector line */}
                {i < LIVE_STAGES.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 bottom-0 w-0.5 -mb-4 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-[var(--color-brand-border)]'
                    }`}
                  />
                )}

                {/* Step Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[var(--color-brand-primary)] text-white ring-4 ring-[var(--color-brand-primary)]/20'
                      : 'bg-[var(--color-brand-surface-elevated)] text-[var(--color-brand-muted)] border border-[var(--color-brand-border)]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : <span>{stg.icon}</span>}
                </div>

                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isCurrent
                          ? 'text-[var(--color-brand-chocolate)] font-black'
                          : isCompleted
                          ? 'text-[var(--color-brand-chocolate)]'
                          : 'text-[var(--color-brand-muted)]'
                      }`}
                    >
                      {stg.title}
                    </h4>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-brand-muted)] mt-0.5">
                    {stg.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
