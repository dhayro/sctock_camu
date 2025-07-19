import api from '../api';

const usuarioService = {
  // createUser: async (userData) => {
  //   try {
  //     const response = await api.post('/usuarios', userData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error al crear usuario:', error);
  //     throw error;
  //   }
  // },
  // updateUser: async (userId, userData) => {
  //   try {
  //     const response = await api.put(`/usuarios/${userId}`, userData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error al actualizar usuario:', error);
  //     throw error;
  //   }
  // },
  getAllUsuarios: async (params) => {
    try {
      const response = await api.get('/usuarios', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  getUsuarioById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  createUsuario: async (usuarioData) => {
    try {
      const response = await api.post('/usuarios', usuarioData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  updateUsuario: async (id, usuarioData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, usuarioData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  resetPassword: async (userId) => {
    try {
      const response = await api.put(`/usuarios/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      console.error('Error al resetear la contraseña:', error);
      throw error;
    }
  },
  // Puedes agregar más métodos según sea necesario
};

export default usuarioService;