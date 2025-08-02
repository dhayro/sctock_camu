const { 
  Ingreso, 
  Socio, 
  Usuario, 
  DetalleOrdenCompra,
  OrdenCompra,
  Cliente,
  Producto,
  TipoFruta,
  sequelize,
  Op 
} = require('../models');

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
                  attributes: ['id', 'razon_social', 'ruc'] // <-- Cambiar 'nombre' por 'razon_social'
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
    
    const includeArray = [
      { 
        model: Socio, 
        as: 'socio',
        attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'direccion']
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
        model: Usuario, 
        as: 'usuario_creacion', 
        attributes: ['id', 'usuario'] 
      },
      { 
        model: Usuario, 
        as: 'usuario_modificacion', 
        attributes: ['id', 'usuario'] 
      }
    ];

    const ingreso = await Ingreso.findByPk(id, {
      include: includeArray
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
    // Validar campos obligatorios
    const camposObligatorios = ['numero_ingreso', 'fecha', 'socio_id', 'detalle_orden_id'];
    
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
    
    // Validar que el detalle de orden exista
    const detalleOrden = await DetalleOrdenCompra.findByPk(req.body.detalle_orden_id);
    if (!detalleOrden) {
      await transaction.rollback();
      return res.status(404).json({ error: 'El detalle de orden especificado no existe' });
    }
    
    // Verificar que el número de ingreso no exista
    const ingresoExistente = await Ingreso.findOne({
      where: { numero_ingreso: req.body.numero_ingreso }
    });
    
    if (ingresoExistente) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Ya existe un ingreso con este número' });
    }
    
    // Crear el ingreso
    const nuevoIngreso = await Ingreso.create({
      ...req.body,
      usuario_creacion_id: req.user.id
    }, { transaction });
    
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
          model: Usuario, 
          as: 'usuario_creacion', 
          attributes: ['id', 'usuario'] 
        }
      ]
    });
    
    res.status(201).json(ingresoCompleto);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear ingreso:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un ingreso con este número' });
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
    
    // Actualizar el ingreso
    await ingreso.update({
      ...req.body,
      usuario_modificacion_id: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    // Obtener el ingreso actualizado con sus relaciones
    const ingresoActualizado = await Ingreso.findByPk(req.params.id, {
      include: [
        { model: Socio, as: 'socio' },
        { model: DetalleOrdenCompra, as: 'detalle_orden' },
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
  try {
    const ingreso = await Ingreso.findByPk(req.params.id);
    
    if (!ingreso) {
      return res.status(404).json({ message: 'Ingreso no encontrado' });
    }
    
    await ingreso.destroy();
    res.json({ message: 'Ingreso eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({ message: 'Error al eliminar ingreso' });
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