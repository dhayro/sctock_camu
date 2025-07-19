import api from '../api'; // Ensure this path is correct and the file exists

const productoService = {
  getAll: async (params) => {
    // Fetch all products with optional query parameters
    return api.get('/productos', { params });
  },
  create: async (producto) => {
    // Create a new product
    return api.post('/productos', producto);
  },
  update: async (id, producto) => {
    // Update an existing product by ID
    return api.put(`/productos/${id}`, producto);
  },
  delete: async (id) => {
    // Delete a product by ID
    return api.delete(`/productos/${id}`);
  },
  changeState: async (id, estado) => {
    // Change the state of a product (activate/deactivate)
    return api.patch(`/productos/${id}/estado`, { estado });
  },
};

export default productoService;