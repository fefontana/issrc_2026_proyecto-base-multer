const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Rutas de carpetas de almacenamiento
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents');

// Asegurar que las carpetas existan automáticamente
[UPLOADS_DIR, IMAGES_DIR, DOCUMENTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[Multer Config] Carpeta creada: ${dir}`);
  }
});

// Configuración de almacenamiento en disco (DiskStorage)
const storage = multer.diskStorage({


  destination: (req, file, cb) => {
    // Determinamos la carpeta destino según el tipo MIME del archivo
    if (file.mimetype.startsWith('image/')) {
      cb(null, IMAGES_DIR);
    } else {
      cb(null, DOCUMENTS_DIR);
    }
  },


  filename: (req, file, cb) => {
    // Sanitizamos el nombre original y agregamos timestamp para evitar duplicados
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50); // limitamos longitud
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const finalName = `${cleanName}-${uniqueSuffix}${ext}`;
    
    console.log(`[Multer DiskStorage] Asignando nombre a archivo: ${file.originalname} -> ${finalName}`);
    cb(null, file.originalname);
  }


});

// Filtro para solo imágenes
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  console.log(`[Multer imageFilter] Evaluando archivo: ${file.originalname} (${file.mimetype})`);

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido: Solo se admiten archivos de imagen (JPG, PNG, GIF, WEBP, SVG)'), false);
  }
};

// Filtro para solo documentos (PDF, Excel, Word, CSV, TXT)
const documentFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.csv', '.txt', '.odt', '.ods'];

  console.log(`[Multer documentFilter] Evaluando documento: ${file.originalname} (${ext})`);

  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido: Solo se admiten documentos (PDF, Excel, Word, CSV, TXT)'), false);
  }
};

// Filtro general (permite imágenes y documentos comunes)
const generalFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [
    // Imágenes
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Documentos
    '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.csv', '.txt', '.odt', '.ods'
  ];

  console.log(`[Multer generalFilter] Evaluando archivo múltiple: ${file.originalname} (${ext})`);

  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`El archivo ${file.originalname} no tiene un formato válido permitido.`), false);
  }
};

// Instancias de Multer con límites de tamaño
const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Megabytes
  }
});

const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 Megabytes
  }
});

const uploadGeneral = multer({
  storage,
  fileFilter: generalFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 Megabytes por archivo
  }
});

module.exports = {
  uploadImage,
  uploadDocument,
  uploadGeneral,
  UPLOADS_DIR,
  IMAGES_DIR,
  DOCUMENTS_DIR
};
