import api from '../api';
import { toast } from 'react-toastify';

const balanzaService = {
  // Obtener puertos COM disponibles
  getPuertosDisponibles: async () => {
    try {
      const response = await api.get('/balanza/puertos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener puertos disponibles:', error);
      throw error;
    }
  },

  // Conectar a la balanza
  connect: async (connectionData) => {
    try {
      const response = await api.post('/balanza/connect', connectionData);
      return response.data;
    } catch (error) {
      console.error('Error al conectar balanza:', error);
      throw error;
    }
  },

  // Desconectar balanza
  disconnect: async () => {
    try {
      const response = await api.post('/balanza/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error al desconectar balanza:', error);
      throw error;
    }
  },

  // Obtener estado de la balanza
  getStatus: async () => {
    try {
      const response = await api.get('/balanza/status');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estado de balanza:', error);
      throw error;
    }
  },

  // Obtener peso actual
  getWeight: async () => {
    try {
      const response = await api.get('/balanza/weight');
      return response.data;
    } catch (error) {
      console.error('Error al obtener peso:', error);
      
      // Mostrar toast de error
      toast.error(error.response?.data?.error || 'Error al obtener el peso de la balanza');
      
      // Devolver datos por defecto en caso de error
      return {
        weight: 0,
        unit: 'kg',
        stable: false,
        timestamp: new Date().toISOString(),
        connected: false,
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  },

  // Configurar balanza
  configurarBalanza: async (config) => {
    try {
      const response = await api.post('/balanza/configurar', config);
      return response.data;
    } catch (error) {
      console.error('Error al configurar balanza:', error);
      throw error;
    }
  },

  // Guardar peso en la base de datos
  saveWeight: async (pesajeData) => {
    try {
      const response = await api.post('/balanza/guardar-peso', pesajeData);
      return response.data;
    } catch (error) {
      console.error('Error al guardar peso:', error);
      throw error;
    }
  },

  // Obtener pesajes por ingreso
  getPesajes: async (ingresoId) => {
    try {
      const response = await api.get(`/balanza/pesajes/${ingresoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pesajes:', error);
      throw error;
    }
  },

  // Eliminar pesaje
  deletePesaje: async (pesajeId) => {
    try {
      const response = await api.delete(`/balanza/pesajes/${pesajeId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar pesaje:', error);
      throw error;
    }
  },

  // Actualizar observación de pesaje
  updateObservacionPesaje: async (pesajeId, observacion) => {
    try {
      const response = await api.patch(`/balanza/pesajes/${pesajeId}/observacion`, {
        observacion
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar observación:', error);
      throw error;
    }
  },

  // Iniciar pesaje en tiempo real
  iniciarPesajeRealtime: async () => {
    try {
      const response = await api.get('/balanza/realtime');
      return response.data;
    } catch (error) {
      console.error('Error al iniciar pesaje en tiempo real:', error);
      throw error;
    }
  },

  // Activar/desactivar modo simulado
  toggleMockMode: async (enabled) => {
    try {
      const response = await api.post('/balanza/mock', { enabled });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar modo simulado:', error);
      throw error;
    }
  },

  // Obtener datos crudos de la balanza
  getRawData: async () => {
    try {
      const response = await api.get('/balanza/raw-data');
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos crudos:', error);
      throw error;
    }
  },

  // Obtener últimos datos recibidos
  getLastData: async () => {
    try {
      const response = await api.get('/balanza/last-data');
      return response.data;
    } catch (error) {
      console.error('Error al obtener últimos datos:', error);
      throw error;
    }
  },

  // Obtener historial de datos
  getDataHistory: async (limit = 20) => {
    try {
      const response = await api.get(`/balanza/data-history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de datos:', error);
      throw error;
    }
  },

  // Crear conexión EventSource para datos en tiempo real
  createRealtimeConnection: (onData, onError) => {
    const eventSource = new EventSource(`${api.defaults.baseURL}/balanza/pesaje-realtime`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
      } catch (error) {
        console.error('Error al parsear datos en tiempo real:', error);
        onError(error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error en conexión de tiempo real:', error);
      onError(error);
    };

    return eventSource;
  },

  // Obtener último peso procesado
  getLastProcessedWeight: async () => {
    try {
      const response = await api.get('/balanza/last-processed-weight');
      return response.data;
    } catch (error) {
      console.error('Error al obtener último peso procesado:', error);
      toast.error('Error al obtener el último peso procesado');
      throw error;
    }
  },
};

export default balanzaService;