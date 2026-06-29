import { useQuery } from '@tanstack/react-query';
import { Users, Key, AlertTriangle, Clock, Package, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { statsApi } from '../api/services';
import { PageHeader, StatCard, LoadingSpinner } from '../components/ui';
import { DashboardStats } from '../types';
import { formatDate } from '../utils';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => statsApi.dashboard().then((r) => r.data.data as DashboardStats),
  });

  if (isLoading) return <LoadingSpinner />;

  const overview = data?.overview;

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la plateforme de gestion des licences"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Clients" value={overview?.totalClients ?? 0} icon={<Users className="h-6 w-6" />} />
        <StatCard
          title="Licences actives"
          value={overview?.activeLicenses ?? 0}
          icon={<Key className="h-6 w-6" />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="Suspendues"
          value={overview?.suspendedLicenses ?? 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          title="Activations en attente"
          value={overview?.pendingActivations ?? 0}
          icon={<Clock className="h-6 w-6" />}
          color="bg-yellow-50 text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            Produits les plus utilisés
          </h3>
          {data?.productsUsage && data.productsUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.productsUsage}>
                <XAxis dataKey="productName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">Aucune donnée</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-600" />
            Versions installées
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {data?.installedVersions?.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{v.productName}</p>
                  <p className="text-xs text-gray-500">v{v.version}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{v.installations}</p>
                  <p className="text-xs text-gray-400">{formatDate(v.lastSeen)}</p>
                </div>
              </div>
            )) ?? <p className="text-gray-500 text-sm text-center py-8">Aucune donnée</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">{overview?.pendingLicenses ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Licences en attente</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-600">{overview?.expiredLicenses ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Licences expirées</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{overview?.totalLicenses ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total licences</p>
        </div>
      </div>
    </div>
  );
}
