/* ===== Icons component — inline SVG icons for the Mafia UI ===== */

export function SkullIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8v2a1 1 0 001 1h6a1 1 0 001-1v-2c3-1.5 5-4.5 5-8 0-5-4-9-9-9z" />
      <line x1="10" y1="17" x2="10" y2="21" />
      <line x1="14" y1="17" x2="14" y2="21" />
    </svg>
  );
}

export function SearchIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ShieldIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function BallotIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M8 7l2 2 4-4" />
    </svg>
  );
}

export function MoonIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export function SunIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function SendIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function CopyIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function CrosshairIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

export function UserIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function TrophyIcon({ size = 24, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  );
}

export function HexBadgeIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 4.5v9L12 22l-8-6.5v-9L12 2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2l8 4.5v9L12 22l-8-6.5v-9L12 2z" />
    </svg>
  );
}

export function FrameIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" /><path d="M9 3v18" />
    </svg>
  );
}

export function HomeIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function ClockIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function StopwatchIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M12 5V2" />
      <path d="M9 2h6" />
      <path d="M19 6l-1.5 1.5" />
    </svg>
  );
}

export function FedoraIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M4 17.5C3 17.5 2 18 2 18.8c0 .7 1.8 1.2 5 1.2h10c3.2 0 5-.5 5-1.2 0-.8-1-1.3-2-1.3-1.5 0-2.8-.8-3.4-2.1l-.8-1.9c-.3-.7-.9-1.2-1.7-1.3-.8-.1-1.7.3-2.1 1l-.8 1.9c-.6 1.3-1.9 2.1-3.4 2.1H4z" opacity="0.9" />
      <path d="M7.5 14.5l.8-2c.4-.9 1.3-1.5 2.3-1.5h2.8c1 0 1.9.6 2.3 1.5l.8 2c-1.4-.7-3.2-1-4.7-1s-3.3.3-4.7 1z" opacity="0.6" />
      <path d="M9.2 11h5.6c.7 0 1.3-.4 1.6-1.1L17 7.2C17.3 6.3 16.6 5 15.5 5h-7C7.4 5 6.7 6.3 7 7.2l.6 2.7c.3.7.9 1.1 1.6 1.1z" />
    </svg>
  );
}

export function WomanIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.2.5 2.3 1.3 3.1-.9 1.3-1.8 3-1.8 5.4h10c0-2.4-.9-4.1-1.8-5.4.8-.8 1.3-1.9 1.3-3.1C16.5 4 14.5 2 12 2z" />
      <path d="M6 18c0 2 2.5 4 6 4s6-2 6-4v-1H6v1z" />
    </svg>
  );
}

export function PoliceBadgeIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l7 3.5v6c0 5-3.5 8.5-7 10.5-3.5-2-7-5.5-7-10.5v-6L12 2z" fill="#EAB308" fillOpacity="0.25" stroke="#FACC15" strokeWidth="1.5" />
      <polygon points="12,7 13.5,10.5 17,11 14.3,13.5 15,17 12,15.2 9,17 9.7,13.5 7,11 10.5,10.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
    </svg>
  );
}

export function CoffinIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2h8l3 6-3 14H8L5 8l3-6z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 7v8" />
      <path d="M9.5 10h5" />
    </svg>
  );
}

export function ScalesIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M4 7h16" />
      <path d="M4 7l-2 6c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5L6 7" />
      <path d="M18 7l-2 6c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5L20 7" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function HandshakeIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 17l-3-3 5-5 3 3-5 5z" />
      <path d="M18 10l3-3-4-4-3 3" />
      <path d="M2 12l4-4 4 4" />
      <path d="M14 14l2 2 4-4" />
    </svg>
  );
}

export function RibbonBadgeIcon({ size = 38, className = '' }) {
  return (
    <svg className={className} width={size} height={size * 1.25} viewBox="0 0 40 50" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7F1D1D" />
          <stop offset="100%" stopColor="#3F1015" />
        </linearGradient>
        <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF3B4E" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Ribbon tails */}
      <path d="M12 35l8 12 8-12V42l-8 7-8-7z" fill="#991B1B" />
      {/* Hex/shield main badge */}
      <path d="M20 4L34 11V29L20 40L6 29V11L20 4Z" fill="url(#ribbonGrad)" stroke="#EF4444" strokeWidth="1.5" filter="url(#badgeGlow)" />
      <path d="M20 8L30 13.5V26.5L20 35L10 26.5V13.5L20 8Z" fill="#18080C" stroke="#B91C1C" strokeWidth="1" />
      {/* Fedora inside */}
      <g transform="translate(11, 16) scale(0.75)" fill="#F87171">
        <path d="M4 17.5C3 17.5 2 18 2 18.8c0 .7 1.8 1.2 5 1.2h10c3.2 0 5-.5 5-1.2 0-.8-1-1.3-2-1.3-1.5 0-2.8-.8-3.4-2.1l-.8-1.9c-.3-.7-.9-1.2-1.7-1.3-.8-.1-1.7.3-2.1 1l-.8 1.9c-.6 1.3-1.9 2.1-3.4 2.1H4z" />
        <path d="M9.2 11h5.6c.7 0 1.3-.4 1.6-1.1L17 7.2C17.3 6.3 16.6 5 15.5 5h-7C7.4 5 6.7 6.3 7 7.2l.6 2.7c.3.7.9 1.1 1.6 1.1z" />
      </g>
    </svg>
  );
}

export function MobsterSilhouette({ className = '', style = {} }) {
  return (
    <div className={`mobster-silhouette ${className}`} style={{ position: 'relative', width: 90, height: 80, overflow: 'hidden', ...style }} aria-hidden="true">
      {/* Red smoke glow behind */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.2) 50%, transparent 75%)',
        filter: 'blur(10px)',
        borderRadius: '50%',
      }} />
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        {/* Mobster hat & body silhouette */}
        <g fill="#080B13" stroke="#2D1117" strokeWidth="0.8">
          {/* Fedora hat */}
          <ellipse cx="45" cy="22" rx="28" ry="4" fill="#0C101A" />
          <path d="M29 21c2-7 6-12 16-12 10 0 14 5 16 12-4-2-10-3-16-3-6 0-12 1-16 3z" fill="#090C15" />
          <path d="M31 20c3-1 9-2 14-2s11 1 14 2c-3 .5-9 1-14 1s-11-.5-14-1z" fill="#B91C1C" opacity="0.8" />
          {/* Head & neck shadow */}
          <path d="M38 24h14v10c0 4-3 7-7 7s-7-3-7-7V24z" fill="#090C15" />
          {/* Suit Collar & Tie */}
          <path d="M24 60l14-20 7 12 7-12 14 20c3 7 3 20 3 20H21s0-13 3-20z" fill="#0A0E1A" />
          {/* Shirt triangles */}
          <polygon points="41,40 45,48 43,40" fill="#E2E8F0" opacity="0.85" />
          <polygon points="49,40 45,48 47,40" fill="#CBD5E1" opacity="0.85" />
          {/* Red Tie */}
          <polygon points="44,46 46,46 47,65 45,69 43,65" fill="#EF4444" />
        </g>
      </svg>
    </div>
  );
}

export function PlusIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MedicalCrossIcon({ size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
    </svg>
  );
}

export function DetectiveSilhouette({ className = '', style = {} }) {
  return (
    <div className={`role-silhouette role-silhouette--detective ${className}`} style={{ position: 'relative', width: 90, height: 80, overflow: 'hidden', ...style }} aria-hidden="true">
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(109, 40, 217, 0.2) 50%, transparent 75%)',
        filter: 'blur(10px)',
        borderRadius: '50%',
      }} />
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <g fill="#080B13" stroke="#23173A" strokeWidth="0.8">
          <ellipse cx="44" cy="22" rx="26" ry="4" fill="#0E0A1E" />
          <path d="M30 21c2-7 6-12 14-12 9 0 13 5 15 12-4-2-9-3-15-3-5 0-10 1-14 3z" fill="#0A0817" />
          <path d="M31 20c3-1 8-2 13-2s10 1 13 2c-3 .5-8 1-13 1s-10-.5-13-1z" fill="#8B5CF6" opacity="0.8" />
          <path d="M38 24h12v10c0 4-3 7-6 7s-6-3-6-7V24z" fill="#0A0817" />
          <path d="M22 62l12-22 5 10 9-10 14 22c3 7 3 18 3 18H19s0-11 3-18z" fill="#0D0921" />
          <circle cx="58" cy="46" r="12" fill="rgba(139, 92, 246, 0.2)" stroke="#C084FC" strokeWidth="2" />
          <circle cx="58" cy="46" r="7" fill="none" stroke="#C084FC" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="67" y1="55" x2="77" y2="65" stroke="#A855F7" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function DoctorSilhouette({ className = '', style = {} }) {
  return (
    <div className={`role-silhouette role-silhouette--doctor ${className}`} style={{ position: 'relative', width: 90, height: 80, overflow: 'hidden', ...style }} aria-hidden="true">
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.45) 0%, rgba(13, 148, 136, 0.2) 50%, transparent 75%)',
        filter: 'blur(10px)',
        borderRadius: '50%',
      }} />
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <path d="M45 10 L68 20 V46 C68 62 45 72 45 72 C45 72 22 62 22 46 V20 Z" fill="#061C1A" stroke="#14B8A6" strokeWidth="1.5" />
        <path d="M45 15 L63 23.5 V44 C63 56.5 45 65 45 65 C45 65 27 56.5 27 44 V23.5 Z" fill="#082A27" stroke="#0D9488" strokeWidth="1" />
        <path d="M41 26h8v10h10v8H49v10h-8V44H31v-8h10V26z" fill="#2DD4BF" />
        <circle cx="45" cy="41" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function VillagerSilhouette({ className = '', style = {} }) {
  return (
    <div className={`role-silhouette role-silhouette--villager ${className}`} style={{ position: 'relative', width: 90, height: 80, overflow: 'hidden', ...style }} aria-hidden="true">
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(148, 163, 184, 0.35) 0%, rgba(71, 85, 105, 0.2) 50%, transparent 75%)',
        filter: 'blur(10px)',
        borderRadius: '50%',
      }} />
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <g fill="#0B101E" stroke="#253147" strokeWidth="0.8">
          <polygon points="18,52 26,42 34,52" fill="#131B2E" />
          <rect x="20" y="52" width="12" height="18" fill="#131B2E" />
          <polygon points="56,50 66,38 76,50" fill="#131B2E" />
          <rect x="58" y="50" width="16" height="20" fill="#131B2E" />
          <circle cx="45" cy="30" r="10" fill="#1A2338" stroke="#475569" strokeWidth="1" />
          <path d="M30 65c0-10 7-18 15-18s15 8 15 18v5H30v-5z" fill="#141C2E" stroke="#475569" strokeWidth="1" />
          <circle cx="45" cy="54" r="3" fill="#FDE047" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
}

const AVATAR_PALETTE = [
  '#38BDF8', // Sky
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#FB923C', // Orange
  '#2DD4BF', // Teal
  '#818CF8', // Indigo
  '#E879F9', // Fuchsia
  '#4ADE80', // Lime
  '#60A5FA', // Blue
  '#F87171', // Coral Red
];

export function getAvatarColor(name) {
  if (!name) return '#94A3B8';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

