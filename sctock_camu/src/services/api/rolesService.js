import api from '../api'; // Ensure this path is correct and the file exists

const rolesService = {
  // Define your service methods here
  getAll: async (params) => {
    // Implementation
    return api.get('/roles', { params });
  },
  create: async (role) => {
    // Implementation
    return api.post('/roles', role);
  },
  update: async (id, role) => {
    // Implementation
    return api.put(`/roles/${id}`, role);
  },
  delete: async (id) => {
    // Implementation
    return api.delete(`/roles/${id}`);
  },
};

export default rolesService;