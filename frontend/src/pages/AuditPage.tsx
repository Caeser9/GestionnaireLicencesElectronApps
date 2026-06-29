import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/services';
import { PageHeader, DataTable, LoadingSpinner } from '../components/ui';
import { PaginatedResponse } from '../types';
import { formatDate } from '../utils';

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  description: string;
  user?: { firstName: string; lastName: string; email: string };
  createdAt: string;
}

export default function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => statsApi.auditLogs().then((r) => r.data.data as PaginatedResponse<AuditLog>),
  });

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (val: unknown) => formatDate(val as string),
    },
    {
      key: 'user',
      label: 'Utilisateur',
      render: (val: unknown) => {
        const u = val as AuditLog['user'];
        return u ? `${u.firstName} ${u.lastName}` : 'Système';
      },
    },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Ressource' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div>
      <PageHeader
        title="Journal d'audit"
        description="Historique de toutes les actions administratives"
      />
      {isLoading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      )}
    </div>
  );
}
