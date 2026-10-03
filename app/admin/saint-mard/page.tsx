import type { Metadata, Viewport } from 'next';
import AdminApp from '@/components/admin/AdminApp';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Admin Saint-Mard — My CHICKEN',
  robots: { index: false, follow: false },
  /* PWA dédiée Saint-Mard : s'installe avec sa propre icône */
  manifest: '/admin-manifest-sm.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#3d2617',
};

export default function AdminSaintMardPage() {
  return <AdminApp initialLocation="saint-mard" />;
}
