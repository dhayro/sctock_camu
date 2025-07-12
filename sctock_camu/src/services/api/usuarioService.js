import api from '../api';

const usuarioService = {
  createUser: async (userData) => {
    try {
      const response = await api.post('/usuarios', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/usuarios/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },
  // Puedes agregar más métodos según sea necesario
};

export default usuarioService;