import { useState } from 'react';
import {
  Image as ImageIcon,
  FileSpreadsheet,
  Files,
  FolderOpen,
  Server
} from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import DocumentUploader from './components/DocumentUploader';
import MultipleUploader from './components/MultipleUploader';
import FileList from './components/FileList';

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    console.log('[App] Archivo subido con éxito. Disparando recarga de lista...');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Fondo decorativo con resplandor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 py-8 md:py-12 flex-1">
        {/* Encabezado Principal */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs md:text-sm font-semibold mb-4 shadow-inner">
            <Server size={15} />
            <span>Node.js • Express • Multer • React & Tailwind</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent mb-3">
            Gestión de Archivos con Multer
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Demostración en vivo de subida y almacenamiento de imágenes (JPG, PNG) y documentos (Excel, PDF, Word)
            con validación de tipos, límites y consumo desde React.
          </p>
        </header>

        {/* Barra de Navegación por Pestañas */}
        <nav className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8" aria-label="Pestañas de subida">
          <button
            type="button"
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'image'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102 ring-1 ring-indigo-400'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
            }`}
            onClick={() => setActiveTab('image')}
          >
            <ImageIcon size={18} />
            <span>Subir Fotos</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'document'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102 ring-1 ring-indigo-400'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
            }`}
            onClick={() => setActiveTab('document')}
          >
            <FileSpreadsheet size={18} />
            <span>Subir Documentos (Excel, PDF)</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'multiple'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102 ring-1 ring-indigo-400'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
            }`}
            onClick={() => setActiveTab('multiple')}
          >
            <Files size={18} />
            <span>Subida Múltiple</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'files'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102 ring-1 ring-indigo-400'
                : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800'
            }`}
            onClick={() => setActiveTab('files')}
          > 
            <FolderOpen size={18} />
            <span>Ver Archivos en Servidor</span>
          </button>
        </nav>

        {/* Contenido Principal */}
        <main className="space-y-8">
          {activeTab === 'image' && (
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'document' && (
            <DocumentUploader onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'multiple' && (
            <MultipleUploader onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'files' && (
            <FileList refreshTrigger={refreshTrigger} />
          )}

          {/* Vista inferior fija de archivos guardados (cuando se está subiendo archivos) */}
          {activeTab !== 'files' && (
            <div className="pt-6">
              <FileList refreshTrigger={refreshTrigger} />
            </div>
          )}
        </main>
      </div>

      {/* Pie de página */}
      <footer className="py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>2do Año - APP MOV • Demostración de Multer con Node.js & React (Tailwind CSS)</p>
      </footer>
    </div>
  );
}

export default App;
