const { Ingreso, Socio, Producto, PedidoLote, UnidadMedida, TipoFruta, Usuario, DetallePesaje } = require('../models');

// Obtener todos los ingresos
exports.getAllIngresos = async (req, res) => {
  try {
    const ingresos = await Ingreso.findAll({
      include: [
        { model: Socio, as: 'socio' },
        { model: Producto, as: 'producto' },
        { model: PedidoLote, as: 'pedido_lote' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' }
      ]
    });
    res.json(ingresos);
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({
      error: 'Error al obtener los ingresos',
      details: error.message
    });
  }
};

// Obtener un ingreso por ID
exports.getIngresoById = async (req, res) => {
  try {
    const ingreso = await Ingreso.findByPk(req.params.id, {
      include: [
        { model: Socio, as: 'socio' },
        { model: Producto, as: 'producto' },
        { model: PedidoLote, as: 'pedido_lote' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' },
        { model: DetallePesaje, as: 'detalles_pesaje' }
      ]
    });
    
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    res.json(ingreso);
  } catch (error) {
    console.error('Error al obtener ingreso:', error);
    res.status(500).json({
      error: 'Error al obtener el ingreso',
      details: error.message
    });
  }
};

// Crear un nuevo ingreso
exports.createIngreso = async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token JWT
    const usuarioId = req.user.id;
    
    // Agregar el ID del usuario como usuario_creacion_id
    const ingresoData = {
      ...req.body,
      usuario_creacion_id: usuarioId
    };
    
    // Validar campos requeridos
    if (!ingresoData.numero_ingreso || !ingresoData.fecha || !ingresoData.socio_id || 
        !ingresoData.producto_id || !ingresoData.pedido_lote_id || !ingresoData.unidad_medida_id || 
        !ingresoData.tipo_fruta_id || !ingresoData.num_jabas) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const ingreso = await Ingreso.create(ingresoData);
    
    // Obtener el ingreso recién creado con todas sus relaciones
    const nuevoIngreso = await Ingreso.findByPk(ingreso.id, {
      include: [
        { model: Socio, as: 'socio' },
        { model: Producto, as: 'producto' },
        { model: PedidoLote, as: 'pedido_lote' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: Usuario, as: 'usuario_creacion' }
      ]
    });
    
    res.status(201).json(nuevoIngreso);
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    res.status(500).json({
      error: 'Error al crear el ingreso',
      details: error.message
    });
  }
};

// Actualizar un ingreso existente
exports.updateIngreso = async (req, res) => {
  try {
    const ingresoId = req.params.id;
    const usuarioId = req.user.id;
    
    // Verificar si el ingreso existe
    const ingreso = await Ingreso.findByPk(ingresoId);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Agregar el ID del usuario como usuario_modificacion_id
    const ingresoData = {
      ...req.body,
      usuario_modificacion_id: usuarioId
    };
    
    // Actualizar el ingreso
    await ingreso.update(ingresoData);
    
    // Obtener el ingreso actualizado con todas sus relaciones
    const ingresoActualizado = await Ingreso.findByPk(ingresoId, {
      include: [
        { model: Socio, as: 'socio' },
        { model: Producto, as: 'producto' },
        { model: PedidoLote, as: 'pedido_lote' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: TipoFruta, as: 'tipo_fruta' },
        { model: Usuario, as: 'usuario_creacion' },
        { model: Usuario, as: 'usuario_modificacion' }
      ]
    });
    
    res.json(ingresoActualizado);
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    res.status(500).json({
      error: 'Error al actualizar el ingreso',
      details: error.message
    });
  }
};

// Eliminar un ingreso
exports.deleteIngreso = async (req, res) => {
  try {
    const ingresoId = req.params.id;
    
    // Verificar si el ingreso existe
    const ingreso = await Ingreso.findByPk(ingresoId);
    if (!ingreso) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Verificar si tiene detalles de pesaje asociados
    const detallesPesaje = await DetallePesaje.findAll({
      where: { ingreso_id: ingresoId }
    });
    
    if (detallesPesaje.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este ingreso porque tiene detalles de pesaje asociados',
        details: `Tiene ${detallesPesaje.length} detalles de pesaje asociados`
      });
    }
    
    // Eliminar el ingreso
    await ingreso.destroy();
    
    res.json({ message: 'Ingreso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ingreso:', error);
    res.status(500).json({
      error: 'Error al eliminar el ingreso',
      details: error.message
    });
  }
};

// Buscar ingresos por número o socio
exports.searchIngresos = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }
    
    const ingresos = await Ingreso.findAll({
      include: [
        { 
          model: Socio, 
          as: 'socio',
          where: {
            [Op.or]: [
              { nombres: { [Op.like]: `%${term}%` } },
              { apellidos: { [Op.like]: `%${term}%` } }
            ]
          },
          required: false
        },
        { model: Producto, as: 'producto' },
        { model: PedidoLote, as: 'pedido_lote' },
        { model: UnidadMedida, as: 'unidad_medida' },
        { model: TipoFruta, as: 'tipo_fruta' }
      ],
      where: {
        [Op.or]: [
          { numero_ingreso: { [Op.like]: `%${term}%` } },
          { '$socio.nombres$': { [Op.like]: `%${term}%` } },
          { '$socio.apellidos$': { [Op.like]: `%${term}%` } }
        ]
      }
    });
    
    res.json(ingresos);
  } catch (error) {
    console.error('Error al buscar ingresos:', error);
    res.status(500).json({
      error: 'Error al buscar ingresos',
      details: error.message
    });
  }
};