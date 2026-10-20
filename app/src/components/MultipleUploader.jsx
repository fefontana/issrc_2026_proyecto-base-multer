import { useState, useRef } from 'react';
import { Files, UploadCloud, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadMultipleService } from '../services/api';

export default function MultipleUploader({ onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    console.log('[MultipleUploader] Archivos seleccionados:', files);
    setSelectedFiles(files);
    setStatus(null);
    setProgress(0);
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona al menos un archivo.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);
    console.log('[MultipleUploader] Subiendo múltiples archivos con Axios...');

    try {
      const response = await uploadMultipleService(selectedFiles, (percent) => {
        setProgress(percent);
      });
      console.log('[MultipleUploader] Respuesta de subida múltiple con Axios:', response);

      setStatus({
        type: 'success',
        message: `¡Se subieron ${response.total} archivos con éxito mediante Axios y upload.array('files')!`,
        json: response
      });

      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('[MultipleUploader] Error capturado en Axios:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Error al subir los archivos múltiples con Axios',
        json: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl">
      {/* Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Files size={22} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">Subida Múltiple de Archivos</h2>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Envío por lotes con <strong className="text-indigo-300 font-mono">Axios</strong> al middleware <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">upload.array('files', 10)</code> de Multer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div className="relative group border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-indigo-950/20 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="w-12 h-12 text-indigo-400 mb-3 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-200" />
            <p className="text-base font-semibold text-slate-200 mb-1">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} archivos seleccionados`
                : 'Selecciona o arrastra varios archivos a la vez'}
            </p>
            <p className="text-xs text-slate-400">
              Hasta 10 archivos simultáneos (Fotos, PDFs, Excel, etc.)
            </p>
          </div>
        </div>

        {/* Lista de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Archivos en cola para subir ({selectedFiles.length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-100">{file.name}</span>
                    <span className="text-slate-500 ml-1.5">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                    title="Quitar de la lista"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Progreso con Axios */}
        {loading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progreso de subida por lote (Axios):</span>
              <span className="font-semibold text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botón de Enviar */}
        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Subiendo con Axios ({progress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Subir Todos los Archivos con Axios</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Alerta de Feedback */}
      {status && (
        <div
          className={`mt-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
          }`}
        >
          {status.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Visor JSON del backend */}
      {status && status.json && (
        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-400 max-h-48 overflow-y-auto shadow-inner">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
            Respuesta recibida del Backend (JSON):
          </div>
          <pre>{JSON.stringify(status.json, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
