const { UnidadMedida } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las unidades de medida con paginación, búsqueda general y filtros específicos
exports.getAllUnidadMedida = async (req, res) => {
  try {
    // Implementar paginación en el servidor
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Implementar filtros desde el servidor
    const filters = {};
    
    // Búsqueda general
    if (req.query.search) {
      console.log('Buscando unidades de medida:', req.query.search);
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { abreviatura: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    // Filtros específicos por columna
    if (req.query.nombre) {
      console.log('Filtrando por nombre:', req.query.nombre);
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }
    
    if (req.query.abreviatura) {
      filters.abreviatura = { [Op.like]: `%${req.query.abreviatura}%` };
    }
    
    // Debugging: Log the filters, page, limit, and offset
    console.log('Filters:', filters);
    console.log('Page:', page, 'Limit:', limit, 'Offset:', offset);
    
    // Consulta con paginación y filtros
    const { count, rows } = await UnidadMedida.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      unidadesMedida: rows
    });
  } catch (error) {
    console.error('Error al obtener unidades de medida paginadas:', error);
    res.status(500).json({ error: 'Error al obtener unidades de medida', details: error.message });
  }
};

// Obtener una unidad de medida por ID
exports.getUnidadMedidaById = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    res.json(unidadMedida);
  } catch (error) {
    console.error('Error al obtener unidad de medida:', error);
    res.status(500).json({ error: 'Error al obtener unidad de medida', details: error.message });
  }
};

// Crear una nueva unidad de medida
exports.createUnidadMedida = async (req, res) => {
  try {
    const { nombre, abreviatura } = req.body;
    
    // Validaciones básicas
    if (!nombre || !abreviatura) {
      return res.status(400).json({ error: 'El nombre y la abreviatura son obligatorios' });
    }
    
    // Verificar si ya existe una unidad de medida con el mismo nombre
    const existingUnidadMedida = await UnidadMedida.findOne({ where: { nombre } });
    if (existingUnidadMedida) {
      return res.status(400).json({ error: 'Ya existe una unidad de medida con ese nombre' });
    }
    
    const newUnidadMedida = await UnidadMedida.create({
      nombre,
      abreviatura
    });
    
    res.status(201).json(newUnidadMedida);
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    res.status(500).json({ error: 'Error al crear unidad de medida', details: error.message });
  }
};

// Actualizar una unidad de medida existente
exports.updateUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, abreviatura } = req.body;
    
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    // Si se cambia el nombre, verificar que no exista otra unidad de medida con ese nombre
    if (nombre && nombre !== unidadMedida.nombre) {
      const existingUnidadMedida = await UnidadMedida.findOne({ where: { nombre } });
      if (existingUnidadMedida) {
        return res.status(400).json({ error: 'Ya existe una unidad de medida con ese nombre' });
      }
      unidadMedida.nombre = nombre;
    }
    
    // Actualizar abreviatura si se proporciona
    if (abreviatura !== undefined) {
      unidadMedida.abreviatura = abreviatura;
    }
    
    await unidadMedida.save();
    
    res.json(unidadMedida);
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error);
    res.status(500).json({ error: 'Error al actualizar unidad de medida', details: error.message });
  }
};

// Eliminar una unidad de medida
exports.deleteUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const productosCount = await unidadMedida.countProductos();
    const pedidosCount = await unidadMedida.countPedidos();
    const ingresosCount = await unidadMedida.countIngresos();
    const salidasCount = await unidadMedida.countSalidas();
    
    if (productosCount > 0 || pedidosCount > 0 || ingresosCount > 0 || salidasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar esta unidad de medida porque está siendo utilizada',
        details: `Tiene ${productosCount} productos, ${pedidosCount} pedidos, ${ingresosCount} ingresos y ${salidasCount} salidas asociados`
      });
    }
    
    await unidadMedida.destroy();
    
    res.json({ message: 'Unidad de medida eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error);
    res.status(500).json({ error: 'Error al eliminar unidad de medida', details: error.message });
  }
};