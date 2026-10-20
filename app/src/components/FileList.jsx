import { useState, useEffect } from 'react';
import {
  FolderOpen,
  FileSpreadsheet,
  FileText,
  File,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getFilesService, deleteFileService } from '../services/api';

export default function FileList({ refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[FileList] Solicitando lista de archivos al backend...');
      const data = await getFilesService();
      setFiles(data.all || []);
    } catch (err) {
      console.error('[FileList] Error al obtener archivos:', err);
      setError(err.message || 'Error al conectar con la API de Express');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDelete = async (category, filename) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${filename}"?`)) {
      return;
    }

    setDeletingFile(filename);
    try {
      console.log(`[FileList] Eliminando archivo: ${filename}...`);
      await deleteFileService(category, filename);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
    } catch (err) {
      console.error('[FileList] Error al eliminar:', err);
      alert('Error al eliminar el archivo: ' + err.message);
    } finally {
      setDeletingFile(null);
    }
  };

  const getDocBadge = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return (
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-sm">
          PDF
        </span>
      );
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return (
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
          EXCEL
        </span>
      );
    }
    if (['doc', 'docx'].includes(ext)) {
      return (
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500 text-white shadow-sm">
          WORD
        </span>
      );
    }
    return (
      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-600 text-white shadow-sm">
        {ext.toUpperCase()}
      </span>
    );
  };

  const getDocIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <FileText size={44} className="text-rose-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet size={44} className="text-emerald-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileText size={44} className="text-blue-500" />;
    return <File size={44} className="text-slate-400" />;
  };

  const filteredFiles = files.filter((f) => {
    if (filter === 'images') return f.category === 'images';
    if (filter === 'documents') return f.category === 'documents';
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl">
      {/* Cabecera del panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <FolderOpen size={22} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Archivos en el Servidor ({files.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Servidos estáticamente desde Express (<code className="text-indigo-300 font-mono">/uploads/images</code> y <code className="text-indigo-300 font-mono">/uploads/documents</code>)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchFiles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Botones de filtro */}
      <div className="flex items-center gap-2 mb-6 pt-2">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
          onClick={() => setFilter('all')}
        >
          Todos ({files.length})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            filter === 'images'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
          onClick={() => setFilter('images')}
        >
          Fotos ({files.filter((f) => f.category === 'images').length})
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            filter === 'documents'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
          }`}
          onClick={() => setFilter('documents')}
        >
          Documentos ({files.filter((f) => f.category === 'documents').length})
        </button>
      </div>

      {/* Loading state */}
      {loading && files.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-2 text-indigo-400" />
          <p className="text-sm">Cargando archivos del servidor...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <AlertCircle size={20} className="shrink-0" />
          <span>Error al conectar con la API de Express: {error}. Asegúrate de que el backend esté encendido en el puerto 3000.</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredFiles.length === 0 && !error && (
        <div className="text-center py-12 px-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <FolderOpen size={40} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No hay archivos en esta categoría</p>
          <p className="text-xs text-slate-500 mt-1">Sube una foto o documento desde las pestañas superiores.</p>
        </div>
      )}

      {/* Grilla de archivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <div
            key={file.filename}
            className="group bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40"
          >
            {/* Caja de previsualización */}
            <div className="h-40 bg-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/80">
              {file.category === 'images' ? (
                <>
                  <img
                    src={file.url}
                    alt={file.filename}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white shadow-sm">
                    IMAGEN
                  </span>
                </>
              ) : (
                <>
                  {getDocBadge(file.filename)}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 group-hover:scale-110 transition-transform">
                    {getDocIcon(file.filename)}
                  </div>
                </>
              )}
            </div>

            {/* Metadatos y acciones */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-xs text-slate-200 truncate mb-1" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-[11px] text-slate-500 mb-4">
                  {file.sizeFormatted} • {new Date(file.modifiedAt || file.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink size={13} />
                  <span>Ver / Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(file.category, file.filename)}
                  disabled={deletingFile === file.filename}
                  className="p-1.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition cursor-pointer disabled:opacity-40"
                  title="Eliminar archivo del servidor"
                >
                  {deletingFile === file.filename ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
