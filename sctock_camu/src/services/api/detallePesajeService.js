import api from '../api';

const detallePesajeService = {
  // Obtener todos los detalles de pesaje
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/detalle-pesaje', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener detalles de pesaje por ID de ingreso
  getByIngresoId: async (ingresoId) => {
    try {
      const response = await api.get(`/balanza/pesajes/${ingresoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un detalle de pesaje por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/detalle-pesaje/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo detalle de pesaje
  create: async (detallePesajeData) => {
    try {
      const response = await api.post('/balanza/guardar-peso', detallePesajeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un detalle de pesaje
  update: async (id, detallePesajeData) => {
    try {
      const response = await api.put(`/detalle-pesaje/${id}`, detallePesajeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar observación de un pesaje
  updateObservacion: async (id, observacion) => {
    try {
      const response = await api.patch(`/balanza/pesajes/${id}/observacion`, { observacion });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un detalle de pesaje
  delete: async (id) => {
    try {
      const response = await api.delete(`/balanza/pesajes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default detallePesajeService;