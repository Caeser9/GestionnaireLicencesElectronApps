import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pause, Play } from 'lucide-react';
import { licensesApi, clientsApi, catalogApi } from '../api/services';
import { PageHeader, DataTable, Modal, StatusBadge, LoadingSpinner } from '../components/ui';
import { License, PaginatedResponse, Client, Product, LicenseType, LicenseStatus, LICENSE_STATUS_LABELS } from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export default function LicensesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['licenses', statusFilter],
    queryFn: () => licensesApi.list({ status: statusFilter || undefined }).then((r) => r.data.data as PaginatedResponse<License>),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: () => clientsApi.list({ limit: 100 }).then((r) => r.data.data.items as Client[]),
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => catalogApi.products.list().then((r) => r.data.data.items as Product[]),
  });

  const { data: licenseTypes } = useQuery({
    queryKey: ['license-types-list'],
    queryFn: () => catalogApi.licenseTypes.list().then((r) => r.data.data.items as LicenseType[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => licensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setShowModal(false);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => licensesApi.suspend(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licenses'] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => licensesApi.reactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licenses'] }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate(Object.fromEntries(form.entries()));
  };

  const columns = [
    { key: 'licenseKey', label: 'Clé' },
    {
      key: 'client',
      label: 'Client',
      render: (val: unknown) => typeof val === 'object' && val ? (val as Client).companyName : '-',
    },
    {
      key: 'product',
      label: 'Produit',
      render: (val: unknown) => typeof val === 'object' && val ? (val as Product).name : '-',
    },
    {
      key: 'licenseType',
      label: 'Type',
      render: (val: unknown) => typeof val === 'object' && val ? (val as LicenseType).name : '-',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val: unknown) => (
        <StatusBadge status={val as string} label={LICENSE_STATUS_LABELS[val as LicenseStatus]} />
      ),
    },
    {
      key: 'expiresAt',
      label: 'Expiration',
      render: (val: unknown) => formatDate(val as string),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Record<string, unknown>) => {
        const license = row as unknown as License;
        if (!hasRole(UserRole.ADMIN)) return null;
        return (
          <div className="flex gap-2">
            {license.status === LicenseStatus.ACTIVE && (
              <button
                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                title="Suspendre"
                onClick={(e) => { e.stopPropagation(); suspendMutation.mutate(license._id); }}
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
            {license.status === LicenseStatus.SUSPENDED && (
              <button
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Réactiver"
                onClick={(e) => { e.stopPropagation(); reactivateMutation.mutate(license._id); }}
              >
                <Play className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Licences"
        description="Gestion des licences logicielles"
        actions={
          hasRole(UserRole.ADMIN) && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Nouvelle licence
            </button>
          )
        }
      />

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(LICENSE_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle licence">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Client *</label>
            <select name="client" className="input" required>
              <option value="">Sélectionner...</option>
              {clients?.map((c) => <option key={c._id} value={c._id}>{c.companyName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Produit *</label>
            <select name="product" className="input" required>
              <option value="">Sélectionner...</option>
              {products?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type de licence *</label>
            <select name="licenseType" className="input" required>
              <option value="">Sélectionner...</option>
              {licenseTypes?.map((lt) => <option key={lt._id} value={lt._id}>{lt.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max utilisateurs</label>
              <input name="maxUsers" type="number" min="1" className="input" />
            </div>
            <div>
              <label className="label">Max postes</label>
              <input name="maxWorkstations" type="number" min="1" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Notes admin</label>
            <textarea name="adminNotes" className="input" rows={2} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
