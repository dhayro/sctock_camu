import api from '../api'; // Ensure this path is correct and the file exists

const tipoFrutaService = {
  // Define your service methods here
  getAll: async (params) => {
    // Implementation
    return api.get('/tipos-fruta', { params });
  },
  create: async (tipoFruta) => {
    // Implementation
    return api.post('/tipos-fruta', tipoFruta);
  },
  update: async (id, tipoFruta) => {
    // Implementation
    return api.put(`/tipos-fruta/${id}`, tipoFruta);
  },
  delete: async (id) => {
    // Implementation
    return api.delete(`/tipos-fruta/${id}`);
  },
};

export default tipoFrutaService;