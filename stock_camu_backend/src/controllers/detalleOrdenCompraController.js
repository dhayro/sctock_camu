const { DetalleOrdenCompra, OrdenCompra, Producto, TipoFruta } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los detalles de orden de compra con paginación y filtros
exports.getAllDetallesOrdenCompra = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    if (req.query.search) {
      filters[Op.or] = [
        { '$producto.nombre$': { [Op.like]: `%${req.query.search}%` } },
        { '$tipo_fruta.nombre$': { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const include = [
      { model: OrdenCompra, as: 'orden_compra' },
      { model: Producto, as: 'producto' },
      { model: TipoFruta, as: 'tipo_fruta' }
    ];

    const { count, rows } = await DetalleOrdenCompra.findAndCountAll({
      where: filters,
      include,
      limit,
      offset,
      order: [['id', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      detallesOrdenCompra: rows.map(detalle => ({
        ...detalle.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error al obtener detalles de orden de compra:', error);
    res.status(500).json({ message: 'Error al obtener detalles de orden de compra', details: error.message });
  }
};

// Obtener un detalle de orden de compra por ID
exports.getDetalleOrdenCompraById = async (req, res) => {
  try {
    const detalleOrdenCompra = await DetalleOrdenCompra.findByPk(req.params.id, {
      include: [
        { model: OrdenCompra, as: 'orden_compra' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' }
      ]
    });

    if (!detalleOrdenCompra) {
      return res.status(404).json({ message: 'Detalle de orden de compra no encontrado' });
    }

    res.json(detalleOrdenCompra);
  } catch (error) {
    console.error('Error al obtener detalle de orden de compra:', error);
    res.status(500).json({ message: 'Error al obtener detalle de orden de compra' });
  }
};

// Crear un nuevo detalle de orden de compra
exports.createDetalleOrdenCompra = async (req, res) => {
  try {
    const { orden_compra_id, producto_id, tipo_fruta_id, cantidad, precio, subtotal, estado, observacion } = req.body;

    if (!orden_compra_id || !producto_id || !cantidad || !precio || !subtotal) {
      return res.status(400).json({ message: 'Datos incompletos. Orden de compra, producto, cantidad, precio y subtotal son obligatorios' });
    }

    const nuevoDetalleOrdenCompra = await DetalleOrdenCompra.create({
      orden_compra_id,
      producto_id,
      tipo_fruta_id: tipo_fruta_id || null, // Permitir null si viene vacío
      cantidad,
      precio,
      subtotal,
      estado: estado !== undefined ? estado : 'pendiente',
      observacion
    });

    res.status(201).json(nuevoDetalleOrdenCompra);
  } catch (error) {
    console.error('Error al crear detalle de orden de compra:', error);
    res.status(500).json({ message: 'Error al crear detalle de orden de compra' });
  }
};

// Actualizar un detalle de orden de compra existente
exports.updateDetalleOrdenCompra = async (req, res) => {
  try {
    const { orden_compra_id, producto_id, tipo_fruta_id, cantidad, precio, subtotal, estado, observacion } = req.body;

    const detalleOrdenCompra = await DetalleOrdenCompra.findByPk(req.params.id);

    if (!detalleOrdenCompra) {
      return res.status(404).json({ message: 'Detalle de orden de compra no encontrado' });
    }

    await detalleOrdenCompra.update({
      orden_compra_id: orden_compra_id || detalleOrdenCompra.orden_compra_id,
      producto_id: producto_id || detalleOrdenCompra.producto_id,
      tipo_fruta_id: tipo_fruta_id !== undefined ? (tipo_fruta_id || null) : detalleOrdenCompra.tipo_fruta_id, // Manejar null correctamente
      cantidad: cantidad || detalleOrdenCompra.cantidad,
      precio: precio || detalleOrdenCompra.precio,
      subtotal: subtotal || detalleOrdenCompra.subtotal,
      estado: estado !== undefined ? estado : detalleOrdenCompra.estado,
      observacion: observacion !== undefined ? observacion : detalleOrdenCompra.observacion
    });

    res.json(detalleOrdenCompra);
  } catch (error) {
    console.error('Error al actualizar detalle de orden de compra:', error);
    res.status(500).json({ message: 'Error al actualizar detalle de orden de compra' });
  }
};

// Eliminar un detalle de orden de compra
exports.deleteDetalleOrdenCompra = async (req, res) => {
  try {
    const detalleOrdenCompra = await DetalleOrdenCompra.findByPk(req.params.id);

    if (!detalleOrdenCompra) {
      return res.status(404).json({ message: 'Detalle de orden de compra no encontrado' });
    }

    await detalleOrdenCompra.destroy();
    res.json({ message: 'Detalle de orden de compra eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar detalle de orden de compra:', error);
    res.status(500).json({ message: 'Error al eliminar detalle de orden de compra' });
  }
};

exports.getDetallesByOrdenId = async (req, res) => {
  try {
    const { ordenId } = req.params;
    
    const detalles = await DetalleOrdenCompra.findAll({
      where: { orden_compra_id: ordenId },
      include: [
        { 
          model: Producto, 
          as: 'producto',
          attributes: ['id', 'nombre']
        },
        { 
          model: TipoFruta, 
          as: 'tipo_fruta',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['id', 'ASC']]
    });
    
    res.json(detalles);
  } catch (error) {
    console.error('Error al obtener detalles por orden ID:', error);
    res.status(500).json({ 
      error: 'Error al obtener detalles de la orden', 
      details: error.message 
    });
  }
};