import api from '../api';

const detallePesajeService = {
  // Obtener todos los detalles de pesaje
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/detalles-pesaje', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalles de pesaje por ID de ingreso
  getByIngresoId: async (ingresoId) => {
    try {
      const response = await api.get(`/detalles-pesaje/ingreso/${ingresoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un detalle de pesaje por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/detalles-pesaje/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo detalle de pesaje
  create: async (detallePesajeData) => {
    try {
      const response = await api.post('/detalles-pesaje', detallePesajeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear múltiples detalles de pesaje para un ingreso
  createBulk: async (bulkData) => {
    try {
      const response = await api.post('/detalles-pesaje/bulk', bulkData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un detalle de pesaje
  update: async (id, detallePesajeData) => {
    try {
      const response = await api.put(`/detalles-pesaje/${id}`, detallePesajeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un detalle de pesaje
  delete: async (id) => {
    try {
      const response = await api.delete(`/detalles-pesaje/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default detallePesajeService;