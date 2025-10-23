import api from '../api'; // Ensure this path is correct and the file exists

const ordenCompraService = {
  getAll: async (params) => {
    // Fetch all ordenes de compra with optional query parameters
    return api.get('/ordenes-compra', { params });
  },
  getById: async (id) => {
    // Fetch a single orden de compra by ID
    return api.get(`/ordenes-compra/${id}`);
  },
  create: async (ordenCompra) => {
    // Create a new orden de compra
    return api.post('/ordenes-compra', ordenCompra);
  },
  update: async (id, ordenCompra) => {
    // Update an existing orden de compra by ID
    return api.put(`/ordenes-compra/${id}`, ordenCompra);
  },
  delete: async (id) => {
    // Delete an orden de compra by ID
    return api.delete(`/ordenes-compra/${id}`);
  },
  changeState: async (id, estado) => {
    // Change the state of an orden de compra (activate/deactivate)
    return api.patch(`/ordenes-compra/${id}/estado`, { estado });
  },
  
  cambiarEstado: async (id, estado) => {
    // Cambiar estado de la orden de compra
    return api.patch(`/ordenes-compra/${id}/estado`, { estado });
  },
  
  // Nuevos servicios para órdenes pendientes
  getPendientes: async (params) => {
    // Fetch all pending ordenes de compra with optional query parameters
    return api.get('/ordenes-compra/pendientes', { params });
  },
  
  getOrdenesPendientesPorSocio: async (socioId, params) => {
    // Fetch pending ordenes de compra for a specific socio
    return api.get(`/ordenes-compra/pendientes/socio/${socioId}`, { params });
  },
};

export default ordenCompraService;