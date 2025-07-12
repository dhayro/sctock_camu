const { Area } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las áreas con paginación y filtros
exports.getAllAreas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.search) {
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { descripcion: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    if (req.query.nombre) {
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    if (req.query.descripcion) {
      filters.descripcion = { [Op.like]: `%${req.query.descripcion}%` };
    }

    const { count, rows } = await Area.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      areas: rows
    });
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: 'Error al obtener áreas', details: error.message });
  }
};

// Obtener un área por ID
exports.getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findByPk(id);
    
    if (!area) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    
    res.json(area);
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({ error: 'Error al obtener área', details: error.message });
  }
};

// Crear una nueva área
exports.createArea = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    const newArea = await Area.create({
      nombre,
      descripcion
    });
    
    res.status(201).json(newArea);
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ error: 'Error al crear área', details: error.message });
  }
};

// Actualizar un área existente
exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const area = await Area.findByPk(id);
    
    if (!area) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    
    // Actualizar campos si se proporcionan
    if (nombre) area.nombre = nombre;
    if (descripcion !== undefined) area.descripcion = descripcion;
    
    await area.save();
    
    res.json(area);
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ error: 'Error al actualizar área', details: error.message });
  }
};

// Eliminar un área
exports.deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await Area.findByPk(id);
    
    if (!area) {
      return res.status(404).json({ error: 'Área no encontrada' });
    }
    
    await area.destroy();
    
    res.json({ message: 'Área eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({ error: 'Error al eliminar área', details: error.message });
  }
};