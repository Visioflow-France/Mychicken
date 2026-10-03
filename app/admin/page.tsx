import type { Metadata, Viewport } from 'next';
import AdminApp from '@/components/admin/AdminApp';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration — My CHICKEN',
  robots: { index: false, follow: false },
  /* Manifest dédié : le dashboard s'installe comme app à part (PWA) */
  manifest: '/admin-manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#3d2617',
};

export default function AdminPage() {
  return <AdminApp />;
}
