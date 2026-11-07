// TypeScript declarations for HUNTX
declare module 'lucide-react' {
  import * as React from 'react';
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
  }
  export type Icon = React.FC<IconProps>;
  export const Shield: Icon;
  export const Sparkles: Icon;
  export const AlertCircle: Icon;
  export const Camera: Icon;
  export const X: Icon;
  export const CheckCircle: Icon;
  export const Crosshair: Icon;
  export const Zap: Icon;
  export const AlertTriangle: Icon;
  export const AlertOctagon: Icon;
  export const Check: Icon;
  export const ShieldAlert: Icon;
  export const Award: Icon;
  export const Play: Icon;
  export const LogOut: Icon;
  export const Radio: Icon;
  export const Bell: Icon;
  export const Map: Icon;
  export const Activity: Icon;
  export const QrCode: Icon;
  export const Users: Icon;
  export const Trophy: Icon;
  export const Sliders: Icon;
  export const Layers: Icon;
  export const UserCheck: Icon;
  export const Mail: Icon;
  export const Lock: Icon;
  export const User: Icon;
  export const ArrowLeft: Icon;
  export const KeyRound: Icon;
  export const MapPin: Icon;
  export const Clock: Icon;
  export const ArrowRight: Icon;
  export const Copy: Icon;
  export const Share2: Icon;
  export const Shuffle: Icon;
  export const Eye: Icon;
  export const Crown: Icon;
  export const UserX: Icon;
  export const Plus: Icon;
  export const Trash2: Icon;
  export const Save: Icon;
  export const Compass: Icon;
  export const XCircle: Icon;
  export const Volume2: Icon;
  export const VolumeX: Icon;
  export const Vibrate: Icon;
  export const ChevronRight: Icon;
  export const Flame: Icon;
  export const ShieldCheck: Icon;
  export const Info: Icon;
  const icons: Record<string, Icon>;
  export default icons;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
