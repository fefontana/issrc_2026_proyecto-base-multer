import axios from 'axios';

// Creamos una instancia personalizada de Axios para la API
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000 // 30 segundos
});

// Interceptor opcional para registrar peticiones salientes en consola
apiClient.interceptors.request.use((config) => {
  console.log(`[Axios Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

/**
 * Función auxiliar para extraer el mensaje de error de la respuesta de Axios
 */
const handleAxiosError = (error, defaultMessage) => {
  console.error('[Axios Error Detallado]:', error);
  if (error.response && error.response.data && error.response.data.message) {
    return new Error(error.response.data.message);
  }
  return new Error(error.message || defaultMessage);
};

/**
 * Servicio para subir una sola imagen al backend con Axios
 * @param {File} file - Archivo de imagen seleccionado
 * @param {string} description - Descripción opcional (viaja en req.body)
 * @param {function} onProgress - Callback opcional para porcentaje de carga
 */
export const uploadImageService = async (file, description = '', onProgress = null) => {
  console.log('[Axios API] Iniciando subida de imagen:', file.name, {
    size: file.size,
    type: file.type,
    description
  });

  const formData = new FormData();
  formData.append('image', file);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[Axios Progress Imagen] ${percentCompleted}%`);
          onProgress(percentCompleted);
        }
      }
    });

    console.log('[Axios API] Respuesta exitosa al subir imagen:', response.data);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error, 'Error al subir la imagen con Axios');
  }
};

/**
 * Servicio para subir un solo documento al backend con Axios (PDF, Excel, Word, etc.)
 * @param {File} file - Archivo de documento
 * @param {string} description - Descripción opcional
 * @param {function} onProgress - Callback opcional de progreso
 */
export const uploadDocumentService = async (file, description = '', onProgress = null) => {
  console.log('[Axios API] Iniciando subida de documento:', file.name, {
    size: file.size,
    type: file.type,
    description
  });

  const formData = new FormData();
  formData.append('document', file);
  if (description) {
    formData.append('description', description);
  }

  try {
    const response = await apiClient.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[Axios Progress Documento] ${percentCompleted}%`);
          onProgress(percentCompleted);
        }
      }
    });

    console.log('[Axios API] Respuesta exitosa al subir documento:', response.data);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error, 'Error al subir el documento con Axios');
  }
};

/**
 * Servicio para subir múltiples archivos a la vez con Axios
 * @param {File[]} filesList - Arreglo o FileList de archivos
 * @param {function} onProgress - Callback opcional de progreso
 */
export const uploadMultipleService = async (filesList, onProgress = null) => {
  console.log('[Axios API] Iniciando subida múltiple con Axios. Total archivos:', filesList.length);

  const formData = new FormData();
  for (let i = 0; i < filesList.length; i++) {
    formData.append('files', filesList[i]);
  }

  try {
    const response = await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`[Axios Progress Múltiple] ${percentCompleted}%`);
          onProgress(percentCompleted);
        }
      }
    });

    console.log('[Axios API] Respuesta exitosa al subir múltiples archivos:', response.data);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error, 'Error al subir los archivos con Axios');
  }
};

/**
 * Servicio para obtener la lista de archivos guardados en el servidor
 */
export const getFilesService = async () => {
  console.log('[Axios API] Consultando lista de archivos en el servidor (GET /files)...');
  try {
    const response = await apiClient.get('/files');
    console.log('[Axios API] Archivos recibidos del servidor:', response.data);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error, 'Error al obtener la lista de archivos con Axios');
  }
};

/**
 * Servicio para eliminar un archivo del servidor
 */
export const deleteFileService = async (category, filename) => {
  console.log(`[Axios API] Solicitando eliminación de archivo (DELETE /files/${category}/${filename})`);
  try {
    const response = await apiClient.delete(`/files/${category}/${filename}`);
    console.log('[Axios API] Respuesta de eliminación:', response.data);
    return response.data;
  } catch (error) {
    throw handleAxiosError(error, 'Error al eliminar el archivo con Axios');
  }
};

export default apiClient;
