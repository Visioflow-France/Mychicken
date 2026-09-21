import type { Metadata } from 'next';
import AdminApp from '@/components/admin/AdminApp';
import './admin.css';

export const metadata: Metadata = {
  title: 'Administration — My CHICKEN',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
