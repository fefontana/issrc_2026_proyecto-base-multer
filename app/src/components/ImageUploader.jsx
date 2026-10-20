import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadImageService } from '../services/api';

export default function ImageUploader({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('[ImageUploader] Imagen seleccionada:', file);
    setSelectedFile(file);
    setStatus(null);
    setProgress(0);

    // URL temporal para preview instantáneo
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona una imagen primero.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus(null);
    console.log('[ImageUploader] Enviando con Axios...');

    try {
      const response = await uploadImageService(selectedFile, description, (percent) => {
        setProgress(percent);
      });
      console.log('[ImageUploader] Respuesta exitosa con Axios:', response);

      setStatus({
        type: 'success',
        message: '¡Imagen subida exitosamente con Axios y Multer!',
        json: response
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error('[ImageUploader] Error capturado en Axios:', error);
      setStatus({
        type: 'error',
        message: error.message || 'Error al subir la imagen con Axios',
        json: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-xl">
      {/* Título de la tarjeta */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <ImageIcon size={22} />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-100">Subir Imagen (Fotos)</h2>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        Envío mediante <strong className="text-indigo-300 font-mono">Axios</strong> al middleware <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">upload.single('image')</code> de Multer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dropzone interactivo */}
        <div className="relative group border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/40 hover:bg-indigo-950/20 rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none">
            <UploadCloud className="w-12 h-12 text-indigo-400 mb-3 group-hover:scale-110 group-hover:text-indigo-300 transition-all duration-200" />
            <p className="text-base font-semibold text-slate-200 mb-1">
              {selectedFile ? selectedFile.name : 'Haz clic o arrastra tu imagen aquí'}
            </p>
            <p className="text-xs text-slate-400">
              Formatos admitidos: JPG, PNG, WEBP, GIF, SVG (Máx 10 MB)
            </p>
          </div>
        </div>

        {/* Previsualización */}
        {previewUrl && (
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col items-center">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="max-h-56 rounded-lg object-contain shadow-lg border border-slate-800"
            />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
              <span><strong className="text-slate-300">Archivo:</strong> {selectedFile.name}</span>
              <span><strong className="text-slate-300">Tamaño:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</span>
              <span><strong className="text-slate-300">MIME:</strong> {selectedFile.type}</span>
            </div>
          </div>
        )}

        {/* Campo extra req.body */}
        <div>
          <label htmlFor="image-desc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descripción o nota adicional (viaja en req.body):
          </label>
          <input
            id="image-desc"
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            placeholder="Ej: Foto de perfil de usuario..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Barra de Progreso con Axios */}
        {loading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progreso de subida (Axios):</span>
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
                <span>Subir Imagen con Axios</span>
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
