const { 
  Salida, 
  PedidoLote, 
  Cliente, 
  Producto, 
  UnidadMedida, 
  Usuario,
  sequelize,
  Op 
} = require('../models');

// Obtener todas las salidas
exports.getAllSalidas = async (req, res) => {
  try {
    const salidas = await Salida.findAll({
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas:', error);
    res.status(500).json({ error: 'Error al obtener salidas', details: error.message });
  }
};

// Obtener una salida por ID
exports.getSalidaById = async (req, res) => {
  try {
    const salida = await Salida.findByPk(req.params.id, {
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });
    
    if (!salida) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }
    
    res.json(salida);
  } catch (error) {
    console.error('Error al obtener salida:', error);
    res.status(500).json({ error: 'Error al obtener salida', details: error.message });
  }
};

// Crear una nueva salida
exports.createSalida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      fecha, 
      pedido_lote_id, 
      cliente_id, 
      producto_id, 
      cantidad, 
      unidad_medida_id, 
      guia_remision, 
      destino, 
      observacion 
    } = req.body;
    
    // Validar campos obligatorios
    if (!pedido_lote_id || !cliente_id || !producto_id || !cantidad || !unidad_medida_id) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Verificar que el pedido de lote existe
    const pedidoLote = await PedidoLote.findByPk(pedido_lote_id);
    if (!pedidoLote) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El pedido de lote especificado no existe' });
    }
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El cliente especificado no existe' });
    }
    
    // Verificar que el producto existe
    const producto = await Producto.findByPk(producto_id);
    if (!producto) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El producto especificado no existe' });
    }
    
    // Verificar que la unidad de medida existe
    const unidadMedida = await UnidadMedida.findByPk(unidad_medida_id);
    if (!unidadMedida) {
      await transaction.rollback();
      return res.status(404).json({ error: 'La unidad de medida especificada no existe' });
    }
    
    // Crear la salida
    const salida = await Salida.create({
      fecha: fecha || new Date(),
      pedido_lote_id,
      cliente_id,
      producto_id,
      cantidad,
      unidad_medida_id,
      guia_remision,
      destino,
      observacion,
      usuario_creacion_id: req.usuario.id
    }, { transaction });
    
    // Actualizar el estado del pedido si es necesario
    await this.verificarPedidoCompletado(pedido_lote_id);

    await transaction.commit();
    
    // Obtener la salida con sus relaciones
    const salidaCreada = await Salida.findByPk(salida.id, {
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });
    
    res.status(201).json(salidaCreada);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear salida:', error);
    res.status(500).json({ error: 'Error al crear salida', details: error.message });
  }
};

// Actualizar una salida existente
exports.updateSalida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const salida = await Salida.findByPk(req.params.id);
    
    if (!salida) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Salida no encontrada' });
    }
    
    // Validar campos obligatorios si se proporcionan
    if (req.body.pedido_lote_id) {
      const pedidoLote = await PedidoLote.findByPk(req.body.pedido_lote_id);
      if (!pedidoLote) {
        await transaction.rollback();
        return res.status(404).json({ error: 'El pedido de lote especificado no existe' });
      }
    }
    
    if (req.body.cliente_id) {
      const cliente = await Cliente.findByPk(req.body.cliente_id);
      if (!cliente) {
        await transaction.rollback();
        return res.status(404).json({ error: 'El cliente especificado no existe' });
      }
    }
    
    if (req.body.producto_id) {
      const producto = await Producto.findByPk(req.body.producto_id);
      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({ error: 'El producto especificado no existe' });
      }
    }
    
    if (req.body.unidad_medida_id) {
      const unidadMedida = await UnidadMedida.findByPk(req.body.unidad_medida_id);
      if (!unidadMedida) {
        await transaction.rollback();
        return res.status(404).json({ error: 'La unidad de medida especificada no existe' });
      }
    }
    
    // Actualizar la salida
    await salida.update({
      ...req.body,
      usuario_modificacion_id: req.usuario.id
    }, { transaction });

    // Actualizar el estado del pedido si es necesario
    if (req.body.pedido_lote_id) {
      await this.verificarPedidoCompletado(req.body.pedido_lote_id);
    }

    await transaction.commit();
    
    // Obtener la salida actualizada con sus relaciones
    const salidaActualizada = await Salida.findByPk(req.params.id, {
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });
    
    res.json(salidaActualizada);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar salida:', error);
    res.status(500).json({ error: 'Error al actualizar salida', details: error.message });
  }
};

// Eliminar una salida
exports.deleteSalida = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const salida = await Salida.findByPk(req.params.id);
    
    if (!salida) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Salida no encontrada' });
    }
    
    await salida.destroy({ transaction });

    // Actualizar el estado del pedido si es necesario
    await this.verificarPedidoCompletado(salida.pedido_lote_id);

    await transaction.commit();
    
    res.json({ message: 'Salida eliminada correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar salida:', error);
    res.status(500).json({ error: 'Error al eliminar salida', details: error.message });
  }
};

// Obtener salidas por pedido de lote
exports.getSalidasByPedidoLote = async (req, res) => {
  try {
    const pedidoLoteId = req.params.pedidoLoteId;
    
    // Verificar que el pedido de lote existe
    const pedidoLote = await PedidoLote.findByPk(pedidoLoteId);
    if (!pedidoLote) {
      return res.status(404).json({ error: 'El pedido de lote especificado no existe' });
    }
    
    const salidas = await Salida.findAll({
      where: { pedido_lote_id: pedidoLoteId },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas por pedido de lote:', error);
    res.status(500).json({ error: 'Error al obtener salidas por pedido de lote', details: error.message });
  }
};

// Obtener salidas por cliente
exports.getSalidasByCliente = async (req, res) => {
  try {
    const clienteId = req.params.clienteId;
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'El cliente especificado no existe' });
    }
    
    const salidas = await Salida.findAll({
      where: { cliente_id: clienteId },
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas por cliente:', error);
    res.status(500).json({ error: 'Error al obtener salidas por cliente', details: error.message });
  }
};

// Obtener salidas por producto
exports.getSalidasByProducto = async (req, res) => {
  try {
    const productoId = req.params.productoId;
    
    // Verificar que el producto existe
    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ error: 'El producto especificado no existe' });
    }
    
    const salidas = await Salida.findAll({
      where: { producto_id: productoId },
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas por producto:', error);
    res.status(500).json({ error: 'Error al obtener salidas por producto', details: error.message });
  }
};

// Obtener salidas por rango de fechas
exports.getSalidasByFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }
    
    const salidas = await Salida.findAll({
      where: {
        fecha: {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
        }
      },
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas por fecha:', error);
    res.status(500).json({ error: 'Error al obtener salidas por fecha', details: error.message });
  }
};

// Buscar salidas por término (guía de remisión, destino, etc.)
exports.searchSalidas = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const salidas = await Salida.findAll({
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { 
          model: Cliente, 
          as: 'cliente',
          where: {
            [Op.or]: [
              { razon_social: { [Op.like]: `%${term}%` } },
              { ruc: { [Op.like]: `%${term}%` } }
            ]
          },
          required: false
        },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      where: {
        [Op.or]: [
          { guia_remision: { [Op.like]: `%${term}%` } },
          { destino: { [Op.like]: `%${term}%` } },
          sequelize.literal(`cliente.razon_social LIKE '%${term}%'`),
          sequelize.literal(`cliente.ruc LIKE '%${term}%'`)
        ]
      },
      order: [['fecha', 'DESC']]
    });
    
    res.json(salidas);
  } catch (error) {
    console.error('Error al buscar salidas:', error);
    res.status(500).json({ error: 'Error al buscar salidas', details: error.message });
  }
};

// Obtener resumen de salidas para el dashboard
exports.getDashboardResumen = async (req, res) => {
  try {
    // Obtener total de salidas
    const totalSalidas = await Salida.count();
    
    // Obtener salidas del mes actual
    const fechaInicio = new Date();
    fechaInicio.setDate(1); // Primer día del mes actual
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date();
    fechaFin.setHours(23, 59, 59, 999);
    
    const salidasMesActual = await Salida.count({
      where: {
        fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      }
    });
    
    // Obtener cantidad total despachada
    const [cantidadTotal] = await sequelize.query(`
      SELECT SUM(cantidad) as total FROM salidas
    `);
    
    // Obtener cantidad despachada por producto (top 5)
    const [cantidadPorProducto] = await sequelize.query(`
      SELECT p.nombre, SUM(s.cantidad) as total
      FROM salidas s
      JOIN productos p ON s.producto_id = p.id
      GROUP BY s.producto_id
      ORDER BY total DESC
      LIMIT 5
    `);
    
    // Obtener cantidad despachada por cliente (top 5)
    const [cantidadPorCliente] = await sequelize.query(`
      SELECT c.razon_social, SUM(s.cantidad) as total
      FROM salidas s
      JOIN clientes c ON s.cliente_id = c.id
      GROUP BY s.cliente_id
      ORDER BY total DESC
      LIMIT 5
    `);
    
    res.json({
      totalSalidas,
      salidasMesActual,
      cantidadTotal: cantidadTotal[0]?.total || 0,
      cantidadPorProducto,
      cantidadPorCliente
    });
  } catch (error) {
    console.error('Error al obtener resumen para dashboard:', error);
    res.status(500).json({ error: 'Error al obtener resumen para dashboard', details: error.message });
  }
};

// Generar reporte de salidas
exports.generarReporte = async (req, res) => {
  try {
    const { formato, fechaInicio, fechaFin, clienteId, productoId } = req.query;
    
    if (!formato || !['excel', 'pdf'].includes(formato)) {
      return res.status(400).json({ error: 'Formato no válido. Debe ser excel o pdf' });
    }
    
    // Construir condiciones de búsqueda
    const where = {};
    
    if (fechaInicio && fechaFin) {
      where.fecha = {
        [Op.between]: [new Date(fechaInicio), new Date(fechaFin)]
      };
    }
    
    if (clienteId) {
      where.cliente_id = clienteId;
    }
    
    if (productoId) {
      where.producto_id = productoId;
    }
    
    // Obtener datos para el reporte
    const salidas = await Salida.findAll({
      where,
      include: [
        { model: PedidoLote, as: 'pedido_lote' },
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: UnidadMedida, as: 'unidad_medida' }
      ],
      order: [['fecha', 'DESC']]
    });
    
    // Aquí implementarías la generación del reporte según el formato solicitado
    // Por ahora, solo devolvemos los datos en JSON
    res.json({
      mensaje: `Reporte generado en formato ${formato}`,
      datos: salidas
    });
    
    // En una implementación real, aquí generarías el archivo Excel o PDF
    // y lo enviarías como respuesta
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte', details: error.message });
  }
};

// Verificar si un pedido está completado después de una salida
exports.verificarPedidoCompletado = async (pedidoLoteId) => {
  try {
    // Obtener el pedido
    const pedido = await PedidoLote.findByPk(pedidoLoteId);
    if (!pedido) return false;
    
    // Obtener la cantidad total despachada para este pedido
    const [resultado] = await sequelize.query(`
      SELECT SUM(cantidad) as total_despachado
      FROM salidas
      WHERE pedido_lote_id = :pedidoId
    `, {
      replacements: { pedidoId: pedidoLoteId }
    });
    
    const totalDespachado = resultado[0]?.total_despachado || 0;
    
    // Si la cantidad despachada es igual o mayor a la cantidad pedida, marcar como completado
    if (totalDespachado >= pedido.cantidad) {
      await pedido.update({ estado: 'completado' });
    }
  } catch (error) {
    console.error('Error al verificar si el pedido está completado:', error);
  }
};