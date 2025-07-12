const { Usuario, Role, Personal } = require('../models');
const { Op } = require('sequelize');  // Añadimos esta importación
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        { model: Role, as: 'rol' },
        { model: Personal, as: 'personal' }
      ],
      attributes: { exclude: ['password'] }
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      include: [
        { model: Role, as: 'rol' },
        { model: Personal, as: 'personal' }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const { personal_id, usuario, password, email, rol_id } = req.body;

    // Validaciones básicas
    if (!usuario || !password || !email || !rol_id) {
      return res.status(400).json({ message: 'Datos incompletos. Usuario, contraseña, email y rol son obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya está registrado' });
    }

    // Verificar si el rol existe
    const roleExists = await Role.findByPk(rol_id);
    if (!roleExists) {
      return res.status(400).json({ message: 'El rol especificado no existe' });
    }

    // Verificar si el personal existe (si se proporciona)
    if (personal_id) {
      const personalExists = await Personal.findByPk(personal_id);
      if (!personalExists) {
        return res.status(400).json({ message: 'El personal especificado no existe' });
      }
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      personal_id,
      usuario,
      password: hashedPassword,
      email,
      rol_id,
      estado: true
    });

    // Excluir la contraseña de la respuesta
    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON();

    // Obtener el usuario con sus relaciones
    const usuarioConRelaciones = await Usuario.findByPk(nuevoUsuario.id, {
      include: [
        { model: Role, as: 'rol' },
        { model: Personal, as: 'personal' }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json(usuarioConRelaciones);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario', details: error.message });
  }
};

// Actualizar un usuario existente
exports.updateUsuario = async (req, res) => {
  try {
    const { personal_id, usuario, password, email, rol_id, estado } = req.body;
    const userId = req.params.id;

    const usuarioExistente = await Usuario.findByPk(userId);
    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está cambiando el nombre de usuario, verificar que no exista ya
    if (usuario && usuario !== usuarioExistente.usuario) {
      const existingUser = await Usuario.findOne({ where: { usuario } });
      if (existingUser) {
        return res.status(400).json({ message: 'El nuevo nombre de usuario ya está registrado' });
      }
    }

    // Verificar si el rol existe (si se está actualizando)
    if (rol_id) {
      const roleExists = await Role.findByPk(rol_id);
      if (!roleExists) {
        return res.status(400).json({ message: 'El rol especificado no existe' });
      }
    }

    // Verificar si el personal existe (si se está actualizando)
    if (personal_id) {
      const personalExists = await Personal.findByPk(personal_id);
      if (!personalExists) {
        return res.status(400).json({ message: 'El personal especificado no existe' });
      }
    }

    await usuarioExistente.update({
      personal_id: personal_id !== undefined ? personal_id : usuarioExistente.personal_id,
      usuario: usuario || usuarioExistente.usuario,
      password: password ? password : usuarioExistente.password, // Asegúrate de encriptar la contraseña si se actualiza
      email: email || usuarioExistente.email,
      rol_id: rol_id || usuarioExistente.rol_id,
      estado: estado !== undefined ? estado : usuarioExistente.estado
    });

    res.json(usuarioExistente);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', details: error.message });
  }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    await usuario.destroy();
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// Autenticación de usuario (login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar que se proporcionen email/usuario y password
    if (!email || !password) {
      return res.status(400).json({ message: 'Email/usuario y contraseña son requeridos' });
    }
    
    // Buscar el usuario por email o por nombre de usuario
    const usuario = await Usuario.findOne({ 
      where: {
        [Op.or]: [
          { email: email },
          { usuario: email }
        ]
      },
      include: [
        { model: Role, as: 'rol' },
        { model: Personal, as: 'personal' }
      ]
    });
    
    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar si el usuario está activo
    if (!usuario.estado) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }
    
    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        usuario: usuario.usuario,
        rol: usuario.rol ? usuario.rol.nombre : null
      }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '24h' }
    );
    
    // Excluir la contraseña de la respuesta
    const { password: _, ...usuarioSinPassword } = usuario.toJSON();
    
    res.json({
      usuario: usuarioSinPassword,
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el proceso de login' });
  }
};

// Obtener el usuario actual (a partir del token)
exports.getCurrentUser = async (req, res) => {
  try {
    // El middleware de autenticación ya ha verificado el token y añadido el usuario a req
    const usuario = await Usuario.findByPk(req.usuario.id, {
      include: [
        { model: Role, as: 'rol' },
        { model: Personal, as: 'personal' }
      ],
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ message: 'Error al obtener usuario actual' });
  }
};