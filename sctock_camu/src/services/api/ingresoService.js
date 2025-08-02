import api from '../api'; // Ensure this path is correct and the file exists

const ingresoService = {
  // Obtener todos los ingresos con filtros y paginación
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/ingresos', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un ingreso por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/ingresos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo ingreso
  create: async (ingresoData) => {
    try {
      const response = await api.post('/ingresos', ingresoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un ingreso
  update: async (id, ingresoData) => {
    try {
      const response = await api.put(`/ingresos/${id}`, ingresoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un ingreso
  delete: async (id) => {
    try {
      const response = await api.delete(`/ingresos/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar el estado de un ingreso (activar/desactivar)
  changeState: async (id, estado) => {
    // Change the state of an ingreso (activate/deactivate)
    return api.patch(`/ingresos/${id}/cambiar-estado`, { estado });
  },

  // Buscar ingresos por término (número de ingreso o nombre de socio)
  search: async (term) => {
    // Search ingresos by term (numero_ingreso or socio name)
    return api.get('/ingresos/search', { params: { term } });
  },

  // Obtener estadísticas de ingresos
  getStats: async () => {
    try {
      const response = await api.get('/ingresos/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ingresoService;