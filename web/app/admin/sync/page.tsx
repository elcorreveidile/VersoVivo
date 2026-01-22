'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import {
  getStorageUsage,
} from '@/lib/firebase/storage';
import {
  exportPoemsToJSON,
  exportBooksToJSON,
  importPoemsFromJSON,
  importBooksFromJSON,
  verifyDataConsistency,
  getAdminStats,
} from '@/lib/firebase/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StorageUsage {
  totalFiles: number;
  filesByType: Record<string, number>;
}

interface ConsistencyIssue {
  type: string;
  description: string;
  count: number;
  items?: string[];
}

function SyncContent() {
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    try {
      const usage = await getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error loading storage usage:', error);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // Export functions
  const handleExportPoems = async () => {
    setExporting(true);
    try {
      const json = await exportPoemsToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poems-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('✅ Poemas exportados correctamente', 'success');
    } catch (error: any) {
      showMessage('❌ Error al exportar poemas: ' + error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportBooks = async () => {
    setExporting(true);
    try {
      const json = await exportBooksToJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `books-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMessage('✅ Libros exportados correctamente', 'success');
    } catch (error: any) {
      showMessage('❌ Error al exportar libros: ' + error.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  // Import functions
  const handleImportPoems = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const result = await importPoemsFromJSON(text, { updateExisting: true });

      if (result.success) {
        showMessage(`✅ Importados: ${result.imported}, Actualizados: ${result.updated}`, 'success');
        if (result.errors.length > 0) {
          console.warn('Import warnings:', result.errors);
        }
      } else {
        showMessage('❌ Error al importar: ' + result.errors.join(', '), 'error');
      }
    } catch (error: any) {
      showMessage('❌ Error al procesar archivo: ' + error.message, 'error');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleImportBooks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const result = await importBooksFromJSON(text, { updateExisting: true });

      if (result.success) {
        showMessage(`✅ Importados: ${result.imported}, Actualizados: ${result.updated}`, 'success');
        if (result.errors.length > 0) {
          console.warn('Import warnings:', result.errors);
        }
      } else {
        showMessage('❌ Error al importar: ' + result.errors.join(', '), 'error');
      }
    } catch (error: any) {
      showMessage('❌ Error al procesar archivo: ' + error.message, 'error');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  // Data consistency
  const handleVerifyConsistency = async () => {
    setLoading(true);
    try {
      const result = await verifyDataConsistency();
      setConsistencyIssues(result.issues);

      if (result.issues.length === 0) {
        showMessage('✅ No se encontraron problemas de consistencia', 'success');
      } else {
        showMessage(`⚠️ Se encontraron ${result.issues.length} problema(s)`, 'error');
      }
    } catch (error: any) {
      showMessage('❌ Error al verificar consistencia: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateStats = async () => {
    setLoading(true);
    try {
      await getAdminStats();
      showMessage('✅ Estadísticas recalculadas correctamente', 'success');
    } catch (error: any) {
      showMessage('❌ Error al recalcular estadísticas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Sincronización</h1>
        <p className="text-white/60">Gestiona datos, Storage y mantenimiento del sistema</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-900/50 border border-green-500/30 text-green-200' :
          messageType === 'error' ? 'bg-red-900/50 border border-red-500/30 text-red-200' :
          'bg-blue-900/50 border border-blue-500/30 text-blue-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Storage Manager */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">📁</span>
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storageUsage && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Total de archivos:</span>
                  <span className="text-white font-semibold">{storageUsage.totalFiles}</span>
                </div>

                {Object.entries(storageUsage.filesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-white/60 capitalize">{type === 'video' ? 'Videos' : type === 'music' ? 'Música' : type === 'thumbnail' ? 'Miniaturas' : type}:</span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={loadStorageUsage}
                className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
              >
                🔄 Actualizar
              </Button>
            </div>

            <div className="text-xs text-white/40 pt-2">
              <p>ℹ️ Nota: Para gestionar archivos individuales, usa Firebase Console. Desde aquí solo puedes ver estadísticas.</p>
            </div>
          </CardContent>
        </Card>

        {/* Import/Export */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">📥📤</span>
              Importar / Exportar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Exportar datos</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleExportPoems}
                  disabled={exporting}
                  className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                >
                  {exporting ? 'Exportando...' : '📤 Exportar Poemas (JSON)'}
                </Button>
                <Button
                  onClick={handleExportBooks}
                  disabled={exporting}
                  className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                >
                  {exporting ? 'Exportando...' : '📤 Exportar Libros (JSON)'}
                </Button>
              </div>
            </div>

            {/* Import */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-white mb-3">Importar datos</h3>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportPoems}
                    disabled={importing}
                    className="hidden"
                    id="import-poems"
                  />
                  <Button
                    disabled={importing}
                    className="w-full bg-black text-white border-white/20 hover:bg-white/10"
                    onClick={() => document.getElementById('import-poems')?.click()}
                  >
                    {importing ? 'Importando...' : '📥 Importar Poemas'}
                  </Button>
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBooks}
                    disabled={importing}
                    className="hidden"
                    id="import-books"
                  />
                  <Button
                    disabled={importing}
                    className="w-full bg-black text-white border-white/20 hover:bg-white/10"
                    onClick={() => document.getElementById('import-books')?.click()}
                  >
                    {importing ? 'Importando...' : '📥 Importar Libros'}
                  </Button>
                </label>
              </div>
            </div>

            <div className="text-xs text-white/40 pt-2">
              <p>💡 Al importar, se actualizan los registros existentes y se crean los nuevos.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recalculate Data */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              Recalcular Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={handleVerifyConsistency}
                disabled={loading}
                className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
              >
                {loading ? 'Verificando...' : '🔍 Verificar Consistencia'}
              </Button>
              <Button
                onClick={handleRecalculateStats}
                disabled={loading}
                className="w-full bg-black text-white border-white/20 hover:bg-white/10"
              >
                {loading ? 'Recalculando...' : '🔄 Recalcular Estadísticas'}
              </Button>
            </div>

            {/* Consistency Issues */}
            {consistencyIssues.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <h3 className="text-sm font-medium text-white">Problems encontrados:</h3>
                {consistencyIssues.map((issue: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded ${
                    issue.type === 'error' ? 'bg-red-900/30' : 'bg-yellow-900/30'
                  }`}>
                    <div className="font-medium text-white mb-1">{issue.description}</div>
                    <div className="text-sm text-white/70">Cantidad: {issue.count}</div>
                    {issue.items && (
                      <div className="text-xs text-white/50 mt-2">
                        {issue.items.slice(0, 5).join(', ')}
                        {issue.items.length > 5 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* External Sync */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              Sincronización Externa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-white/70">
              <p>Sincroniza el sitio con servicios externos.</p>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-black text-white border-white/20 hover:bg-white/10"
                onClick={() => window.open('https://vercel.com/javiers-projects-cc8068ed/verso-vivo-6l3w/deployments', '_blank')}
              >
                🚀 Ver deployments en Vercel
              </Button>
              <Button
                className="w-full bg-black text-white border-white/20 hover:bg-white/10"
                onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              >
                🔥 Abrir Firebase Console
              </Button>
            </div>

            <div className="text-xs text-white/40 pt-2">
              <p>ℹ️ Para invalidar caché o hacer deploy, usa Vercel Dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SyncPage() {
  return (
    <AdminRoute>
      <SyncContent />
    </AdminRoute>
  );
}
