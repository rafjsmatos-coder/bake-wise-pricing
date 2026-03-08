import { useState } from 'react';
import { AdminLayout, AdminPageType } from '@/components/layout/AdminLayout';
import { UserManagement } from '@/components/admin/UserManagement';
import { SupportManagement } from '@/components/admin/SupportManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { UpdatesManagement } from '@/components/admin/UpdatesManagement';
import { AuditLogsManagement } from '@/components/admin/AuditLogsManagement';

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<AdminPageType>('stats');

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'stats' && <AdminStats />}
      {currentPage === 'users' && <UserManagement />}
      {currentPage === 'support' && <SupportManagement />}
      {currentPage === 'updates' && <UpdatesManagement />}
      {currentPage === 'audit' && <AuditLogsManagement />}
    </AdminLayout>
  );
}
