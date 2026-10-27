
interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = true,
}: BrandLogoProps) {
  // Dimension tokens
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-xl sm:text-2xl', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm' },
  }[size];

  const isWhite = variant === 'white';

  const logoMark = (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeMap.icon} group`}>
      <img
        src="/images/logo.png"
        alt="YOYO CAKES"
        className="w-full h-full object-contain drop-shadow-md rounded-full transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          // If image fails, switch display to inline SVG fallback
          (e.currentTarget as HTMLElement).style.display = 'none';
          const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
          if (fallback) fallback.style.display = 'block';
        }}
      />
      {/* Artisanal Cake Emblem SVG Fallback */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105 hidden"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="yoyoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5B88F" />
            <stop offset="50%" stopColor="#C9A184" />
            <stop offset="100%" stopColor="#7F5643" />
          </linearGradient>

          <linearGradient id="yoyoChocoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#302219" />
            <stop offset="60%" stopColor="#241914" />
            <stop offset="100%" stopColor="#17110F" />
          </linearGradient>

          <radialGradient id="yoyoFlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4EA" />
            <stop offset="40%" stopColor="#C9A184" />
            <stop offset="100%" stopColor="#7F5643" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="47" fill="url(#yoyoChocoGrad)" stroke="url(#yoyoGoldGrad)" strokeWidth="3" />
        <circle cx="50" cy="50" r="43" fill="none" stroke="#C9A184" strokeWidth="0.8" strokeDasharray="2 3" />

        <path
          d="M22 66C22 62 26 59 31 59H69C74 59 78 62 78 66V74C78 78 74 81 69 81H31C26 81 22 78 22 74V66Z"
          fill="url(#yoyoGoldGrad)"
        />

        <path
          d="M22 66C25 68 28 69 31 67C34 65 37 68 40 69C43 70 46 66 50 67C54 68 57 70 60 67C63 65 66 69 70 67C74 65 77 68 78 66V69C76 72 73 70 70 72C67 74 64 71 61 73C58 75 54 72 50 74C46 72 43 75 39 73C36 71 33 74 30 72C27 70 24 72 22 69V66Z"
          fill="#241914"
        />

        <path
          d="M29 47C29 44 32 42 36 42H64C68 42 71 44 71 47V56C71 58 68 60 64 60H36C32 60 29 58 29 56V47Z"
          fill="#FFF8F0"
        />
        <path d="M29 51C36 53 43 50 50 52C57 54 64 51 71 52V56H29V51Z" fill="url(#yoyoGoldGrad)" />

        <path
          d="M37 32C37 30 39 28 42 28H58C61 28 63 30 63 32V39C63 41 61 43 58 43H42C39 43 37 41 37 39V32Z"
          fill="url(#yoyoGoldGrad)"
        />

        <rect x="48" y="16" width="4" height="11" rx="2" fill="#E8D8CE" stroke="#7F5643" strokeWidth="0.6" />
        <line x1="48.5" y1="19" x2="51.5" y2="18" stroke="#7F5643" strokeWidth="1" />
        <line x1="48.5" y1="23" x2="51.5" y2="22" stroke="#7F5643" strokeWidth="1" />

        <ellipse cx="50" cy="11" rx="4" ry="6" fill="url(#yoyoFlameGlow)" />
        <ellipse cx="50" cy="11.5" rx="2.2" ry="4" fill="#E8D8CE" />
        <ellipse cx="50" cy="12.5" rx="1.2" ry="2.2" fill="#FFFFFF" />

        <path d="M18 42L19 45L22 46L19 47L18 50L17 47L14 46L17 45L18 42Z" fill="#C9A184" />
        <path d="M82 42L83 45L86 46L83 47L82 50L81 47L78 46L81 45L82 42Z" fill="#C9A184" />
        <circle cx="50" cy="74" r="1.5" fill="#E8D8CE" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{logoMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {logoMark}

      <div>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`font-heading ${sizeMap.text} font-black tracking-tight leading-none ${
              isWhite ? 'text-white' : 'text-[var(--color-brand-chocolate)]'
            }`}
          >
            YOYO
          </span>
          <span
            className={`font-heading ${sizeMap.text} font-bold tracking-widest leading-none ${
              isWhite ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-brand-primary)] dark:text-[var(--color-brand-primary)]'
            }`}
          >
            CAKES
          </span>
        </div>

        {showTagline && (
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`font-sans ${sizeMap.sub} font-bold uppercase tracking-[0.16em] leading-tight ${
                isWhite ? 'text-[var(--color-brand-primary)]/90' : 'text-[var(--color-brand-muted)]'
              }`}
            >
              Every bite, a little happier
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
