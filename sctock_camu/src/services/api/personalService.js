import api from '../api'; // Ensure this path is correct and the file exists

const personalService = {
  // Define your service methods here
  getAll: async (params) => {
    // Implementation
    return api.get('/personal', { params });
  },
  create: async (personal) => {
    // Implementation
    return api.post('/personal', personal);
  },
  update: async (id, personal) => {
    // Implementation
    return api.put(`/personal/${id}`, personal);
  },
  delete: async (id) => {
    // Implementation
    return api.delete(`/personal/${id}`);
  },
};

export default personalService;