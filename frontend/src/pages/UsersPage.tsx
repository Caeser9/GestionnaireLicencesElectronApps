import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { authApi, catalogApi } from '../api/services';
import { PageHeader, DataTable, Modal, LoadingSpinner } from '../components/ui';
import { User, ROLE_LABELS } from '../types';

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.listUsers().then((r) => r.data.data as User[]),
  });
  const { data: productsResponse } = useQuery({
    queryKey: ['products', 'moderator-applications'],
    queryFn: () => catalogApi.products.list().then((r) => r.data.data.items),
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
            const values = Object.fromEntries(new FormData(e.currentTarget).entries());
            if (!values.productId) delete values.productId;
            createMutation.mutate(values);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <select name="role" className="input" required onChange={(e) => {
              const associationField = document.getElementById('moderator-association-field');
              const associationSelects = associationField?.querySelectorAll('select');
              if (associationField) associationField.classList.toggle('hidden', e.target.value !== 'moderator');
              associationSelects?.forEach((select) => { select.required = e.target.value === 'moderator'; });
            }}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div id="moderator-association-field" className="hidden space-y-4">
            <label className="label">Application gérée *</label>
            <select name="productId" className="input">
              <option value="">Sélectionner une application</option>
              {(productsResponse ?? []).filter((product: { isActive: boolean }) => product.isActive).map((product: { _id: string; name: string }) => (
                <option key={product._id} value={product._id}>{product.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Le modérateur verra les clients et licences de cette application uniquement.</p>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>Créer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
