import api from '../api'; // Ensure this path is correct and the file exists

const detalleOrdenCompraService = {
  getAll: async (params) => {
    // Fetch all detalles de orden de compra with optional query parameters
    return api.get('/detalles-orden-compra', { params });
  },
  getById: async (id) => {
    // Fetch a single detalle de orden de compra by ID
    return api.get(`/detalles-orden-compra/${id}`);
  },
  getByOrdenCompra: async (ordenCompraId) => {
    // Fetch all detalles for a specific orden de compra
    return api.get(`/detalles-orden-compra/orden/${ordenCompraId}`);
  },
  create: async (detalleOrdenCompra) => {
    // Create a new detalle de orden de compra
    return api.post('/detalles-orden-compra', detalleOrdenCompra);
  },
  update: async (id, detalleOrdenCompra) => {
    // Update an existing detalle de orden de compra by ID
    return api.put(`/detalles-orden-compra/${id}`, detalleOrdenCompra);
  },
  delete: async (id) => {
    // Delete a detalle de orden de compra by ID
    return api.delete(`/detalles-orden-compra/${id}`);
  },
  // Bulk operations for managing multiple detalles at once
  createMultiple: async (detalles) => {
    // Create multiple detalles de orden de compra
    const promises = detalles.map(detalle => api.post('/detalles-orden-compra', detalle));
    return Promise.all(promises);
  },
  updateMultiple: async (detalles) => {
    // Update multiple detalles de orden de compra
    const promises = detalles.map(detalle => 
      api.put(`/detalles-orden-compra/${detalle.id}`, detalle)
    );
    return Promise.all(promises);
  },
  deleteMultiple: async (ids) => {
    // Delete multiple detalles de orden de compra by IDs
    const promises = ids.map(id => api.delete(`/detalles-orden-compra/${id}`));
    return Promise.all(promises);
  },
  // Método para obtener detalles por orden_compra_id
  getByOrdenId: async (ordenId) => {
    try {
      const response = await api.get(`/detalles-orden-compra/orden/${ordenId}`);
      return response;
    } catch (error) {
      console.error('Error al obtener detalles por orden ID:', error);
      throw error;
    }
  },
};

export default detalleOrdenCompraService;