const Role = require('../models/rolesModel');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Add more controller methods as neededconst Role = require('../models/rolesModel');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// Crear un nuevo rol
exports.createRole = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const newRole = await Role.create({ nombre, descripcion });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// Obtener un rol por ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
};

// Actualizar un rol por ID
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const role = await Role.findByPk(id);
    if (role) {
      role.nombre = nombre;
      role.descripcion = descripcion;
      await role.save();
      res.json(role);
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Eliminar un rol por ID
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (role) {
      await role.destroy();
      res.json({ message: 'Role deleted successfully' });
    } else {
      res.status(404).json({ error: 'Role not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
};