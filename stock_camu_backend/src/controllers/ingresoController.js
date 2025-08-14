const { 
  Ingreso, 
  Socio, 
  Usuario, 
  DetalleOrdenCompra,
  OrdenCompra,
  Cliente,
  Producto,
  TipoFruta,
  DetallePesaje,sequelize 
} = require('../models');

// Importar Op por separado desde Sequelize
const { Op } = require('sequelize');

async function actualizarCantidadIngresada(detalleOrdenId, transaction) {
  const ingresosRelacionados = await Ingreso.findAll({
    where: { detalle_orden_id: detalleOrdenId },
    include: [
      {
        model: DetallePesaje,
        as: 'pesajes',
        where: { estado: true },
        required: false
      }
    ],
    transaction
  });

  const totalPesoNeto = ingresosRelacionados.reduce((sum, ingresoRelacionado) => {
    return sum + ingresoRelacionado.pesajes.reduce((pesajeSum, pesaje) => {
      return pesajeSum + parseFloat(pesaje.peso_neto_pesaje || 0);
    }, 0);
  }, 0);

  const detalleOrden = await DetalleOrdenCompra.findByPk(detalleOrdenId, { transaction });
  if (detalleOrden) {
    await detalleOrden.update({ cantidad_ingresada: totalPesoNeto }, { transaction });
  }
}


// Obtener todos los ingresos con paginación y filtros

exports.getAllIngresos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    // Búsqueda general en múltiples campos
    if (req.query.search) {
      filters[Op.or] = [
        { numero_ingreso: { [Op.like]: `%${req.query.search}%` } },
        { '$socio.nombres$': { [Op.like]: `%${req.query.search}%` } },
        { '$socio.apellidos$': { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    // Filtro específico por número de ingreso
    if (req.query.numero_ingreso) {
      filters.numero_ingreso = { [Op.like]: `%${req.query.numero_ingreso}%` };
    }

    // Filtro específico por nombre del socio
    if (req.query.socio_nombre) {
      filters[Op.or] = [
        { '$socio.nombres$': { [Op.like]: `%${req.query.socio_nombre}%` } },
        { '$socio.apellidos$': { [Op.like]: `%${req.query.socio_nombre}%` } }
      ];
    }

    // Filtro por estado
    if (req.query.estado !== undefined) {
      filters.estado = req.query.estado === 'true';
    }

    // Filtro por fecha
    if (req.query.fecha_inicio && req.query.fecha_fin) {
      filters.fecha = {
        [Op.between]: [req.query.fecha_inicio, req.query.fecha_fin]
      };
    }


    // Hacer el conteo por separado
    const count = await Ingreso.count({
      where: filters,
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: []
        }
      ],
      distinct: true
    });

    // Obtener los registros
    const rows = await Ingreso.findAll({
      where: filters,
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'nombres', 'apellidos', 'dni']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              include: [
                {
                  model: Cliente,
                  as: 'cliente',
                  attributes: ['id', 'razon_social', 'ruc']
                }
              ]
            },
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
          ]
        },
        // {
        //   model: DetallePesaje,
        //   as: 'pesajes',
        //   where: { estado: true },
        //   required: false,
        //   attributes: ['id', 'numero_pesaje', 'peso_bruto', 'peso_jaba', 'descuento_merma_pesaje', 'fecha_pesaje']
        // },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario']
        }
      ],
      limit,
      offset,
      order: [['fecha', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      ingresos: rows
    });
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ message: 'Error al obtener ingresos', details: error.message });
  }
};

// Buscar ingresos
exports.searchIngresos = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    const ingresos = await Ingreso.findAll({
      where: {
        [Op.or]: [
          { numero_ingreso: { [Op.like]: `%${term}%` } },
          { '$socio.nombres$': { [Op.like]: `%${term}%` } },
          { '$socio.apellidos$': { [Op.like]: `%${term}%` } }
        ]
      },
      include: [
        { 
          model: Socio, 
          as: 'socio',
          attributes: ['id', 'nombres', 'apellidos', 'dni']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              attributes: ['id', 'codigo_lote', 'numero_orden']
            },
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre']
            }
          ]
        },
        {
          model: DetallePesaje,
          as: 'pesajes',
          where: { estado: true },
          required: false
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
        }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.json(ingresos);
  } catch (error) {
    console.error('Error al buscar ingresos:', error);
    res.status(500).json({ error: 'Error al buscar ingresos', details: error.message });
  }
};

// Obtener un ingreso por ID
exports.getIngresoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ingreso = await Ingreso.findByPk(id, {
      include: [
        { 
          model: Socio, 
          as: 'socio',
          attributes: ['id', 'nombres', 'apellidos', 'codigo']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              include: [
                {
                  model: Cliente,
                  as: 'cliente'
                }
              ]
            },
            {
              model: Producto,
              as: 'producto'
            },
            {
              model: TipoFruta,
              as: 'tipo_fruta'
            }
          ]
        },
        {
          model: DetallePesaje,
          as: 'pesajes',
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: 'usuario_creacion',
              attributes: ['id', 'usuario']
            }
          ],
          order: [['numero_pesaje', 'ASC']]
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
        }
      ]
    });
    
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    res.json(ingreso);
  } catch (error) {
    console.error('Error al obtener ingreso:', error);
    res.status(500).json({ error: 'Error al obtener ingreso', details: error.message });
  }
};

// Crear un nuevo ingreso
exports.createIngreso = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Datos recibidos para crear ingreso:', req.body);
    
    // Validar campos obligatorios
    const camposObligatorios = ['socio_id', 'detalle_orden_id'];
    
    for (const campo of camposObligatorios) {
      if (!req.body[campo]) {
        await transaction.rollback();
        return res.status(400).json({ error: `El campo ${campo} es obligatorio` });
      }
    }
    
    // Validar que el socio exista
    const socio = await Socio.findByPk(req.body.socio_id);
    if (!socio) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El socio especificado no existe' });
    }
    
    // Validar que el detalle de orden exista y obtener la orden de compra
    const detalleOrden = await DetalleOrdenCompra.findByPk(req.body.detalle_orden_id, {
      include: [
        {
          model: OrdenCompra,
          as: 'orden_compra',
          attributes: ['id', 'codigo_lote']
        }
      ],
      transaction
    });
    
    if (!detalleOrden) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El detalle de orden especificado no existe' });
    }
    
    if (!detalleOrden.orden_compra) {
      await transaction.rollback();
      return res.status(404).json({ error: 'No se encontró la orden de compra asociada' });
    }
    
    const codigoLote = detalleOrden.orden_compra.codigo_lote;
    console.log('Código de lote obtenido:', codigoLote);
    
    // Buscar el último ingreso con el mismo código de lote para generar el siguiente número
    const ultimoIngreso = await Ingreso.findOne({
      where: {
        numero_ingreso: {
          [Op.like]: `${codigoLote}-%`
        }
      },
      order: [['numero_ingreso', 'DESC']],
      transaction
    });
    
    let numeroIngreso;
    if (ultimoIngreso) {
      console.log('Último ingreso encontrado:', ultimoIngreso.numero_ingreso);
      // Extraer el número secuencial del último ingreso
      const match = ultimoIngreso.numero_ingreso.match(/-(\d+)$/);
      if (match) {
        const ultimoNumero = parseInt(match[1], 10);
        const siguienteNumero = ultimoNumero + 1;
        numeroIngreso = `${codigoLote}-${siguienteNumero.toString().padStart(2, '0')}`;
      } else {
        // Si no coincide el patrón, empezar con 01
        numeroIngreso = `${codigoLote}-01`;
      }
    } else {
      // Si no hay ingresos previos con este código de lote, empezar con 01
      numeroIngreso = `${codigoLote}-01`;
    }
    
    console.log('Número de ingreso generado:', numeroIngreso);
    
    // Verificar que el número de ingreso generado no exista (por seguridad)
    const ingresoExistente = await Ingreso.findOne({
      where: { numero_ingreso: numeroIngreso },
      transaction
    });
    
    if (ingresoExistente) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Error al generar número de ingreso único' });
    }
    
    // Preparar datos del ingreso
    const datosIngreso = {
      numero_ingreso: numeroIngreso,
      fecha: req.body.fecha || new Date(),
      socio_id: parseInt(req.body.socio_id),
      detalle_orden_id: parseInt(req.body.detalle_orden_id),
      peso_bruto: parseFloat(req.body.peso_bruto) || 0,
      peso_total_jabas: parseFloat(req.body.peso_total_jabas) || 0,
      num_jabas: parseInt(req.body.num_jabas) || 0,
      peso_neto: parseFloat(req.body.peso_neto) || 0,
      dscto_merma: parseFloat(req.body.dscto_merma) || 0,
      aplicarPrecioJaba: req.body.aplicarPrecioJaba || false,
      precio_venta_kg: parseFloat(req.body.precio_venta_kg) || 0,
      precio_jaba: parseFloat(req.body.precio_jaba) || 0,
      impuesto: parseFloat(req.body.impuesto) || 0,
      pago_transporte: parseFloat(req.body.pago_transporte) || 0,
      monto_transporte: parseFloat(req.body.monto_transporte) || 0,
      ingreso_cooperativa: parseFloat(req.body.ingreso_cooperativa) || 0,
      pago_socio: parseFloat(req.body.pago_socio) || 0,
      subtotal: parseFloat(req.body.subtotal) || 0,
      num_pesajes: parseInt(req.body.num_pesajes) || 0,
      observacion: req.body.observacion || '',
      estado: req.body.estado !== undefined ? req.body.estado : true,
      usuario_creacion_id: req.user?.id || req.usuario?.id
    };
    
    console.log('Datos del ingreso a crear:', datosIngreso);
    
    // Crear el ingreso
    const nuevoIngreso = await Ingreso.create(datosIngreso, { transaction });
    
    await transaction.commit();
    
    // Obtener el ingreso creado con todas las relaciones
    const ingresoCompleto = await Ingreso.findByPk(nuevoIngreso.id, {
      include: [
        { 
          model: Socio, 
          as: 'socio',
          attributes: ['id', 'nombres', 'apellidos', 'dni']
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              attributes: ['id', 'codigo_lote', 'numero_orden']
            },
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
          ]
        },
        {
          model: DetallePesaje,
          as: 'pesajes',
          where: { estado: true },
          required: false
        },
        { 
          model: Usuario, 
          as: 'usuario_creacion', 
          attributes: ['id', 'usuario'] 
        }
      ]
    });
    
    console.log('Ingreso creado exitosamente:', ingresoCompleto.id);
    res.status(201).json(ingresoCompleto);
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear ingreso:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un ingreso con este número' });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(err => `${err.path}: ${err.message}`);
      return res.status(400).json({ error: 'Errores de validación', details: errores });
    }
    
    res.status(500).json({ error: 'Error al crear ingreso', details: error.message });
  }
};

// Actualizar un ingreso existente

exports.updateIngreso = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const ingreso = await Ingreso.findByPk(id);
    if (!ingreso) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Validar que el socio exista si se está actualizando
    if (req.body.socio_id) {
      const socio = await Socio.findByPk(req.body.socio_id);
      if (!socio) {
        await transaction.rollback();
        return res.status(404).json({ error: 'El socio especificado no existe' });
      }
    }
    
    // Validar que el detalle de orden exista si se está actualizando
    if (req.body.detalle_orden_id) {
      const detalleOrden = await DetalleOrdenCompra.findByPk(req.body.detalle_orden_id);
      if (!detalleOrden) {
        await transaction.rollback();
        return res.status(404).json({ error: 'El detalle de orden especificado no existe' });
      }
    }
    
    // Use a fallback for user ID if req.user is undefined
    const userId = req.user?.id || req.usuario?.id || null;
    if (!userId) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Usuario no autenticado' });
    }

    // Actualizar el ingreso
    await ingreso.update({
      ...req.body,
      usuario_modificacion_id: userId,
      aplicarPrecioJaba: req.body.aplicarPrecioJaba || ingreso.aplicarPrecioJaba
    }, { transaction });
    
    await transaction.commit();
    
    // Obtener el ingreso actualizado con sus relaciones
    const ingresoActualizado = await Ingreso.findByPk(req.params.id, {
      include: [
        { model: Socio, as: 'socio' },
        { model: DetalleOrdenCompra, as: 'detalle_orden' },
        { model: DetallePesaje, as: 'pesajes', where: { estado: true }, required: false },
        { model: Usuario, as: 'usuario_creacion', attributes: ['id', 'usuario'] },
        { model: Usuario, as: 'usuario_modificacion', attributes: ['id', 'usuario'] }
      ]
    });
    
    res.json(ingresoActualizado);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar ingreso:', error);
    res.status(500).json({ error: 'Error al actualizar ingreso', details: error.message });
  }
};
// Eliminar un ingreso
exports.deleteIngreso = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const ingreso = await Ingreso.findByPk(req.params.id, {
      include: [
        {
          model: DetallePesaje,
          as: 'pesajes',
          where: { estado: true },
          required: false
        }
      ],
      transaction
    });

    if (!ingreso) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }

    // Obtener el detalle de orden asociado
    const detalleOrdenId = ingreso.detalle_orden_id;

    // Eliminar el ingreso
    await ingreso.destroy({ transaction });

    // Actualizar cantidad ingresada
    await actualizarCantidadIngresada(detalleOrdenId, transaction);

    await transaction.commit();
    res.json({ message: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ message: 'Error al eliminar ingreso', details: error.message });
  }
};
// Cambiar estado de un ingreso (activar/desactivar)
exports.cambiarEstadoIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (estado === undefined) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }
    
    const ingreso = await Ingreso.findByPk(id);
    
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    ingreso.estado = estado;
    ingreso.usuario_modificacion_id = req.usuario.id;
    await ingreso.save();
    
    res.json({ 
      message: `Ingreso ${estado ? 'activado' : 'desactivado'} correctamente`,
      ingreso
    });
  } catch (error) {
    console.error('Error al cambiar estado del ingreso:', error);
    res.status(500).json({ error: 'Error al cambiar estado del ingreso', details: error.message });
  }
};