import type { ReactNode, SVGProps } from 'react';

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
  | 'arrowUp';

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
   Marque de la maison — coq stylisé (silhouette + pattes).
   Utilisée dans la navbar et le footer.
   ================================================================ */

export function RoosterMark({ size = 40, ...rest }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" {...rest}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.2 16.2 Q12.4 14.4 14 10.2 Q15 4.6 17 8.8 Q18.4 3.8 20.6 8.6 Q22.6 4.8 24.2 10.4 Q26.2 12.2 26.2 15.2 C27 18 29.6 19.7 32.6 20.1 C36 14.9 40.4 9.9 45.2 7.4 C43.5 11.7 41.2 14.5 38.9 16.4 L42.7 18.3 C40 19.6 38.2 20.5 36.9 21.3 L39.7 23.5 C37.6 24.2 35.6 24.7 33.5 24.9 C32.1 27.4 28.6 29.7 23.7 29.5 Q17.9 29.3 14.7 25.5 Q13.3 22.3 13.7 19.5 Q11.8 20.4 12 22.4 Q12.2 24 14 23.2 Q14.6 20.6 13.4 18.2 L9.2 16.2 Z M15.3 12.1 a1.15 1.15 0 1 0 0 2.3 a1.15 1.15 0 1 0 0-2.3 Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M22.5 29.3v6.2M26.5 28.9v6.6M20.2 35.5h4.6M24.4 35.5h4.6"
      />
    </svg>
  );
}
