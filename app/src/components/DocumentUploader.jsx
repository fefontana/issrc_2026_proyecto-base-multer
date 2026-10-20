import { useState, useRef } from 'react';
import { FileText, FileSpreadsheet, File, UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocumentService } from '../services/api';

export default function DocumentUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('[DocumentUploader] Documento seleccionado:', file);
    setSelectedFile(file);
    setStatus(null);
    setProgress(0);
  };

  const getDocIcon = (filename) => {
    if (!filename) return <File size={36} />;
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return <FileText size={36} className="text-rose-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet size={36} className="text-emerald-500" />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FileText size={36} className="text-blue-500" />;
    }
    return <File size={36} className="text-slate-400" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona un documento primero.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);
    console.log('[DocumentUploader] Enviando documento con Axios...');

    try {
      const response = await uploadDocumentService(selectedFile, description, (percent) => {
        setProgress(percent);
      });
      console.log('[DocumentUploader] Documento subido exitosamente con Axios:', response);

      setStatus({
        type: 'success',
        message: '¡Documento subido con éxito al servidor con Axios y Multer!',
        json: response
      });

      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('[DocumentUploader] Error capturado en Axios:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Error al subir el documento con Axios',
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
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <FileSpreadsheet size={22} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">
          Subir Documentos (PDF, Excel, Word, CSV)
        </h2>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Envío con <strong className="text-cyan-300 font-mono">Axios</strong> al middleware <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">upload.single('document')</code> con filtrado MIME y extensiones.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone */}
        <div className="relative group border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/40 hover:bg-cyan-950/20 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xls,.xlsx,.doc,.docx,.csv,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="w-12 h-12 text-cyan-400 mb-3 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-200" />
            <p className="text-base font-semibold text-slate-200 mb-1">
              {selectedFile ? selectedFile.name : 'Haz clic o arrastra tu archivo PDF o Excel aquí'}
            </p>
            <p className="text-xs text-slate-400">
              Formatos admitidos: .pdf, .xlsx, .xls, .docx, .doc, .csv, .txt (Máx 25 MB)
            </p>
          </div>
        </div>

        {/* Badges de soporte */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400">
            📑 PDF
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            📊 Excel (.xlsx, .xls)
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
            📝 Word (.docx, .doc)
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
            📋 CSV / TXT
          </span>
        </div>

        {/* Ficha informativa del archivo seleccionado */}
        {selectedFile && (
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              {getDocIcon(selectedFile.name)}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm text-slate-100 truncate">{selectedFile.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Peso: {(selectedFile.size / 1024).toFixed(1)} KB — Tipo: {selectedFile.type || 'Archivo binario'}
              </div>
            </div>
          </div>
        )}

        {/* Campo de descripción adicional */}
        <div>
          <label htmlFor="doc-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descripción o categoría del documento (viaja en req.body):
          </label>
          <input
            id="doc-desc"
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            placeholder="Ej: Planilla de sueldos / Factura de compra..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Barra de Progreso con Axios */}
        {loading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progreso de subida (Axios):</span>
              <span className="font-semibold text-cyan-400">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botón de Enviar */}
        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Subiendo con Axios ({progress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Subir Documento con Axios</span>
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
