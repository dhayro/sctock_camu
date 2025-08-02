const { Producto, UnidadMedida } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los productos con paginación y filtros
exports.getAllProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    // General search across multiple fields
    if (req.query.search) {
      filters[Op.or] = [
        { nombre: { [Op.like]: `%${req.query.search}%` } },
        { descripcion: { [Op.like]: `%${req.query.search}%` } },
        { '$unidad_medida.nombre$': { [Op.like]: `%${req.query.search}%` } } // Search in related model
      ];
    }

    // Specific filters
    if (req.query.nombre) {
      filters.nombre = { [Op.like]: `%${req.query.nombre}%` };
    }

    const include = [
      {
        model: UnidadMedida,
        as: 'unidad_medida',
        attributes: ['id', 'nombre', 'abreviatura'],
        where: {}
      }
    ];

    // Filter by unidad_medida.nombre
    if (req.query.unidad_medida_nombre) {
      include[0].where.nombre = { [Op.like]: `%${req.query.unidad_medida_nombre}%` };
    }

    const { count, rows } = await Producto.findAndCountAll({
      where: filters,
      include,
      limit,
      offset,
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      productos: rows.map(producto => ({
        ...producto.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos', details: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida' }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    let { nombre, unidad_medida_id, descripcion, estado } = req.body;
    
    // Validaciones básicas
    if (!nombre || !unidad_medida_id) {
      return res.status(400).json({ 
        message: 'Datos incompletos. Nombre y unidad de medida son obligatorios' 
      });
    }
    
    // Convert nombre to uppercase
    nombre = nombre.trim().toUpperCase();
    
    // Verificar si la unidad de medida existe
    const unidadMedidaExists = await UnidadMedida.findByPk(unidad_medida_id);
    if (!unidadMedidaExists) {
      return res.status(400).json({ message: 'La unidad de medida especificada no existe' });
    }
    
    const nuevoProducto = await Producto.create({
      nombre,
      unidad_medida_id,
      descripcion,
      estado: estado !== undefined ? estado : true
    });
    
    // Obtener el producto con sus relaciones
    const productoConRelaciones = await Producto.findByPk(nuevoProducto.id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida' }
      ]
    });
    
    res.status(201).json(productoConRelaciones);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

// Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  try {
    let { nombre, unidad_medida_id, descripcion, estado } = req.body;
    
    const producto = await Producto.findByPk(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Convert nombre to uppercase if provided
    if (nombre) {
      nombre = nombre.trim().toUpperCase();
    }
    
    // Verificar si la unidad de medida existe (si se está actualizando)
    if (unidad_medida_id) {
      const unidadMedidaExists = await UnidadMedida.findByPk(unidad_medida_id);
      if (!unidadMedidaExists) {
        return res.status(400).json({ message: 'La unidad de medida especificada no existe' });
      }
    }
    
    await producto.update({
      nombre: nombre || producto.nombre,
      unidad_medida_id: unidad_medida_id || producto.unidad_medida_id,
      descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
      estado: estado !== undefined ? estado : producto.estado
    });
    
    // Obtener el producto actualizado con sus relaciones
    const productoActualizado = await Producto.findByPk(producto.id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida' }
      ]
    });
    
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await producto.destroy();
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

// Cambiar estado de un producto (activar/desactivar)
exports.cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (estado === undefined) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    producto.estado = estado;
    await producto.save();
    
    res.json({ 
      message: `Producto ${estado ? 'activado' : 'desactivado'} correctamente`,
      producto
    });
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    res.status(500).json({ error: 'Error al cambiar estado del producto', details: error.message });
  }
};