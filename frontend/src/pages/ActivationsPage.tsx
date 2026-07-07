import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { licensesApi, catalogApi } from '../api/services';
import { PageHeader, DataTable, Modal, StatusBadge, LoadingSpinner, ErrorMessage } from '../components/ui';
import { ActivationRequest, Product, LicenseType, ActivationRequestStatus } from '../types';
import { formatDate } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { getErrorMessage } from '../api/client';

interface ApproveActivationPayload {
  licenseTypeId: string;
  maxUsers?: number;
  maxWorkstations?: number;
  dashboardMode?: 'pro' | 'simple';
}

function buildApprovePayload(form: FormData): ApproveActivationPayload {
  const licenseTypeId = String(form.get('licenseTypeId') || '');
  const payload: ApproveActivationPayload = { licenseTypeId };
  const maxUsers = form.get('maxUsers');
  const maxWorkstations = form.get('maxWorkstations');
  if (maxUsers && String(maxUsers).trim() !== '') {
    payload.maxUsers = Number(maxUsers);
  }
  if (maxWorkstations && String(maxWorkstations).trim() !== '') {
    payload.maxWorkstations = Number(maxWorkstations);
  }
  const dashboardMode = form.get('dashboardMode');
  if (dashboardMode && String(dashboardMode).trim() !== '') {
    payload.dashboardMode = String(dashboardMode) as 'pro' | 'simple';
  }
  return payload;
}

export default function ActivationsPage() {
  const [selected, setSelected] = useState<ActivationRequest | null>(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [approveError, setApproveError] = useState('');
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['activations'],
    queryFn: () => licensesApi.activations().then((r) => r.data.data as ActivationRequest[]),
  });

  const { data: licenseTypes, isLoading: loadingTypes, isError: typesError } = useQuery({
    queryKey: ['license-types-list'],
    queryFn: () => catalogApi.licenseTypes.list().then((r) => r.data.data.items as LicenseType[]),
    enabled: showApprove,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveActivationPayload }) =>
      licensesApi.approveActivation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activations'] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setShowApprove(false);
      setSelected(null);
      setApproveError('');
    },
    onError: (error) => {
      setApproveError(getErrorMessage(error));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      licensesApi.rejectActivation(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activations'] });
      setShowReject(false);
      setSelected(null);
    },
  });

  const columns = [
    { key: 'companyName', label: 'Société' },
    { key: 'contactEmail', label: 'Email' },
    {
      key: 'product',
      label: 'Produit',
      render: (val: unknown) => typeof val === 'object' && val ? (val as Product).name : '-',
    },
    { key: 'appVersion', label: 'Version' },
    {
      key: 'machineId',
      label: 'Machine ID',
      render: (val: unknown) => (
        <span className="font-mono text-xs">{(val as string)?.slice(0, 16)}...</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (val: unknown) => {
        const labels: Record<string, string> = { pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée' };
        return <StatusBadge status={val as string} label={labels[val as string]} />;
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val: unknown) => formatDate(val as string),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Record<string, unknown>) => {
        const req = row as unknown as ActivationRequest;
        if (req.status !== ActivationRequestStatus.PENDING || !hasRole(UserRole.ADMIN)) return null;
        return (
          <div className="flex gap-2">
            <button
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
              onClick={(e) => { e.stopPropagation(); setSelected(req); setShowApprove(true); }}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              onClick={(e) => { e.stopPropagation(); setSelected(req); setShowReject(true); }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const pendingCount = data?.filter((a) => a.status === ActivationRequestStatus.PENDING).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Demandes d'activation"
        description={`${pendingCount} demande(s) en attente de validation`}
      />

      {isLoading ? <LoadingSpinner /> : (
        <DataTable columns={columns} data={(data ?? []) as unknown as Record<string, unknown>[]} />
      )}

      <Modal isOpen={showApprove} onClose={() => { setShowApprove(false); setApproveError(''); }} title="Approuver l'activation">
        {selected && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setApproveError('');
              const form = new FormData(e.currentTarget);
              if (!form.get('licenseTypeId')) {
                setApproveError('Veuillez sélectionner un type de licence');
                return;
              }
              approveMutation.mutate({
                id: selected._id,
                data: buildApprovePayload(form),
              });
            }}
            className="space-y-4"
          >
            {approveError && <ErrorMessage message={approveError} />}
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Société:</strong> {selected.companyName}</p>
              <p><strong>Email:</strong> {selected.contactEmail}</p>
              <p><strong>Version:</strong> {selected.appVersion}</p>
            </div>
            <div>
              <label className="label">Type de licence *</label>
              {loadingTypes ? (
                <p className="text-sm text-gray-500">Chargement...</p>
              ) : typesError || !licenseTypes?.length ? (
                <p className="text-sm text-red-600">
                  Aucun type de licence. Exécutez <code className="bg-gray-100 px-1">npm run seed</code> sur le serveur.
                </p>
              ) : (
              <select name="licenseTypeId" className="input" required defaultValue="">
                <option value="" disabled>Sélectionner...</option>
                {licenseTypes.map((lt) => (
                  <option key={lt._id} value={lt._id}>{lt.name}</option>
                ))}
              </select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max utilisateurs</label>
                <input name="maxUsers" type="number" min="1" className="input" />
              </div>
              <div>
                <label className="label">Max postes</label>
                <input name="maxWorkstations" type="number" min="1" defaultValue="1" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Type de tableau de bord</label>
              <select name="dashboardMode" className="input" defaultValue="pro">
                <option value="pro">Pro / analytique</option>
                <option value="simple">Simple / raccourcis</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setShowApprove(false)}>Annuler</button>
              <button type="submit" className="btn-primary" disabled={approveMutation.isPending}>
                Approuver
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showReject} onClose={() => setShowReject(false)} title="Rejeter l'activation">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const reason = new FormData(e.currentTarget).get('reason') as string;
            if (selected) rejectMutation.mutate({ id: selected._id, reason });
          }}
          className="space-y-4"
        >
          <div>
            <label className="label">Raison du rejet *</label>
            <textarea name="reason" className="input" rows={3} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowReject(false)}>Annuler</button>
            <button type="submit" className="btn-danger" disabled={rejectMutation.isPending}>Rejeter</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
