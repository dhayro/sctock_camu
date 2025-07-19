import api from '../api'; // Ensure this is the correct path to your Axios instance

// Obtener todos los clientes con paginación y filtros
export const getAllClientes = async (params) => {
  try {
    const response = await api.get('/clientes', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};

// Obtener un cliente por ID
export const getClienteById = async (id) => {
  try {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw error;
  }
};

// Crear un nuevo cliente
export const createCliente = async (clienteData) => {
  try {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCliente = async (id) => {
  try {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw error;
  }
};

export default {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
};