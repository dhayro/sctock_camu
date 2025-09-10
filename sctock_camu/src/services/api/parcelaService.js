
import api from '../api';

// Obtener todas las parcelas con paginación y filtros
export const getAllParcelas = async (params) => {
  try {
    const response = await api.get('/parcelas', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener parcelas:', error);
    throw error;
  }
};

// Obtener una parcela por ID
export const getParcelaById = async (id) => {
  try {
    const response = await api.get(`/parcelas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener parcela:', error);
    throw error;
  }
};

// Obtener parcelas por socio
export const getParcelasBySocio = async (socioId) => {
  try {
    const response = await api.get(`/parcelas/socio/${socioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener parcelas por socio:', error);
    throw error;
  }
};

// Crear una nueva parcela
export const createParcela = async (parcelaData) => {
  try {
    const response = await api.post('/parcelas', parcelaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear parcela:', error);
    throw error;
  }
};

// Actualizar una parcela existente
export const updateParcela = async (id, parcelaData) => {
  try {
    const response = await api.put(`/parcelas/${id}`, parcelaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar parcela:', error);
    throw error;
  }
};

// Eliminar una parcela
export const deleteParcela = async (id) => {
  try {
    const response = await api.delete(`/parcelas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar parcela:', error);
    throw error;
  }
};

// Buscar parcelas
export const searchParcelas = async (term) => {
  try {
    const response = await api.get('/parcelas/search', {
      params: { term }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar parcelas:', error);
    throw error;
  }
};

// Exportación por defecto
export default {
  getAllParcelas,
  getParcelaById,
  getParcelasBySocio,
  createParcela,
  updateParcela,
  deleteParcela,
  searchParcelas
};
