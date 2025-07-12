const { 
  PedidoLote, 
  Cliente, 
  Producto, 
  TipoFruta, 
  UnidadMedida, 
  Usuario, 
  Ingreso,
  Salida,
  sequelize,
  Op 
} = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Obtener todos los pedidos de lotes
exports.getAllPedidosLotes = async (req, res) => {
  try {
    const pedidosLotes = await PedidoLote.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    res.json(pedidosLotes);
  } catch (error) {
    console.error('Error al obtener pedidos de lotes:', error);
    res.status(500).json({ error: 'Error al obtener pedidos de lotes', details: error.message });
  }
};

// Obtener un pedido de lote por ID
exports.getPedidoLoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedidoLote = await PedidoLote.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] },
        { 
          model: Ingreso, 
          as: 'ingresos',
          include: [
            { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
          ]
        },
        { 
          model: Salida, 
          as: 'salidas',
          include: [
            { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ]
    });
    
    if (!pedidoLote) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    res.json(pedidoLote);
  } catch (error) {
    console.error('Error al obtener pedido de lote:', error);
    res.status(500).json({ error: 'Error al obtener pedido de lote', details: error.message });
  }
};

// Crear un nuevo pedido de lote
exports.createPedidoLote = async (req, res) => {
  try {
    const { 
      codigo, 
      cliente_id, 
      producto_id, 
      cantidad, 
      unidad_medida_id, 
      fecha_pedido, 
      tipo_fruta_id, 
      fecha_limite, 
      observacion 
    } = req.body;
    
    // Validaciones básicas
    if (!codigo || !cliente_id || !producto_id || !cantidad || !unidad_medida_id || !fecha_pedido || !tipo_fruta_id) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios excepto fecha límite y observación' 
      });
    }
    
    // Verificar si ya existe un pedido con el mismo código
    const existingPedido = await PedidoLote.findOne({ where: { codigo } });
    if (existingPedido) {
      return res.status(400).json({ error: 'Ya existe un pedido con ese código' });
    }
    
    // Verificar si el cliente existe
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      return res.status(400).json({ error: 'El cliente especificado no existe' });
    }
    
    // Verificar si el producto existe
    const producto = await Producto.findByPk(producto_id);
    if (!producto) {
      return res.status(400).json({ error: 'El producto especificado no existe' });
    }
    
    // Verificar si el tipo de fruta existe
    const tipoFruta = await TipoFruta.findByPk(tipo_fruta_id);
    if (!tipoFruta) {
      return res.status(400).json({ error: 'El tipo de fruta especificado no existe' });
    }
    
    // Verificar si la unidad de medida existe
    const unidadMedida = await UnidadMedida.findByPk(unidad_medida_id);
    if (!unidadMedida) {
      return res.status(400).json({ error: 'La unidad de medida especificada no existe' });
    }
    
    // Crear el pedido de lote
    const newPedidoLote = await PedidoLote.create({
      codigo,
      cliente_id,
      producto_id,
      cantidad,
      unidad_medida_id,
      fecha_pedido,
      tipo_fruta_id,
      fecha_limite,
      estado: 'pendiente',
      observacion,
      usuario_creacion_id: req.usuario.id
    });
    
    // Obtener el pedido con sus relaciones
    const pedidoConRelaciones = await PedidoLote.findByPk(newPedidoLote.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });
    
    res.status(201).json(pedidoConRelaciones);
  } catch (error) {
    console.error('Error al crear pedido de lote:', error);
    res.status(500).json({ error: 'Error al crear pedido de lote', details: error.message });
  }
};

// Actualizar un pedido de lote
exports.updatePedidoLote = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      codigo, 
      cliente_id, 
      producto_id, 
      cantidad, 
      unidad_medida_id, 
      fecha_pedido, 
      tipo_fruta_id, 
      fecha_limite, 
      observacion 
    } = req.body;
    
    const pedidoLote = await PedidoLote.findByPk(id);
    
    if (!pedidoLote) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Verificar si el pedido ya está completado o cancelado
    if (pedidoLote.estado !== 'pendiente') {
      return res.status(400).json({ 
        error: `No se puede modificar un pedido que está ${pedidoLote.estado}` 
      });
    }
    
    // Si se cambia el código, verificar que no exista otro pedido con ese código
    if (codigo && codigo !== pedidoLote.codigo) {
      const existingPedido = await PedidoLote.findOne({ where: { codigo } });
      if (existingPedido) {
        return res.status(400).json({ error: 'Ya existe un pedido con ese código' });
      }
      pedidoLote.codigo = codigo;
    }
    
    // Actualizar campos si se proporcionan
    if (cliente_id) {
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        return res.status(400).json({ error: 'El cliente especificado no existe' });
      }
      pedidoLote.cliente_id = cliente_id;
    }
    
    if (producto_id) {
      const producto = await Producto.findByPk(producto_id);
      if (!producto) {
        return res.status(400).json({ error: 'El producto especificado no existe' });
      }
      pedidoLote.producto_id = producto_id;
    }
    
    if (cantidad) pedidoLote.cantidad = cantidad;
    
    if (unidad_medida_id) {
      const unidadMedida = await UnidadMedida.findByPk(unidad_medida_id);
      if (!unidadMedida) {
        return res.status(400).json({ error: 'La unidad de medida especificada no existe' });
      }
      pedidoLote.unidad_medida_id = unidad_medida_id;
    }
    
    if (fecha_pedido) pedidoLote.fecha_pedido = fecha_pedido;
    
    if (tipo_fruta_id) {
      const tipoFruta = await TipoFruta.findByPk(tipo_fruta_id);
      if (!tipoFruta) {
        return res.status(400).json({ error: 'El tipo de fruta especificado no existe' });
      }
      pedidoLote.tipo_fruta_id = tipo_fruta_id;
    }
    
    if (fecha_limite !== undefined) pedidoLote.fecha_limite = fecha_limite;
    if (observacion !== undefined) pedidoLote.observacion = observacion;
    
    // Registrar quién modificó el pedido
    pedidoLote.usuario_modificacion_id = req.usuario.id;
    
    await pedidoLote.save();
    
    // Obtener el pedido actualizado con sus relaciones
    const pedidoActualizado = await PedidoLote.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });
    
    res.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al actualizar pedido de lote:', error);
    res.status(500).json({ error: 'Error al actualizar pedido de lote', details: error.message });
  }
};

// Cambiar estado de un pedido de lote
exports.cambiarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!['pendiente', 'completado', 'cancelado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido. Debe ser pendiente, completado o cancelado' });
    }
    
    const pedidoLote = await PedidoLote.findByPk(id);
    
    if (!pedidoLote) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Si el pedido ya está en el estado solicitado, no hacer cambios
    if (pedidoLote.estado === estado) {
      return res.json({ message: `El pedido ya se encuentra en estado ${estado}` });
    }
    
    // Si el pedido está completado o cancelado, no permitir cambios a menos que sea un administrador
    if ((pedidoLote.estado === 'completado' || pedidoLote.estado === 'cancelado') && 
        req.usuario.rol !== 'Administrador') {
      return res.status(400).json({ 
        error: `No se puede modificar un pedido que está ${pedidoLote.estado}. Contacte al administrador.` 
      });
    }
    
    pedidoLote.estado = estado;
    pedidoLote.usuario_modificacion_id = req.usuario.id;
    await pedidoLote.save();
    
    res.json({ message: `Estado del pedido actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al cambiar estado del pedido:', error);
    res.status(500).json({ error: 'Error al cambiar estado del pedido', details: error.message });
  }
};

// Eliminar un pedido de lote
exports.deletePedidoLote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pedidoLote = await PedidoLote.findByPk(id);
    
    if (!pedidoLote) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Verificar si hay ingresos o salidas asociados a este pedido
    const ingresosAsociados = await Ingreso.count({ where: { pedido_lote_id: id } });
    const salidasAsociadas = await Salida.count({ where: { pedido_lote_id: id } });
    
    if (ingresosAsociados > 0 || salidasAsociadas > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el pedido porque tiene registros de ingresos o salidas asociados' 
      });
    }
    
    await pedidoLote.destroy();
    
    res.json({ message: 'Pedido de lote eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pedido de lote:', error);
    res.status(500).json({ error: 'Error al eliminar pedido de lote', details: error.message });
  }
};

// Obtener pedidos por estado
exports.getPedidosByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    
    if (!['pendiente', 'completado', 'cancelado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido. Debe ser pendiente, completado o cancelado' });
    }
    
    const pedidos = await PedidoLote.findAll({
      where: { estado },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por estado:', error);
    res.status(500).json({ error: 'Error al obtener pedidos por estado', details: error.message });
  }
};

// Buscar pedidos por término (código o cliente)
exports.searchPedidosLotes = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const pedidos = await PedidoLote.findAll({
      include: [
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
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      where: {
        [Op.or]: [
          { codigo: { [Op.like]: `%${term}%` } },
          sequelize.literal(`cliente.razon_social LIKE '%${term}%'`),
          sequelize.literal(`cliente.ruc LIKE '%${term}%'`)
        ]
      },
      order: [['fecha_pedido', 'DESC']]
    });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al buscar pedidos:', error);
    res.status(500).json({ error: 'Error al buscar pedidos', details: error.message });
  }
};

// Obtener avance de todos los pedidos
exports.getAvancePedidos = async (req, res) => {
  try {
    // Consultar la vista avance_pedidos
    const [avancePedidos] = await sequelize.query(`
      SELECT * FROM avance_pedidos
    `);
    
    res.json(avancePedidos);
  } catch (error) {
    console.error('Error al obtener avance de pedidos:', error);
    res.status(500).json({ error: 'Error al obtener avance de pedidos', details: error.message });
  }
};

// Obtener avance de un pedido específico
exports.getAvancePedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pedido existe
    const pedidoExiste = await PedidoLote.findByPk(id);
    if (!pedidoExiste) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Consultar la vista avance_pedidos para un pedido específico
    const [avancePedido] = await sequelize.query(`
      SELECT * FROM avance_pedidos WHERE pedido_id = :pedidoId
    `, {
      replacements: { pedidoId: id }
    });
    
    if (avancePedido.length === 0) {
      return res.status(404).json({ error: 'No se encontró información de avance para este pedido' });
    }
    
    res.json(avancePedido[0]);
  } catch (error) {
    console.error('Error al obtener avance del pedido:', error);
    res.status(500).json({ error: 'Error al obtener avance del pedido', details: error.message });
  }
};

// Obtener pedidos por cliente
exports.getPedidosByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    // Verificar si el cliente existe
    const clienteExiste = await Cliente.findByPk(clienteId);
    if (!clienteExiste) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    const pedidos = await PedidoLote.findAll({
      where: { cliente_id: clienteId },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por cliente:', error);
    res.status(500).json({ error: 'Error al obtener pedidos por cliente', details: error.message });
  }
};

// Obtener pedidos por producto
exports.getPedidosByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar si el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const pedidos = await PedidoLote.findAll({
      where: { producto_id: productoId },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por producto:', error);
    res.status(500).json({ error: 'Error al obtener pedidos por producto', details: error.message });
  }
};

// Obtener pedidos por rango de fechas
exports.getPedidosByFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }
    
    // Validar formato de fechas
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    
    if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }
    
    // Ajustar fecha fin para incluir todo el día
    fechaFinObj.setHours(23, 59, 59, 999);
    
    const pedidos = await PedidoLote.findAll({
      where: {
        fecha_pedido: {
          [Op.between]: [fechaInicioObj, fechaFinObj]
        }
      },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos por fecha:', error);
    res.status(500).json({ error: 'Error al obtener pedidos por fecha', details: error.message });
  }
};

// Obtener resumen estadístico para el dashboard
exports.getDashboardResumen = async (req, res) => {
  try {
    // Total de pedidos
    const totalPedidos = await PedidoLote.count();
    
    // Pedidos por estado
    const pedidosPendientes = await PedidoLote.count({ where: { estado: 'pendiente' } });
    const pedidosCompletados = await PedidoLote.count({ where: { estado: 'completado' } });
    const pedidosCancelados = await PedidoLote.count({ where: { estado: 'cancelado' } });
    
    // Cantidad total solicitada
    const [cantidadResult] = await sequelize.query(`
      SELECT SUM(cantidad) as total FROM pedidos_lotes
    `);
    const cantidadTotalSolicitada = cantidadResult[0]?.total || 0;
    
    // Cantidad total acopiada (desde la vista avance_pedidos)
    const [acopioResult] = await sequelize.query(`
      SELECT SUM(cantidad_acopiada) as total FROM avance_pedidos
    `);
    const cantidadTotalAcopiada = acopioResult[0]?.total || 0;
    
    // Calcular porcentaje de avance
    const porcentajeAvanceTotal = cantidadTotalSolicitada > 0 
      ? (cantidadTotalAcopiada / cantidadTotalSolicitada) * 100 
      : 0;
    
    // Pedidos recientes (últimos 5)
    const pedidosRecientes = await PedidoLote.findAll({
      include: [
        { model: Cliente, as: 'cliente', attributes: ['razon_social'] },
        { model: Producto, as: 'producto', attributes: ['nombre'] }
      ],
      order: [['fecha_pedido', 'DESC']],
      limit: 5,
      attributes: ['id', 'codigo', 'cantidad', 'fecha_pedido', 'estado']
    });
    
    // Pedidos próximos a vencer (fecha límite en los próximos 7 días)
    const fechaHoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 7);
    
    const pedidosProximosVencer = await PedidoLote.findAll({
      where: {
        fecha_limite: {
          [Op.between]: [fechaHoy, fechaLimite]
        },
        estado: 'pendiente'
      },
      include: [
        { model: Cliente, as: 'cliente', attributes: ['razon_social'] },
        { model: Producto, as: 'producto', attributes: ['nombre'] }
      ],
      order: [['fecha_limite', 'ASC']],
      limit: 5,
      attributes: ['id', 'codigo', 'cantidad', 'fecha_pedido', 'fecha_limite', 'estado']
    });
    
    res.json({
      totalPedidos,
      pedidosPendientes,
      pedidosCompletados,
      pedidosCancelados,
      cantidadTotalSolicitada,
      cantidadTotalAcopiada,
      porcentajeAvanceTotal: parseFloat(porcentajeAvanceTotal.toFixed(2)),
      pedidosRecientes,
      pedidosProximosVencer
    });
  } catch (error) {
    console.error('Error al obtener resumen para dashboard:', error);
    res.status(500).json({ error: 'Error al obtener resumen para dashboard', details: error.message });
  }
};

// Generar reporte de pedidos
exports.generarReporte = async (req, res) => {
  try {
    const { formato, estado, fechaInicio, fechaFin } = req.query;
    
    if (!formato || !['excel', 'pdf'].includes(formato)) {
      return res.status(400).json({ error: 'Formato no válido. Debe ser excel o pdf' });
    }
    
    // Construir condiciones de búsqueda
    const where = {};
    
    if (estado && estado !== 'todos') {
      if (!['pendiente', 'completado', 'cancelado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
      }
      where.estado = estado;
    }
    
    if (fechaInicio && fechaFin) {
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin);
      
      if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
      }
      
      // Ajustar fecha fin para incluir todo el día
      fechaFinObj.setHours(23, 59, 59, 999);
      
      where.fecha_pedido = {
        [Op.between]: [fechaInicioObj, fechaFinObj]
      };
    }
    
    // Obtener datos para el reporte
    const pedidos = await PedidoLote.findAll({
      where,
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    // Generar reporte según formato solicitado
    if (formato === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pedidos de Lotes');
      
      // Definir encabezados
      worksheet.columns = [
        { header: 'Código', key: 'codigo', width: 15 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Producto', key: 'producto', width: 20 },
        { header: 'Tipo de Fruta', key: 'tipoFruta', width: 15 },
        { header: 'Cantidad', key: 'cantidad', width: 12 },
        { header: 'Unidad', key: 'unidad', width: 10 },
        { header: 'Fecha Pedido', key: 'fechaPedido', width: 15 },
        { header: 'Fecha Límite', key: 'fechaLimite', width: 15 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Observación', key: 'observacion', width: 30 }
      ];
      
      // Estilo para encabezados
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } };
      
      // Agregar datos
      pedidos.forEach(pedido => {
        worksheet.addRow({
          codigo: pedido.codigo,
          cliente: pedido.cliente.razon_social,
          producto: pedido.producto.nombre,
          tipoFruta: pedido.tipo_fruta.nombre,
          cantidad: pedido.cantidad,
          unidad: pedido.unidad_medida.abreviatura,
          fechaPedido: pedido.fecha_pedido.toISOString().split('T')[0],
          fechaLimite: pedido.fecha_limite ? pedido.fecha_limite.toISOString().split('T')[0] : 'N/A',
          estado: pedido.estado,
          observacion: pedido.observacion || ''
        });
      });
      
      // Configurar respuesta
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Pedidos.xlsx');
      
      // Enviar el archivo
      await workbook.xlsx.write(res);
      res.end();
    } else if (formato === 'pdf') {
      // Crear documento PDF
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      
      // Configurar respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Pedidos.pdf');
      
      // Pipe al response
      doc.pipe(res);
      
      // Título
      doc.fontSize(16).text('Reporte de Pedidos de Lotes', { align: 'center' });
      doc.moveDown();
      
      // Filtros aplicados
      doc.fontSize(10).text(`Filtros aplicados:`, { underline: true });
      doc.text(`Estado: ${estado || 'Todos'}`);
      if (fechaInicio && fechaFin) {
        doc.text(`Período: ${new Date(fechaInicio).toLocaleDateString()} al ${new Date(fechaFin).toLocaleDateString()}`);
      }
      doc.moveDown();
      
      // Tabla de datos
      const tableTop = 150;
      const tableLeft = 40;
      const colWidths = [80, 100, 80, 80, 80, 80];
      
      // Encabezados de tabla
      doc.font('Helvetica-Bold');
      doc.text('Código', tableLeft, tableTop);
      doc.text('Cliente', tableLeft + colWidths[0], tableTop);
      doc.text('Producto', tableLeft + colWidths[0] + colWidths[1], tableTop);
      doc.text('Cantidad', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
      doc.text('Fecha Pedido', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
      doc.text('Estado', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);
      
      // Línea horizontal después de encabezados
      doc.moveTo(tableLeft, tableTop + 20)
         .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], tableTop + 20)
         .stroke();
      
      // Datos de la tabla
      let y = tableTop + 30;
      doc.font('Helvetica');
      
      pedidos.forEach((pedido, i) => {
        // Si llegamos al final de la página, crear una nueva
        if (y > 700) {
          doc.addPage();
          y = 50;
          
          // Repetir encabezados en la nueva página
          doc.font('Helvetica-Bold');
          doc.text('Código', tableLeft, y);
          doc.text('Cliente', tableLeft + colWidths[0], y);
          doc.text('Producto', tableLeft + colWidths[0] + colWidths[1], y);
          doc.text('Cantidad', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y);
          doc.text('Fecha Pedido', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y);
          doc.text('Estado', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y);
          
          // Línea horizontal después de encabezados
          doc.moveTo(tableLeft, y + 20)
             .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y + 20)
             .stroke();
          
          y += 30;
          doc.font('Helvetica');
        }
        
        // Datos de cada fila
        doc.text(pedido.codigo, tableLeft, y, { width: colWidths[0], ellipsis: true });
        doc.text(pedido.cliente.razon_social, tableLeft + colWidths[0], y, { width: colWidths[1], ellipsis: true });
        doc.text(pedido.producto.nombre, tableLeft + colWidths[0] + colWidths[1], y, { width: colWidths[2], ellipsis: true });
        doc.text(`${pedido.cantidad} ${pedido.unidad_medida.abreviatura}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], ellipsis: true });
        doc.text(pedido.fecha_pedido.toISOString().split('T')[0], tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y, { width: colWidths[4], ellipsis: true });
        doc.text(pedido.estado, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y, { width: colWidths[5], ellipsis: true });
        
        y += 20;
        
        // Línea horizontal después de cada fila
        if (i < pedidos.length - 1) {
          doc.moveTo(tableLeft, y - 5)
             .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y - 5)
             .stroke({ opacity: 0.2 });
        }
      });
      
      // Resumen al final del reporte
      doc.moveDown(2);
      doc.font('Helvetica-Bold').text('Resumen:', { underline: true });
      doc.font('Helvetica').text(`Total de pedidos: ${pedidos.length}`);
      
      // Contar pedidos por estado
      const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
      const completados = pedidos.filter(p => p.estado === 'completado').length;
      const cancelados = pedidos.filter(p => p.estado === 'cancelado').length;
      
      doc.text(`Pedidos pendientes: ${pendientes}`);
      doc.text(`Pedidos completados: ${completados}`);
      doc.text(`Pedidos cancelados: ${cancelados}`);
      
      // Pie de página con fecha de generación
      const bottomOfPage = doc.page.height - 50;
      doc.fontSize(8)
         .text(
           `Reporte generado el ${new Date().toLocaleString()}`,
           doc.page.margins.left,
           bottomOfPage,
           { align: 'center' }
         );
      
      // Finalizar documento
      doc.end();
    }
  } catch (error) {
    console.error('Error al generar reporte de pedidos:', error);
    res.status(500).json({ error: 'Error al generar reporte de pedidos', details: error.message });
  }
};

// Obtener contribución de socios por pedido
exports.getContribucionSociosPorPedido = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pedido existe
    const pedidoExiste = await PedidoLote.findByPk(id);
    if (!pedidoExiste) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Consultar la vista contribucion_por_socio para un pedido específico
    const [contribuciones] = await sequelize.query(`
      SELECT * FROM contribucion_por_socio WHERE pedido_id = :pedidoId
      ORDER BY total_aportado DESC
    `, {
      replacements: { pedidoId: id }
    });
    
    res.json(contribuciones);
  } catch (error) {
    console.error('Error al obtener contribución de socios:', error);
    res.status(500).json({ error: 'Error al obtener contribución de socios', details: error.message });
  }
};

// Obtener historial de cambios de estado de un pedido
exports.getHistorialCambiosEstado = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pedido existe
    const pedidoExiste = await PedidoLote.findByPk(id);
    if (!pedidoExiste) {
      return res.status(404).json({ error: 'Pedido de lote no encontrado' });
    }
    
    // Consultar el historial de cambios de estado
    const historial = await HistorialCambiosEstado.findAll({
      where: { pedido_lote_id: id },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_cambio', 'DESC']]
    });
    
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial de cambios:', error);
    res.status(500).json({ error: 'Error al obtener historial de cambios', details: error.message });
  }
};

// Obtener pedidos con fecha límite vencida
exports.getPedidosVencidos = async (req, res) => {
  try {
    const fechaHoy = new Date();
    
    const pedidosVencidos = await PedidoLote.findAll({
      where: {
        fecha_limite: {
          [Op.lt]: fechaHoy
        },
        estado: 'pendiente'
      },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_limite', 'ASC']]
    });
    
    res.json(pedidosVencidos);
  } catch (error) {
    console.error('Error al obtener pedidos vencidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos vencidos', details: error.message });
  }
};

// Obtener pedidos próximos a vencer (en los próximos N días)
exports.getPedidosProximosVencer = async (req, res) => {
  try {
    const { dias = 7 } = req.query;
    
    // Validar que días sea un número
    if (isNaN(parseInt(dias))) {
      return res.status(400).json({ error: 'El parámetro días debe ser un número' });
    }
    
    const fechaHoy = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));
    
    const pedidosProximos = await PedidoLote.findAll({
      where: {
        fecha_limite: {
          [Op.between]: [fechaHoy, fechaLimite]
        },
        estado: 'pendiente'
      },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Producto, as: 'producto' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['fecha_limite', 'ASC']]
    });
    
    res.json(pedidosProximos);
  } catch (error) {
    console.error('Error al obtener pedidos próximos a vencer:', error);
    res.status(500).json({ error: 'Error al obtener pedidos próximos a vencer', details: error.message });
  }
};
