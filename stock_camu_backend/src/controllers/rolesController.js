const { Role } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    // Log the received query parameters
    console.log('Received query parameters:', req.query);

    // Implementar paginación en el servidor
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Implementar filtros desde el servidor
    const filters = {};
    
    // Búsqueda general
    if (req.query.search) {
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { descripcion: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Filtros específicos por columna
    if (req.query.nombre) {
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    
    if (req.query.descripcion) {
      filters.descripcion = { [Op.like]: `%${req.query.descripcion}%` };
    }
    
    // Consulta con paginación y filtros
    const { count, rows } = await Role.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      roles: rows
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles', details: error.message });
  }
};

// Crear un nuevo rol
exports.createRole = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del rol es obligatorio' });
    }
    
    const newRole = await Role.create({ nombre, descripcion });
    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error al crear rol:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear rol', details: error.message });
  }
};

// Obtener un rol por ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({ error: 'Error al obtener rol', details: error.message });
  }
};

// Actualizar un rol por ID
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    if (nombre) role.nombre = nombre;
    if (descripcion !== undefined) role.descripcion = descripcion;
    
    await role.save();
    res.json(role);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un rol con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar rol', details: error.message });
  }
};

// Eliminar un rol por ID
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    
    await role.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ error: 'Error al eliminar rol', details: error.message });
  }
};

// Obtener roles paginados con búsqueda general y filtros específicos
exports.getAllPaginated = async (req, res) => {
  try {
    // Implementar paginación en el servidor
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Implementar filtros desde el servidor
    const filters = {};
    
    // Búsqueda general
    if (req.query.search) {
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { descripcion: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Filtros específicos por columna
    if (req.query.nombre) {
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    
    if (req.query.descripcion) {
      filters.descripcion = { [Op.like]: `%${req.query.descripcion}%` };
    }
    
    // Consulta con paginación y filtros
    const { count, rows } = await Role.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      roles: rows
    });
  } catch (error) {
    console.error('Error al obtener roles paginados:', error);
    res.status(500).json({ error: 'Error al obtener roles', details: error.message });
  }
};