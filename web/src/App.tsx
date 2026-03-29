import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import type { Licitacao, DashboardStats, StatusLicitacao } from './types/licitacao';
import { fetchLicitacoes, fetchDashboardStats, triggerSync } from './services/api';
import { StatsCards } from './components/StatsCards';
import { LicitacaoTable } from './components/LicitacaoTable';
import { FiltersBar } from './components/FiltersBar';
import { Pagination } from './components/Pagination';

function App() {
  // State
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusLicitacao | ''>('');
  const [ufFilter, setUfFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch licitações
  const loadLicitacoes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchLicitacoes({
        page,
        limit: 20,
        status: statusFilter,
        search: debouncedSearch,
        uf: ufFilter,
        modalidade: modalidadeFilter.length > 0 ? modalidadeFilter.join(',') : undefined,
        sortBy: 'dataPublicacaoPncp',
        sortOrder: 'desc',
      });
      setLicitacoes(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (error) {
      console.error('Error loading licitacoes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, ufFilter, modalidadeFilter]);

  // Fetch stats
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLicitacoes();
  }, [loadLicitacoes]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, ufFilter, modalidadeFilter]);

  // Handle sync
  async function handleSync() {
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await triggerSync();
      setSyncMessage(`✓ Sincronização concluída: ${result.saved} novas licitações de ${result.total} verificadas`);
      loadLicitacoes();
      loadStats();
    } catch (error) {
      setSyncMessage('✗ Erro na sincronização. Tente novamente.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 8000);
    }
  }

  // Handle status change refresh
  function handleStatusChange() {
    loadLicitacoes();
    loadStats();
  }

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-100 tracking-tight">LicitTI</h1>
                <p className="text-xs text-surface-500 -mt-0.5">Monitor de Licitações de TI</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {syncMessage && (
                <span className={`text-xs px-3 py-1.5 rounded-lg ${syncMessage.startsWith('✓')
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
                  }`}>
                  {syncMessage}
                </span>
              )}
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar PNCP'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <section>
          <StatsCards stats={stats} loading={statsLoading} />
        </section>

        {/* Filters + Table */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-100">Licitações</h2>
          </div>

          <FiltersBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            ufFilter={ufFilter}
            onUfFilterChange={setUfFilter}
            modalidadeFilter={modalidadeFilter}
            onModalidadeFilterChange={setModalidadeFilter}
          />

          <LicitacaoTable
            licitacoes={licitacoes}
            loading={loading}
            onStatusChange={handleStatusChange}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-surface-500 text-center">
            LicitTI — Dados do PNCP (Portal Nacional de Contratações Públicas) • CNPJ 45.625.800/0001-36
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
