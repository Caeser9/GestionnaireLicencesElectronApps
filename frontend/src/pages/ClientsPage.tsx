import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { clientsApi } from '../api/services';
import { PageHeader, DataTable, Modal, StatusBadge, LoadingSpinner } from '../components/ui';
import { Client, PaginatedResponse } from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientsApi.list({ search }).then((r) => r.data.data as PaginatedResponse<Client>),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing ? clientsApi.update(editing._id, data) : clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowModal(false);
      setEditing(null);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    createMutation.mutate(payload);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setShowModal(true);
  };

  const columns = [
    { key: 'companyName', label: 'Société' },
    { key: 'contactName', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    {
      key: 'isActive',
      label: 'Statut',
      render: (val: unknown) => (
        <StatusBadge status={val ? 'active' : 'suspended'} label={val ? 'Actif' : 'Inactif'} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (val: unknown) => formatDate(val as string),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Gestion des clients et sociétés"
        actions={
          hasRole(UserRole.ADMIN) && (
            <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Nouveau client
            </button>
          )
        }
      />

      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={(data?.items ?? []) as unknown as Record<string, unknown>[]}
          onRowClick={hasRole(UserRole.ADMIN) ? (row) => openEdit(row as unknown as Client) : undefined}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Modifier le client' : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="label">Nom de la société *</label>
              <input name="companyName" className="input" defaultValue={editing?.companyName} required />
            </div>
            <div>
              <label className="label">Contact *</label>
              <input name="contactName" className="input" defaultValue={editing?.contactName} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input name="email" type="email" className="input" defaultValue={editing?.email} required />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input name="phone" className="input" defaultValue={editing?.phone} />
            </div>
            <div>
              <label className="label">Ville</label>
              <input name="city" className="input" defaultValue={editing?.city} />
            </div>
            <div className="col-span-2">
              <label className="label">Adresse</label>
              <input name="address" className="input" defaultValue={editing?.address} />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea name="notes" className="input" rows={3} defaultValue={editing?.notes} />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
