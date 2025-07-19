import api from '../api'; // Ensure this path is correct and the file exists

const unidadMedidaService = {
  getAll: async (params) => {
    // Implementation
    return api.get('/unidades-medida', { params });
  },
  getById: async (id) => {
    // Implementation
    return api.get(`/unidades-medida/${id}`);
  },
  create: async (unidadMedida) => {
    // Implementation
    return api.post('/unidades-medida', unidadMedida);
  },
  update: async (id, unidadMedida) => {
    // Implementation
    return api.put(`/unidades-medida/${id}`, unidadMedida);
  },
  delete: async (id) => {
    // Implementation
    return api.delete(`/unidades-medida/${id}`);
  },
};

export default unidadMedidaService;