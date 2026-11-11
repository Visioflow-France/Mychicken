import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import AdminApp from '@/components/admin/AdminApp';
import './admin.css';

/* Manifest et icônes selon le sous-domaine : chaque restaurant installe
   « sa » PWA (icône Persan ou Saint-Mard), même URL /admin partout. */
export async function generateMetadata(): Promise<Metadata> {
  const host = ((await headers()).get('host') || '').toLowerCase().split(':')[0];
  const sm = host.startsWith('saint-mard.') || host.startsWith('saintmard.') || host.startsWith('sm.');
  const persan = host.startsWith('persan.');
  const base: Metadata = {
    title: 'Administration — My CHICKEN',
    robots: { index: false, follow: false },
  };
  if (persan) {
    return { ...base, manifest: '/admin-manifest-ps.webmanifest', icons: { icon: '/admin-icon-ps-192.png', apple: '/admin-icon-ps-192.png' }, appleWebApp: { capable: true, title: 'MC Persan', statusBarStyle: 'black-translucent' } };
  }
  if (sm) {
    return { ...base, manifest: '/admin-manifest-sm.webmanifest', icons: { icon: '/admin-icon-sm-192.png', apple: '/admin-icon-sm-192.png' }, appleWebApp: { capable: true, title: 'MC Saint-Mard', statusBarStyle: 'black-translucent' } };
  }
  return { ...base, manifest: '/admin-manifest.webmanifest' };
}

export const viewport: Viewport = {
  themeColor: '#3d2617',
};

export default function AdminPage() {
  return <AdminApp />;
}
