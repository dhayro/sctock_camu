const { TipoFruta } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los tipos de fruta con paginación, búsqueda general y filtros específicos
exports.getAllTiposFruta = async (req, res) => {
  try {
    // Implementar paginación en el servidor
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Implementar filtros desde el servidor
    const filters = {};
    
    // Búsqueda general
    if (req.query.search) {
      console.log('Buscando tipos de fruta:', req.query.search);
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { descripcion: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Filtros específicos por columna
    if (req.query.nombre) {
      console.log('Filtrando por nombre:', req.query.nombre);
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    
    if (req.query.descripcion) {
      filters.descripcion = { [Op.like]: `%${req.query.descripcion}%` };
    }
    
    // Debugging: Log the filters, page, limit, and offset
    console.log('Filters:', filters);
    console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);
    
    // Consulta con paginación y filtros
    const { count, rows } = await TipoFruta.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      tiposFruta: rows
    });
  } catch (error) {
    console.error('Error al obtener tipos de fruta paginados:', error);
    res.status(500).json({ error: 'Error al obtener tipos de fruta', details: error.message });
  }
};

// // Obtener todos los tipos de fruta
// exports.getAllTiposFruta = async (req, res) => {
//   try {
//     const tiposFruta = await TipoFruta.findAll();
//     res.json(tiposFruta);
//   } catch (error) {
//     console.error('Error al obtener tipos de fruta:', error);
//     res.status(500).json({ error: 'Error al obtener tipos de fruta', details: error.message });
//   }
// };

// Obtener un tipo de fruta por ID
exports.getTipoFrutaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    res.json(tipoFruta);
  } catch (error) {
    console.error('Error al obtener tipo de fruta:', error);
    res.status(500).json({ error: 'Error al obtener tipo de fruta', details: error.message });
  }
};

// Crear un nuevo tipo de fruta
exports.createTipoFruta = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    // Verificar si ya existe un tipo de fruta con el mismo nombre
    const existingTipoFruta = await TipoFruta.findOne({ where: { nombre } });
    if (existingTipoFruta) {
      return res.status(400).json({ error: 'Ya existe un tipo de fruta con ese nombre' });
    }
    
    const newTipoFruta = await TipoFruta.create({
      nombre,
      descripcion
    });
    
    res.status(201).json(newTipoFruta);
  } catch (error) {
    console.error('Error al crear tipo de fruta:', error);
    res.status(500).json({ error: 'Error al crear tipo de fruta', details: error.message });
  }
};

// Actualizar un tipo de fruta existente
exports.updateTipoFruta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    // Si se cambia el nombre, verificar que no exista otro tipo de fruta con ese nombre
    if (nombre && nombre !== tipoFruta.nombre) {
      const existingTipoFruta = await TipoFruta.findOne({ where: { nombre } });
      if (existingTipoFruta) {
        return res.status(400).json({ error: 'Ya existe un tipo de fruta con ese nombre' });
      }
      tipoFruta.nombre = nombre;
    }
    
    // Actualizar descripción si se proporciona
    if (descripcion !== undefined) {
      tipoFruta.descripcion = descripcion;
    }
    
    await tipoFruta.save();
    
    res.json(tipoFruta);
  } catch (error) {
    console.error('Error al actualizar tipo de fruta:', error);
    res.status(500).json({ error: 'Error al actualizar tipo de fruta', details: error.message });
  }
};

// Eliminar un tipo de fruta
exports.deleteTipoFruta = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const pedidosCount = await tipoFruta.countPedidos();
    const ingresosCount = await tipoFruta.countIngresos();
    
    if (pedidosCount > 0 || ingresosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar este tipo de fruta porque está siendo utilizado',
        details: `Tiene ${pedidosCount} pedidos y ${ingresosCount} ingresos asociados`
      });
    }
    
    await tipoFruta.destroy();
    
    res.json({ message: 'Tipo de fruta eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de fruta:', error);
    res.status(500).json({ error: 'Error al eliminar tipo de fruta', details: error.message });
  }
};