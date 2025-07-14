const { Personal, Cargo, Area, Usuario, Role } = require('../models'); // Ensure Role is imported
const { Op } = require('sequelize');

// Obtener todo el personal con paginación y filtros
exports.getAllPersonal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    // General search across multiple fields
    if (req.query.search) {
      filters[Op.or] = [
        { dni: { [Op.like]: `%${req.query.search}%` } },
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { apellido: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } },
        { '$cargo.nombre$': { [Op.like]: `%${req.query.search}%` } },
        { '$area.nombre$': { [Op.like]: `%${req.query.search}%` } },
        { '$usuario.usuario$': { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Specific filters
    if (req.query.dni) {
      filters.dni = { [Op.like]: `%${req.query.dni}%` };
    }
    if (req.query.nombre) {
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    if (req.query.apellido) {
      filters.apellido = { [Op.like]: `%${req.query.apellido}%` };
    }
    if (req.query.email) {
      filters.email = { [Op.like]: `%${req.query.email}%` };
    }
    if (req.query.cargo) {
      filters['$cargo.nombre$'] = { [Op.like]: `%${req.query.cargo}%` };
    }
    if (req.query.area) {
      filters['$area.nombre$'] = { [Op.like]: `%${req.query.area}%` };
    }
    if (req.query.usuario) {
      filters['$usuario.usuario$'] = { [Op.like]: `%${req.query.usuario}%` };
    }

    const { count, rows } = await Personal.findAndCountAll({
      where: filters,
      include: [
        { model: Cargo, as: 'cargo', attributes: ['id', 'nombre'] },
        { model: Area, as: 'area', attributes: ['id', 'nombre'] },
        { 
          model: Usuario, 
          as: 'usuario', 
          attributes: ['id', 'usuario', 'estado'],
          include: [
            { model: Role, as: 'rol', attributes: ['id', 'nombre'] }
          ]
        }
      ],
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      personal: rows.map(personal => ({
        ...personal.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ message: 'Error al obtener personal', details: error.message });
  }
};

// Obtener personal por ID
exports.getPersonalById = async (req, res) => {
  try {
    const personal = await Personal.findByPk(req.params.id, {
      include: [
        { model: Cargo, as: 'cargo' },
        { model: Area, as: 'area' }
      ]
    });
    
    if (!personal) {
      return res.status(404).json({ message: 'Personal no encontrado' });
    }
    
    res.json(personal);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ message: 'Error al obtener personal' });
  }
};

// Crear nuevo personal
exports.createPersonal = async (req, res) => {
  try {
    const { 
      dni, 
      nombre, 
      apellido, 
      cargo_id, 
      area_id, 
      telefono, 
      direccion, 
      email 
    } = req.body;
    
    // Validaciones básicas
    if (!dni || !nombre || !apellido || !cargo_id) {
      return res.status(400).json({ 
        message: 'Datos incompletos. DNI, nombre, apellido y cargo son obligatorios' 
      });
    }
    
    // Verificar si el DNI ya existe
    const existingPersonal = await Personal.findOne({ where: { dni } });
    if (existingPersonal) {
      return res.status(400).json({ message: 'El DNI ya está registrado' });
    }
    
    // Verificar si el cargo existe
    const cargoExists = await Cargo.findByPk(cargo_id);
    if (!cargoExists) {
      return res.status(400).json({ message: 'El cargo especificado no existe' });
    }
    
    // Verificar si el área existe (si se proporciona)
    if (area_id) {
      const areaExists = await Area.findByPk(area_id);
      if (!areaExists) {
        return res.status(400).json({ message: 'El área especificada no existe' });
      }
    }
    
    const nuevoPersonal = await Personal.create({
      dni,
      nombre,
      apellido,
      cargo_id,
      area_id,
      telefono,
      direccion,
      email,
      estado: true
    });
    
    // Obtener el personal con sus relaciones
    const personalConRelaciones = await Personal.findByPk(nuevoPersonal.id, {
      include: [
        { model: Cargo, as: 'cargo' },
        { model: Area, as: 'area' }
      ]
    });
    
    res.status(201).json(personalConRelaciones);
  } catch (error) {
    console.error('Error al crear personal:', error);
    res.status(500).json({ message: 'Error al crear personal' });
  }
};

// Actualizar personal existente
exports.updatePersonal = async (req, res) => {
  try {
    const { 
      dni, 
      nombre, 
      apellido, 
      cargo_id, 
      area_id, 
      telefono, 
      direccion, 
      email,
      estado 
    } = req.body;
    
    const personal = await Personal.findByPk(req.params.id);
    
    if (!personal) {
      return res.status(404).json({ message: 'Personal no encontrado' });
    }
    
    // Si se está cambiando el DNI, verificar que no exista ya
    if (dni && dni !== personal.dni) {
      const existingPersonal = await Personal.findOne({ where: { dni } });
      if (existingPersonal) {
        return res.status(400).json({ message: 'El nuevo DNI ya está registrado' });
      }
    }
    
    // Verificar si el cargo existe (si se está actualizando)
    if (cargo_id) {
      const cargoExists = await Cargo.findByPk(cargo_id);
      if (!cargoExists) {
        return res.status(400).json({ message: 'El cargo especificado no existe' });
      }
    }
    
    // Verificar si el área existe (si se está actualizando)
    if (area_id) {
      const areaExists = await Area.findByPk(area_id);
      if (!areaExists) {
        return res.status(400).json({ message: 'El área especificada no existe' });
      }
    }
    
    await personal.update({
      dni: dni || personal.dni,
      nombre: nombre || personal.nombre,
      apellido: apellido || personal.apellido,
      cargo_id: cargo_id || personal.cargo_id,
      area_id: area_id !== undefined ? area_id : personal.area_id,
      telefono: telefono !== undefined ? telefono : personal.telefono,
      direccion: direccion !== undefined ? direccion : personal.direccion,
      email: email !== undefined ? email : personal.email,
      estado: estado !== undefined ? estado : personal.estado
    });
    
    // Obtener el personal actualizado con sus relaciones
    const personalActualizado = await Personal.findByPk(personal.id, {
      include: [
        { model: Cargo, as: 'cargo' },
        { model: Area, as: 'area' }
      ]
    });
    
    res.json(personalActualizado);
  } catch (error) {
    console.error('Error al actualizar personal:', error);
    res.status(500).json({ message: 'Error al actualizar personal' });
  }
};

// Eliminar personal
exports.deletePersonal = async (req, res) => {
  try {
    const personal = await Personal.findByPk(req.params.id);
    
    if (!personal) {
      return res.status(404).json({ message: 'Personal no encontrado' });
    }
    
    await personal.destroy();
    res.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar personal:', error);
    res.status(500).json({ message: 'Error al eliminar personal' });
  }
};