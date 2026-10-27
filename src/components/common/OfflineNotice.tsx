import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { setupNetworkListener } from '@/services/mobileService';

export default function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    return setupNetworkListener((online) => {
      setIsOnline(online);
    });
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-700 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md animate-fade-in">
      <WifiOff size={14} />
      <span>You are currently offline. You can still browse cached artisanal cakes & desserts!</span>
    </div>
  );
}
