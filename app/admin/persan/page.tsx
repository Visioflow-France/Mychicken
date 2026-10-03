import type { Metadata, Viewport } from 'next';
import AdminApp from '@/components/admin/AdminApp';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Admin Persan — My CHICKEN',
  robots: { index: false, follow: false },
  /* PWA dédiée Persan : s'installe avec sa propre icône */
  manifest: '/admin-manifest-ps.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#3d2617',
};

export default function AdminPersanPage() {
  return <AdminApp initialLocation="persan" />;
}
