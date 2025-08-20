import api from '../api'; // Asegúrate de que este sea el path correcto a tu instancia de Axios

// Obtener todos los socios con paginación y filtros
export const getAllSocios = async (params) => {
  try {
    const response = await api.get('/socios', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener socios:', error);
    throw error;
  }
};

// Obtener un socio por ID
export const getSocioById = async (id) => {
  try {
    const response = await api.get(`/socios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener socio:', error);
    throw error;
  }
};

// Crear un nuevo socio
export const createSocio = async (socioData) => {
  try {
    const response = await api.post('/socios', socioData);
    return response.data;
  } catch (error) {
    console.error('Error al crear socio:', error);
    throw error;
  }
};

// Actualizar un socio existente
export const updateSocio = async (id, socioData) => {
  try {
    const response = await api.put(`/socios/${id}`, socioData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar socio:', error);
    throw error;
  }
};

// Eliminar un socio
export const deleteSocio = async (id) => {
  try {
    const response = await api.delete(`/socios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    throw error;
  }
};

// Obtener contribuciones de socios por rango de fechas
export const getSociosContribucionPorFecha = async (fechaInicio, fechaFin) => {
  try {
    const response = await api.get('/socios/contribuciones', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener contribuciones de socios:', error);
    throw error;
  }
};

export default {
  getAllSocios,
  getSocioById,
  createSocio,
  updateSocio,
  deleteSocio,
  getSociosContribucionPorFecha
};
