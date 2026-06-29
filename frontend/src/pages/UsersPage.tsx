import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { authApi } from '../api/services';
import { PageHeader, DataTable, Modal, LoadingSpinner } from '../components/ui';
import { User, ROLE_LABELS } from '../types';

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.listUsers().then((r) => r.data.data as User[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => authApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
    },
  });

  const columns = [
    { key: 'fullName', label: 'Nom' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rôle',
      render: (val: unknown) => ROLE_LABELS[val as keyof typeof ROLE_LABELS],
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (val: unknown) => val ? 'Actif' : 'Inactif',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des administrateurs de la plateforme"
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </button>
        }
      />

      {isLoading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={(data ?? []) as unknown as Record<string, unknown>[]} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouvel utilisateur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(Object.fromEntries(new FormData(e.currentTarget).entries()));
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom *</label>
              <input name="firstName" className="input" required />
            </div>
            <div>
              <label className="label">Nom *</label>
              <input name="lastName" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="label">Mot de passe *</label>
            <input name="password" type="password" className="input" minLength={8} required />
          </div>
          <div>
            <label className="label">Rôle *</label>
            <select name="role" className="input" required>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
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
