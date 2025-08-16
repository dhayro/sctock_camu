const { OrdenCompra, Cliente, Usuario, DetalleOrdenCompra } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las órdenes de compra con paginación y filtros
exports.getAllOrdenesCompra = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    // General search across multiple fields
    if (req.query.search) {
      filters[Op.or] = [
        { codigo_lote: { [Op.like]: `%${req.query.search}%` } },
        { numero_orden: { [Op.like]: `%${req.query.search}%` } },
        { '$cliente.razon_social$': { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Hacer el conteo por separado sin los includes problemáticos
    const count = await OrdenCompra.count({
      where: filters,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: [],
          where: {}
        }
      ],
      distinct: true
    });

    // Obtener los registros con todos los includes
    const rows = await OrdenCompra.findAll({
      where: filters,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'razon_social'],
          where: {}
        },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalles'
        }
      ],
      limit,
      offset,
      order: [['fecha_emision', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      ordenesCompra: rows.map(orden => ({
        ...orden.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error al obtener órdenes de compra:', error);
    res.status(500).json({ message: 'Error al obtener órdenes de compra', details: error.message });
  }
};

// Obtener una orden de compra por ID
exports.getOrdenCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({ 
        message: 'ID inválido. Debe ser un número entero.' 
      });
    }
    
    const ordenCompra = await OrdenCompra.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' },
        { model: DetalleOrdenCompra, as: 'detalles' }
      ]
    });
    
    if (!ordenCompra) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }
    
    res.json(ordenCompra);
  } catch (error) {
    console.error('Error al obtener orden de compra:', error);
    res.status(500).json({ message: 'Error al obtener orden de compra' });
  }
};
// Crear una nueva orden de compra

// ... existing code

exports.createOrdenCompra = async (req, res) => {
  try {
    const { tipo_lote, tipo_pago, cliente_id, numero_orden, fecha_emision, fecha_entrega, lugar_entrega, estado, observacion, forma_pago, usuario_creacion_id } = req.body;
    
    // Validaciones básicas
    if (!tipo_lote || !tipo_pago || !cliente_id || !fecha_emision || !usuario_creacion_id) {
      return res.status(400).json({ 
        message: 'Datos incompletos. Tipo de lote, tipo de pago, cliente, fecha de emisión y usuario de creación son obligatorios' 
      });
    }

    // Validar que tipo_lote sea válido
    if (!['organica', 'convencional'].includes(tipo_lote)) {
      return res.status(400).json({ 
        message: 'Tipo de lote debe ser "organica" o "convencional"' 
      });
    }

    // Validar que tipo_pago sea válido
    if (!['contado', 'credito'].includes(tipo_pago)) {
      return res.status(400).json({ 
        message: 'Tipo de pago debe ser "contado" o "credito"' 
      });
    }

    let newCodigoLote;
    const year = new Date().getFullYear().toString().slice(-2); // Obtener los últimos dos dígitos del año actual

    if (tipo_lote === 'organica') {
      // Lógica para código orgánico: COOPAY${year}0001, COOPAY${year}002, etc.
      const lastOrganicOrder = await OrdenCompra.findOne({
        where: { tipo_lote: 'organica' },
        order: [['id', 'DESC']]
      });

      if (lastOrganicOrder && lastOrganicOrder.codigo_lote) {
        const lastCodigoLote = lastOrganicOrder.codigo_lote;
        const match = lastCodigoLote.match(/COOPAY(\d{2})(\d{4})/);

        if (match) {
          const lastYear = match[1];
          const sequenceNumber = parseInt(match[2], 10);

          if (lastYear === year) {
            // Incrementar el número de secuencia si el año es el mismo
            const nextSequence = (sequenceNumber + 1).toString().padStart(4, '0');
            newCodigoLote = `COOPAY${year}${nextSequence}`;
          } else {
            // Reiniciar el conteo si el año ha cambiado
            newCodigoLote = `COOPAY${year}0001`;
          }
        } else {
          // Caso de error en el formato del último código, iniciar nuevo
          newCodigoLote = `COOPAY${year}0001`;
        }
      } else {
        // Si no hay órdenes orgánicas previas, iniciar nuevo
        newCodigoLote = `COOPAY${year}0001`;
      }
    } else {
      // Lógica para código convencional: COOPAY${year}-S1, COOPAY${year}-S2, etc.
      const lastConventionalOrder = await OrdenCompra.findOne({
        where: { tipo_lote: 'convencional' },
        order: [['id', 'DESC']]
      });

      if (lastConventionalOrder && lastConventionalOrder.codigo_lote) {
        const lastCodigoLote = lastConventionalOrder.codigo_lote;
        const match = lastCodigoLote.match(/COOPAY(\d{2})-S(\d+)/);

        if (match) {
          const lastYear = match[1];
          const sequenceNumber = parseInt(match[2], 10);

          if (lastYear === year) {
            // Incrementar el número de secuencia si el año es el mismo
            newCodigoLote = `COOPAY${year}-S${sequenceNumber + 1}`;
          } else {
            // Reiniciar el conteo si el año ha cambiado
            newCodigoLote = `COOPAY${year}-S1`;
          }
        } else {
          // Caso de error en el formato del último código, iniciar nuevo
          newCodigoLote = `COOPAY${year}-S1`;
        }
      } else {
        // Si no hay órdenes convencionales previas, iniciar nuevo
        newCodigoLote = `COOPAY${year}-S1`;
      }
    }

    const nuevaOrdenCompra = await OrdenCompra.create({
      codigo_lote: newCodigoLote,
      tipo_lote,
      tipo_pago,
      cliente_id,
      numero_orden,
      fecha_emision,
      fecha_entrega,
      lugar_entrega,
      estado: estado !== undefined ? estado : 'pendiente',
      observacion,
      forma_pago,
      usuario_creacion_id
    });
    
    // Obtener la orden de compra con sus relaciones
    const ordenCompraConRelaciones = await OrdenCompra.findByPk(nuevaOrdenCompra.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' },
        { model: DetalleOrdenCompra, as: 'detalles' }
      ]
    });
    
    res.status(201).json(ordenCompraConRelaciones);
  } catch (error) {
    console.error('Error al crear orden de compra:', error);
    res.status(500).json({ message: 'Error al crear orden de compra' });
  }
};

// ... existing code

// Actualizar una orden de compra existente
exports.updateOrdenCompra = async (req, res) => {
  try {
    const { codigo_lote, tipo_lote, tipo_pago, cliente_id, numero_orden, fecha_emision, fecha_entrega, lugar_entrega, estado, observacion, forma_pago, usuario_modificacion_id } = req.body;
    
    const ordenCompra = await OrdenCompra.findByPk(req.params.id);
    
    if (!ordenCompra) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    // Validar tipo_pago si se proporciona
    if (tipo_pago && !['contado', 'credito'].includes(tipo_pago)) {
      return res.status(400).json({ 
        message: 'Tipo de pago debe ser "contado" o "credito"' 
      });
    }

    // Validar tipo_lote si se proporciona
    if (tipo_lote && !['organica', 'convencional'].includes(tipo_lote)) {
      return res.status(400).json({ 
        message: 'Tipo de lote debe ser "organica" o "convencional"' 
      });
    }
    
    await ordenCompra.update({
      codigo_lote: codigo_lote || ordenCompra.codigo_lote,
      tipo_lote: tipo_lote || ordenCompra.tipo_lote,
      tipo_pago: tipo_pago || ordenCompra.tipo_pago,
      cliente_id: cliente_id || ordenCompra.cliente_id,
      numero_orden: numero_orden || ordenCompra.numero_orden,
      fecha_emision: fecha_emision || ordenCompra.fecha_emision,
      fecha_entrega: fecha_entrega || ordenCompra.fecha_entrega,
      lugar_entrega: lugar_entrega || ordenCompra.lugar_entrega,
      estado: estado !== undefined ? estado : ordenCompra.estado,
      observacion: observacion !== undefined ? observacion : ordenCompra.observacion,
      forma_pago: forma_pago || ordenCompra.forma_pago,
      usuario_modificacion_id: usuario_modificacion_id || ordenCompra.usuario_modificacion_id,
      fecha_modificacion: new Date()
    });
    
    // Obtener la orden de compra actualizada con sus relaciones
    const ordenCompraActualizada = await OrdenCompra.findByPk(ordenCompra.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' },
        { model: DetalleOrdenCompra, as: 'detalles' }
      ]
    });
    
    res.json(ordenCompraActualizada);
  } catch (error) {
    console.error('Error al actualizar orden de compra:', error);
    res.status(500).json({ message: 'Error al actualizar orden de compra' });
  }

};

// Eliminar una orden de compra
exports.deleteOrdenCompra = async (req, res) => {
  try {
    const ordenCompra = await OrdenCompra.findByPk(req.params.id);
    
    if (!ordenCompra) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }
    
    await ordenCompra.destroy();
    res.json({ message: 'Orden de compra eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar orden de compra:', error);
    res.status(500).json({ message: 'Error al eliminar orden de compra' });
  }
};

// Cambiar estado de una orden de compra (activar/desactivar)
exports.cambiarEstadoOrdenCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (estado === undefined) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }
    
    const ordenCompra = await OrdenCompra.findByPk(id);
    
    if (!ordenCompra) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    
    ordenCompra.estado = estado;
    await ordenCompra.save();
    
    res.json({ 
      message: `Orden de compra ${estado ? 'activada' : 'desactivada'} correctamente`,
      ordenCompra
    });
  } catch (error) {
    console.error('Error al cambiar estado de la orden de compra:', error);
    res.status(500).json({ error: 'Error al cambiar estado de la orden de compra', details: error.message });
  }
};


exports.getOrdenesPendientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtro base: solo órdenes pendientes
    let where = {
      estado: 'pendiente'
    };

    // Configuración de includes
    const includeOptions = [
      {
        model: Cliente,
        as: 'cliente',
        attributes: ['id', 'razon_social'],
        required: false
      },
      {
        model: Usuario,
        as: 'usuario_creacion',
        attributes: ['id', 'usuario'],
        required: false
      },
      {
        model: Usuario,
        as: 'usuario_modificacion',
        attributes: ['id', 'usuario'],
        required: false
      },
      {
        model: DetalleOrdenCompra,
        as: 'detalles',
        required: false
      }
    ];

    // Si hay término de búsqueda, modificar la estrategia
    if (req.query.search) {
      const searchTerm = req.query.search;
      
      // Para la búsqueda, necesitamos hacer un enfoque diferente
      // Primero buscar clientes que coincidan
      const clientesCoincidentes = await Cliente.findAll({
        where: {
          razon_social: { [Op.like]: `%${searchTerm}%` }
        },
        attributes: ['id']
      });

      const clienteIds = clientesCoincidentes.map(cliente => cliente.id);

      // Construir el filtro WHERE con los IDs de clientes encontrados
      where[Op.or] = [
        { codigo_lote: { [Op.like]: `%${searchTerm}%` } },
        { numero_orden: { [Op.like]: `%${searchTerm}%` } }
      ];

      // Si encontramos clientes, agregar el filtro por cliente_id
      if (clienteIds.length > 0) {
        where[Op.or].push({ cliente_id: { [Op.in]: clienteIds } });
      }
    }

    // Hacer el conteo
    const count = await OrdenCompra.count({
      where,
      distinct: true
    });

    // Obtener los registros
    const rows = await OrdenCompra.findAll({
      where,
      include: includeOptions,
      limit,
      offset,
      order: [['fecha_emision', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      ordenesPendientes: rows.map(orden => ({
        ...orden.toJSON()
      }))
    });
  } catch (error) {
    console.error('Error al obtener órdenes pendientes:', error);
    res.status(500).json({ message: 'Error al obtener órdenes pendientes', details: error.message });
  }
};
// Obtener órdenes pendientes por socio (si necesitas filtrar por socio también)
exports.getOrdenesPendientesPorSocio = async (req, res) => {
  try {
    const { socioId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      estado: 'pendiente',
      socio_id: socioId // Filtrar por socio específico
    };

    // General search across multiple fields
    if (req.query.search) {
      filters[Op.and] = [
        { estado: 'pendiente' },
        { socio_id: socioId },
        {
          [Op.or]: [
            { codigo_lote: { [Op.like]: `%${req.query.search}%` } },
            { numero_orden: { [Op.like]: `%${req.query.search}%` } },
            { '$cliente.razon_social$': { [Op.like]: `%${req.query.search}%` } }
          ]
        }
      ];
    }

    const rows = await OrdenCompra.findAll({
      where: filters,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'razon_social']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalles'
        }
      ],
      limit,
      offset,
      order: [['fecha_emision', 'DESC']]
    });

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener órdenes pendientes por socio:', error);
    res.status(500).json({ message: 'Error al obtener órdenes pendientes por socio', details: error.message });
  }
};