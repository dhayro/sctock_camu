import api from '../api'; // Ensure this path is correct and the file exists

const cargosService = {
  // Define your service methods here
  getAll: async (params) => {
    // Implementation
    return api.get('/cargos', { params });
  },
  create: async (cargo) => {
    // Implementation
    return api.post('/cargos', cargo);
  },
  update: async (id, cargo) => {
    // Implementation
    return api.put(`/cargos/${id}`, cargo);
  },
  delete: async (id) => {
    // Implementation
    return api.delete(`/cargos/${id}`);
  },
};

export default cargosService;