'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getActivityLogs } from '@/lib/firebase/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActivityLog } from '@/types/poem';

function ActivityContent() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const logsData = await getActivityLogs(200);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Error loading activity logs:', err);
      setError('No tienes permisos para ver el registro de actividad. Asegúrate de estar autenticado como administrador.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesResource = filterResource === 'all' || log.resourceType === filterResource;
    return matchesSearch && matchesAction && matchesResource;
  });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return '✨';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'publish': return '📢';
      case 'unpublish': return '🔇';
      default: return '📝';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Creación';
      case 'update': return 'Actualización';
      case 'delete': return 'Eliminación';
      case 'publish': return 'Publicación';
      case 'unpublish': return 'Despublicación';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'update': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'delete': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'publish': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'unpublish': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'poem': return '✍️';
      case 'book': return '📚';
      case 'user': return '👤';
      default: return '📄';
    }
  };

  const getResourceLabel = (resourceType: string) => {
    switch (resourceType) {
      case 'poem': return 'Poema';
      case 'book': return 'Libro';
      case 'user': return 'Usuario';
      default: return resourceType;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Registro de Actividad</h1>
          <p className="text-white/60">{logs.length} accion{logs.length !== 1 ? 'es' : ''} registradas</p>
        </div>
        <Button
          onClick={loadLogs}
          className="bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
        >
          🔄 Actualizar
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500/30 text-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-medium mb-1">Error de permisos</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por admin o recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              />
            </div>
            <div>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="all" className="bg-black">Todas las acciones</option>
                <option value="create" className="bg-black">✨ Creación</option>
                <option value="update" className="bg-black">✏️ Actualización</option>
                <option value="delete" className="bg-black">🗑️ Eliminación</option>
                <option value="publish" className="bg-black">📢 Publicación</option>
                <option value="unpublish" className="bg-black">🔇 Despublicación</option>
              </select>
            </div>
            <div>
              <select
                value={filterResource}
                onChange={(e) => setFilterResource(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="all" className="bg-black">Todos los recursos</option>
                <option value="poem" className="bg-black">✍️ Poemas</option>
                <option value="book" className="bg-black">📚 Libros</option>
                <option value="user" className="bg-black">👤 Usuarios</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all">
              <CardContent className="p-6">
                {/* Header: Action, Resource, Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Action Badge */}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                      <span>{getActionIcon(log.action)}</span>
                      <span>{getActionLabel(log.action)}</span>
                    </span>

                    {/* Resource Badge */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                      <span>{getResourceIcon(log.resourceType)}</span>
                      <span>{getResourceLabel(log.resourceType)}</span>
                    </span>

                    {/* Resource Title */}
                    <span className="text-white font-medium">{log.resourceTitle}</span>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-white/40">{formatDate(log.timestamp)}</span>
                </div>

                {/* Admin Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white/60">Administrador:</span>
                    <span className="text-white font-medium">{log.adminEmail}</span>
                  </div>
                </div>

                {/* Changes Detail */}
                {log.changes && (
                  <details className="bg-black/20 rounded-lg">
                    <summary className="p-3 cursor-pointer hover:bg-white/5 rounded-lg">
                      <span className="text-sm text-white/60">Ver detalles del cambio</span>
                    </summary>
                    <div className="p-3 pt-0 space-y-2">

                      {/* For update actions, show only changed fields */}
                      {log.action === 'update' && log.changes.before && log.changes.after && (() => {
                        // Store before/after in variables to avoid TypeScript errors
                        const before = log.changes.before;
                        const after = log.changes.after;

                        // Find fields that actually changed
                        const changedFields = Object.keys(after).filter(key => {
                          const beforeValue = before?.[key];
                          const afterValue = after[key];
                          return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
                        });

                        return changedFields.length > 0 ? (
                          <div className="space-y-2">
                            {changedFields.map((key: string) => {
                              const beforeValue = before![key];
                              const afterValue = after[key];
                              const displayBefore = typeof beforeValue === 'object' ? '[Objeto]' : String(beforeValue ?? '').substring(0, 100);
                              const displayAfter = typeof afterValue === 'object' ? '[Objeto]' : String(afterValue ?? '').substring(0, 100);

                              return (
                                <div key={key} className="text-xs">
                                  <div className="text-[#FFD700] font-medium mb-1">{key}</div>
                                  <div className="flex items-start gap-2 text-white/70">
                                    <span className="text-red-400">-</span>
                                    <span>{displayBefore}</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-white/70">
                                    <span className="text-green-400">+</span>
                                    <span>{displayAfter}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-white/40">No hay cambios detectados</div>
                        );
                      })()}

                      {/* For create actions, show summary */}
                      {log.action === 'create' && (
                        <div className="text-xs text-white/70">
                          Recurso creado: <span className="text-[#FFD700]">{log.resourceTitle}</span>
                        </div>
                      )}

                      {/* For delete actions, show summary */}
                      {log.action === 'delete' && (
                        <div className="text-xs text-white/70">
                          Recurso eliminado: <span className="text-red-400">{log.resourceTitle}</span>
                        </div>
                      )}

                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterAction !== 'all' || filterResource !== 'all'
                ? 'No se encontraron actividades'
                : 'No hay actividad registrada'}
            </h3>
            <p className="text-white/60">
              {searchTerm || filterAction !== 'all' || filterResource !== 'all'
                ? 'Prueba con otros filtros'
                : 'Las acciones de los administradores aparecerán aquí'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ActivityPage() {
  return (
    <AdminRoute>
      <ActivityContent />
    </AdminRoute>
  );
}
