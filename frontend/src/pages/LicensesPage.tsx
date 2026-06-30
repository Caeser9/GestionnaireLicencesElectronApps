import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Pause, Play, Plus } from 'lucide-react';
import { licensesApi, clientsApi, catalogApi } from '../api/services';
import { PageHeader, DataTable, Modal, StatusBadge, LoadingSpinner } from '../components/ui';
import {
  License,
  PaginatedResponse,
  Client,
  Product,
  LicenseType,
  LicenseStatus,
  LICENSE_STATUS_LABELS,
  Module as AppModule,
} from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface EditFormState {
  licenseType: string;
  status: LicenseStatus;
  maxUsers: string;
  maxWorkstations: string;
  expiresAt: string;
  adminNotes: string;
  authorizedModules: string[];
}

function getId(value: { _id: string } | string | undefined): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id;
}

function toDateInput(value?: string): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function isPastDateInput(value: string): boolean {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) < today;
}

export default function LicensesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['licenses', statusFilter],
    queryFn: () =>
      licensesApi
        .list({ status: statusFilter || undefined })
        .then((r) => r.data.data as PaginatedResponse<License>),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: () => clientsApi.list({ limit: 100 }).then((r) => r.data.data.items as Client[]),
  });

  const { data: products } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => catalogApi.products.list().then((r) => r.data.data.items as Product[]),
  });

  const { data: modules } = useQuery({
    queryKey: ['modules-list'],
    queryFn: () => catalogApi.modules.list().then((r) => r.data.data.items as AppModule[]),
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      licensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setEditingLicense(null);
      setEditForm(null);
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

  const openEditModal = (license: License) => {
    setEditingLicense(license);
    setEditForm({
      licenseType: getId(license.licenseType),
      status: license.status,
      maxUsers: String(license.maxUsers ?? ''),
      maxWorkstations: String(license.maxWorkstations ?? ''),
      expiresAt: toDateInput(license.expiresAt),
      adminNotes: license.adminNotes ?? '',
      authorizedModules: license.authorizedModules ?? [],
    });
  };

  const handleLicenseTypeChange = (licenseTypeId: string) => {
    const selected = licenseTypes?.find((type) => type._id === licenseTypeId);
    setEditForm((current) => {
      if (!current) return current;
      return {
        ...current,
        licenseType: licenseTypeId,
        maxUsers: selected ? String(selected.defaultMaxUsers) : current.maxUsers,
        maxWorkstations: selected ? String(selected.defaultMaxWorkstations) : current.maxWorkstations,
        authorizedModules: selected ? selected.defaultModules : current.authorizedModules,
      };
    });
  };

  const toggleModule = (slug: string) => {
    setEditForm((current) => {
      if (!current) return current;
      const exists = current.authorizedModules.includes(slug);
      return {
        ...current,
        authorizedModules: exists
          ? current.authorizedModules.filter((item) => item !== slug)
          : [...current.authorizedModules, slug],
      };
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLicense || !editForm) return;

    updateMutation.mutate({
      id: editingLicense._id,
      data: {
        licenseType: editForm.licenseType,
        status: editForm.status,
        maxUsers: Number(editForm.maxUsers),
        maxWorkstations: Number(editForm.maxWorkstations),
        authorizedModules: editForm.authorizedModules,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null,
        adminNotes: editForm.adminNotes,
      },
    });
  };

  const columns = [
    { key: 'licenseKey', label: 'Cle' },
    {
      key: 'client',
      label: 'Client',
      render: (val: unknown) => (typeof val === 'object' && val ? (val as Client).companyName : '-'),
    },
    {
      key: 'product',
      label: 'Produit',
      render: (val: unknown) => (typeof val === 'object' && val ? (val as Product).name : '-'),
    },
    {
      key: 'licenseType',
      label: 'Type',
      render: (val: unknown) => (typeof val === 'object' && val ? (val as LicenseType).name : '-'),
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
            <button
              className="p-1 text-primary-600 hover:bg-primary-50 rounded"
              title="Modifier"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(license);
              }}
            >
              <Edit className="h-4 w-4" />
            </button>
            {license.status === LicenseStatus.ACTIVE && (
              <button
                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                title="Suspendre"
                onClick={(e) => {
                  e.stopPropagation();
                  suspendMutation.mutate(license._id);
                }}
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
            {license.status === LicenseStatus.SUSPENDED && (
              <button
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Reactiver"
                onClick={(e) => {
                  e.stopPropagation();
                  reactivateMutation.mutate(license._id);
                }}
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
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable columns={columns} data={(data?.items ?? []) as unknown as Record<string, unknown>[]} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvelle licence">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Client *</label>
            <select name="client" className="input" required>
              <option value="">Selectionner...</option>
              {clients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Produit *</label>
            <select name="product" className="input" required>
              <option value="">Selectionner...</option>
              {products?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type de licence *</label>
            <select name="licenseType" className="input" required>
              <option value="">Selectionner...</option>
              {licenseTypes?.map((lt) => (
                <option key={lt._id} value={lt._id}>
                  {lt.name}
                </option>
              ))}
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
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              Creer
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingLicense && !!editForm}
        onClose={() => {
          setEditingLicense(null);
          setEditForm(null);
        }}
        title="Modifier la licence"
        size="lg"
      >
        {editForm && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Type de licence *</label>
                <select
                  className="input"
                  value={editForm.licenseType}
                  onChange={(e) => handleLicenseTypeChange(e.target.value)}
                  required
                >
                  <option value="">Selectionner...</option>
                  {licenseTypes?.map((lt) => (
                    <option key={lt._id} value={lt._id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Statut *</label>
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((current) =>
                      current
                        ? {
                            ...current,
                            status: e.target.value as LicenseStatus,
                            expiresAt:
                              e.target.value === LicenseStatus.ACTIVE && isPastDateInput(current.expiresAt)
                                ? ''
                                : current.expiresAt,
                          }
                        : current
                    )
                  }
                  required
                >
                  {Object.entries(LICENSE_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Max utilisateurs *</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={editForm.maxUsers}
                  onChange={(e) =>
                    setEditForm((current) =>
                      current ? { ...current, maxUsers: e.target.value } : current
                    )
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Max postes *</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={editForm.maxWorkstations}
                  onChange={(e) =>
                    setEditForm((current) =>
                      current ? { ...current, maxWorkstations: e.target.value } : current
                    )
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Expiration</label>
                <input
                  type="date"
                  className="input"
                  value={editForm.expiresAt}
                  onChange={(e) =>
                    setEditForm((current) =>
                      current ? { ...current, expiresAt: e.target.value } : current
                    )
                  }
                />
              </div>
            </div>

            <div>
              <label className="label">Modules autorises</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                {modules?.map((module) => (
                  <label key={module._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editForm.authorizedModules.includes(module.slug)}
                      onChange={() => toggleModule(module.slug)}
                    />
                    <span>{module.name}</span>
                    <span className="text-xs text-gray-400">({module.slug})</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Notes admin</label>
              <textarea
                className="input"
                rows={3}
                value={editForm.adminNotes}
                onChange={(e) =>
                  setEditForm((current) =>
                    current ? { ...current, adminNotes: e.target.value } : current
                  )
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditingLicense(null);
                  setEditForm(null);
                }}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
