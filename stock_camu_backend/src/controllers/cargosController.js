const { Cargo } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los cargos con paginación y filtros
exports.getAllCargos = async (req, res) => {
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

    const { count, rows } = await Cargo.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      cargos: rows
    });
  } catch (error) {
    console.error('Error al obtener cargos:', error);
    res.status(500).json({ error: 'Error al obtener cargos', details: error.message });
  }
};

// Obtener un cargo por ID
exports.getCargoById = async (req, res) => {
  try {
    const cargo = await Cargo.findByPk(req.params.id);
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    res.json(cargo);
  } catch (error) {
    console.error('Error al obtener cargo:', error);
    res.status(500).json({ message: 'Error al obtener cargo' });
  }
};

// Crear un nuevo cargo
exports.createCargo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del cargo es requerido' });
    }
    
    const nuevoCargo = await Cargo.create({
      nombre,
      descripcion
    });
    
    res.status(201).json(nuevoCargo);
  } catch (error) {
    console.error('Error al crear cargo:', error);
    res.status(500).json({ message: 'Error al crear cargo' });
  }
};

// Actualizar un cargo existente
exports.updateCargo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const cargo = await Cargo.findByPk(req.params.id);
    
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    
    await cargo.update({
      nombre: nombre || cargo.nombre,
      descripcion: descripcion !== undefined ? descripcion : cargo.descripcion
    });
    
    res.json(cargo);
  } catch (error) {
    console.error('Error al actualizar cargo:', error);
    res.status(500).json({ message: 'Error al actualizar cargo' });
  }
};

// Eliminar un cargo
exports.deleteCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findByPk(req.params.id);
    
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo no encontrado' });
    }
    
    await cargo.destroy();
    res.json({ message: 'Cargo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cargo:', error);
    res.status(500).json({ message: 'Error al eliminar cargo' });
  }
};