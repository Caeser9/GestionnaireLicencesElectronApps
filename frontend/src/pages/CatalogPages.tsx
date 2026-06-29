import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { catalogApi } from '../api/services';
import { PageHeader, DataTable, Modal, StatusBadge, LoadingSpinner } from '../components/ui';
import { formatDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

function CatalogPage({
  title,
  description,
  queryKey,
  listFn,
  createFn,
  updateFn,
  fields,
}: {
  title: string;
  description: string;
  queryKey: string;
  listFn: () => Promise<{ data: { data: { items: Record<string, unknown>[] } } }>;
  createFn: (data: Record<string, unknown>) => Promise<unknown>;
  updateFn: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  fields: { name: string; label: string; type?: string; required?: boolean; colSpan?: number }[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => listFn().then((r) => r.data.data.items),
  });

  const mutation = useMutation({
    mutationFn: (payload: { id?: string; data: Record<string, unknown> }) =>
      payload.id ? updateFn(payload.id, payload.data) : createFn(payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setShowModal(false);
      setEditing(null);
    },
  });

  const columns = fields.slice(0, 5).map((f) => ({
    key: f.name,
    label: f.label,
    render: f.name === 'isActive'
      ? (val: unknown) => <StatusBadge status={val ? 'active' : 'suspended'} label={val ? 'Actif' : 'Inactif'} />
      : f.name === 'createdAt'
      ? (val: unknown) => formatDate(val as string)
      : undefined,
  }));

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          hasRole(UserRole.ADMIN) && (
            <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          )
        }
      />

      {isLoading ? <LoadingSpinner /> : (
        <DataTable
          columns={columns}
          data={data ?? []}
          onRowClick={hasRole(UserRole.ADMIN) ? (row) => { setEditing(row); setShowModal(true); } : undefined}
        />
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Modifier' : 'Ajouter'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const payload: Record<string, unknown> = {};
            formData.forEach((v, k) => { payload[k] = v; });
            mutation.mutate({ id: editing?._id as string | undefined, data: payload });
          }}
          className="space-y-4"
        >
          {fields.map((f) => (
            <div key={f.name} className={f.colSpan === 2 ? 'col-span-2' : ''}>
              <label className="label">{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'textarea' ? (
                <textarea name={f.name} className="input" rows={3} defaultValue={editing?.[f.name] as string} required={f.required} />
              ) : (
                <input
                  name={f.name}
                  type={f.type || 'text'}
                  className="input"
                  defaultValue={editing?.[f.name] as string}
                  required={f.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>Enregistrer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function ProductsPage() {
  return (
    <CatalogPage
      title="Produits"
      description="Logiciels gérés par la plateforme"
      queryKey="products"
      listFn={catalogApi.products.list}
      createFn={catalogApi.products.create}
      updateFn={catalogApi.products.update}
      fields={[
        { name: 'slug', label: 'Identifiant (slug)', required: true },
        { name: 'name', label: 'Nom', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
        { name: 'currentVersion', label: 'Version actuelle', required: true },
      ]}
    />
  );
}

export function ModulesPage() {
  return (
    <CatalogPage
      title="Modules"
      description="Fonctionnalités activables par licence"
      queryKey="modules"
      listFn={catalogApi.modules.list}
      createFn={catalogApi.modules.create}
      updateFn={catalogApi.modules.update}
      fields={[
        { name: 'slug', label: 'Identifiant (slug)', required: true },
        { name: 'name', label: 'Nom', required: true },
        { name: 'product', label: 'Produit ID', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
    />
  );
}

export function LicenseTypesPage() {
  return (
    <CatalogPage
      title="Types de licence"
      description="Basic, Standard, Pro, Enterprise..."
      queryKey="license-types"
      listFn={catalogApi.licenseTypes.list}
      createFn={catalogApi.licenseTypes.create}
      updateFn={catalogApi.licenseTypes.update}
      fields={[
        { name: 'slug', label: 'Identifiant', required: true },
        { name: 'name', label: 'Nom', required: true },
        { name: 'defaultMaxUsers', label: 'Max utilisateurs', type: 'number', required: true },
        { name: 'defaultMaxWorkstations', label: 'Max postes', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      ]}
    />
  );
}

export function VersionsPage() {
  return (
    <CatalogPage
      title="Versions"
      description="Versions des applications disponibles"
      queryKey="app-versions"
      listFn={catalogApi.appVersions.list}
      createFn={catalogApi.appVersions.create}
      updateFn={catalogApi.appVersions.update}
      fields={[
        { name: 'product', label: 'Produit ID', required: true },
        { name: 'version', label: 'Version', required: true },
        { name: 'downloadUrl', label: 'URL de téléchargement' },
        { name: 'releaseNotes', label: 'Notes de version', type: 'textarea', colSpan: 2 },
      ]}
    />
  );
}
