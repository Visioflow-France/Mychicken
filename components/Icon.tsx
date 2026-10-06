import type { ImgHTMLAttributes, ReactNode, SVGProps } from 'react';

/* ================================================================
   Jeu d'icônes « premium » — trait arrondi fin, style Flaticon.
   Toutes les icônes héritent de currentColor.
   ================================================================ */

export type IconName =
  | 'pin'
  | 'scooter'
  | 'clock'
  | 'phone'
  | 'heart'
  | 'lock'
  | 'bag'
  | 'arrowRight'
  | 'check'
  | 'menu'
  | 'close'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'utensils'
  | 'flame'
  | 'arrowUp'
  | 'arrowDown'
  | 'tag'
  | 'eye'
  | 'eyeOff';

const PATHS: Record<IconName, ReactNode> = {
  pin: (
    <>
      <path d="M12 21.5S5 15.6 5 10.3a7 7 0 0 1 14 0c0 5.3-7 11.2-7 11.2Z" />
      <circle cx="12" cy="10.2" r="2.7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  phone: (
    <path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.6 19.6 0 0 1-3-8.6 2 2 0 0 1 2-2.2h2.6a2 2 0 0 1 2 1.7c.13.95.36 1.9.7 2.8a2 2 0 0 1-.45 2.1l-1.1 1.1a15.8 15.8 0 0 0 5.9 5.9l1.1-1.1a2 2 0 0 1 2.1-.45c.9.34 1.85.57 2.8.7a2 2 0 0 1 1.65 2.05Z" />
  ),
  heart: (
    <path d="M20.8 4.6a5.6 5.6 0 0 0-7.9 0L12 5.5l-.9-.9a5.6 5.6 0 0 0-7.9 7.9l.9.9L12 21.2l7.9-7.8.9-.9a5.6 5.6 0 0 0 0-7.9Z" />
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 7h13l1.2 13.2a1.5 1.5 0 0 1-1.5 1.6H5.8a1.5 1.5 0 0 1-1.5-1.6L5.5 7Z" />
      <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  check: <path d="M4.5 12.5 9.5 17.5 19.5 7" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4 7h16M10 4h4M6.5 7l.9 13a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-13" />
      <path d="M10 11.5v5.5M14 11.5v5.5" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  scooter: (
    <>
      <circle cx="5.5" cy="17" r="2.6" />
      <circle cx="18.5" cy="17" r="2.6" />
      <path d="M5.5 17h4l2.3-8.5h3.4" />
      <path d="M14 11.7 15.8 6h2.7" />
      <path d="M18.5 6.2l1.4 5a2.6 2.6 0 0 0 2.5 1.9" />
      <path d="M12 8.5l-.8 3.2" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8M4.5 3v4a2.5 2.5 0 0 0 5 0V3M7 11v10" />
      <path d="M17.5 3c-2 1.8-3 4-3 6.5V12h3v9" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  ),
  arrowUp: <path d="M12 19.5V5M5.5 11 12 4.5 18.5 11" />,
  arrowDown: <path d="M12 4.5V19M18.5 13 12 19.5 5.5 13" />,
  tag: (
    <>
      <path d="M20.6 13.4 11 3.8A2 2 0 0 0 9.6 3.2H5a2 2 0 0 0-2 2v4.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8Z" />
      <circle cx="7.8" cy="7.8" r="1.4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.5 17.5 0 0 1-3.2 3.9M6.6 7.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5a9.3 9.3 0 0 0 4-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/* ================================================================
   Marque de la maison — logo officiel (découpé du flyer Persan).
   Utilisé dans l'admin et le footer.
   ================================================================ */

export function RoosterMark({ size = 40, ...rest }: { size?: number } & ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: '50%' }} {...rest} />
  );
}
