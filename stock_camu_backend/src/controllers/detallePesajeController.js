const { DetallePesaje, Ingreso, Usuario, sequelize } = require('../models');

// Función auxiliar para actualizar totales del ingreso
const actualizarTotalesIngreso = async (ingresoId, transaction = null) => {
  try {
    const ingreso = await Ingreso.findByPk(ingresoId, {
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

    if (!ingreso) return;

    const pesajes = ingreso.pesajes || [];
    
    // Calcular totales de pesajes
    const totalPesoBruto = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.peso || 0), 0);
    const totalPesoJabas = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.peso_jaba || 0), 0);
    const totalDescuentoMerma = pesajes.reduce((sum, pesaje) => sum + parseFloat(pesaje.descuento_merma_pesaje || 0), 0);
    const numJabas = pesajes.length;
    
    // Calcular peso neto
    const pesoNeto = totalPesoBruto - totalPesoJabas - totalDescuentoMerma;
    
    // Actualizar el ingreso con los totales calculados
    await ingreso.update({
      peso_bruto: totalPesoBruto,
      peso_total_jabas: totalPesoJabas,
      num_jabas: numJabas,
      peso_neto: pesoNeto,
      dscto_merma: totalDescuentoMerma,
      dscto_jaba: totalPesoJabas
    }, { transaction });

    return ingreso;
  } catch (error) {
    console.error('Error al actualizar totales del ingreso:', error);
    throw error;
  }
};

// Obtener todos los detalles de pesaje
exports.getAllDetallesPesaje = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};

    // Filtro por estado
    if (req.query.estado !== undefined) {
      filters.estado = req.query.estado === 'true';
    }

    // Filtro por ingreso_id
    if (req.query.ingreso_id) {
      filters.ingreso_id = req.query.ingreso_id;
    }

    const { count, rows } = await DetallePesaje.findAndCountAll({
      where: filters,
      include: [
        {
          model: Ingreso,
          as: 'ingreso',
          attributes: ['id', 'numero_ingreso', 'fecha']
        },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        }
      ],
      limit,
      offset,
      order: [['fecha_pesaje', 'DESC'], ['numero_pesaje', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      detallesPesaje: rows
    });
  } catch (error) {
    console.error('Error al obtener detalles de pesaje:', error);
    res.status(500).json({ error: 'Error al obtener detalles de pesaje', details: error.message });
  }
};

// Obtener un detalle de pesaje por ID
exports.getDetallePesajeById = async (req, res) => {
  try {
    const detallePesaje = await DetallePesaje.findByPk(req.params.id, {
      include: [
        {
          model: Ingreso,
          as: 'ingreso',
          attributes: ['id', 'numero_ingreso', 'fecha']
        },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        }
      ]
    });
    
    if (!detallePesaje) {
      return res.status(404).json({ error: 'Detalle de pesaje no encontrado' });
    }
    
    res.json(detallePesaje);
  } catch (error) {
    console.error('Error al obtener detalle de pesaje:', error);
    res.status(500).json({ error: 'Error al obtener detalle de pesaje', details: error.message });
  }
};

// Obtener todos los detalles de pesaje de un ingreso específico
exports.getDetallesPesajeByIngresoId = async (req, res) => {
  try {
    const { ingresoId } = req.params;
    
    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingresoId);
    if (!ingresoExiste) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Obtener los detalles de pesaje
    const detallesPesaje = await DetallePesaje.findAll({
      where: { 
        ingreso_id: ingresoId,
        estado: true
      },
      include: [
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        }
      ],
      order: [['numero_pesaje', 'ASC']]
    });
    
    res.json(detallesPesaje);
  } catch (error) {
    console.error('Error al obtener detalles de pesaje:', error);
    res.status(500).json({ error: 'Error al obtener detalles de pesaje', details: error.message });
  }
};

// Crear un nuevo detalle de pesaje
exports.createDetallePesaje = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      ingreso_id, 
      numero_pesaje, 
      peso, 
      peso_jaba, 
      descuento_merma_pesaje, 
      observacion_pesaje 
    } = req.body;
    
    // Validar campos obligatorios
    if (!ingreso_id || !numero_pesaje || !peso) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Los campos ingreso_id, numero_pesaje y peso son obligatorios' 
      });
    }
    
    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingreso_id);
    if (!ingresoExiste) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Verificar que no exista ya un pesaje con el mismo número para este ingreso
    const pesajeExistente = await DetallePesaje.findOne({
      where: {
        ingreso_id,
        numero_pesaje
      }
    });
    
    if (pesajeExistente) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: `Ya existe un pesaje con el número ${numero_pesaje} para este ingreso` 
      });
    }
    
    // Crear el detalle de pesaje
    const detallePesaje = await DetallePesaje.create({
      ingreso_id,
      numero_pesaje,
      peso: parseFloat(peso),
      peso_jaba: peso_jaba ? parseFloat(peso_jaba) : 2.000,
      descuento_merma_pesaje: descuento_merma_pesaje ? parseFloat(descuento_merma_pesaje) : 0.000,
      observacion_pesaje,
      fecha_pesaje: new Date(),
      estado: true,
      usuario_creacion_id: req.usuario.id,
      fecha_creacion: new Date()
    }, { transaction });
    
    // Actualizar totales del ingreso
    await actualizarTotalesIngreso(ingreso_id, transaction);
    
    await transaction.commit();
    
    // Obtener el detalle creado con sus relaciones
    const detallePesajeCompleto = await DetallePesaje.findByPk(detallePesaje.id, {
      include: [
        {
          model: Ingreso,
          as: 'ingreso',
          attributes: ['id', 'numero_ingreso', 'fecha']
        },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        }
      ]
    });
    
    res.status(201).json(detallePesajeCompleto);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear detalle de pesaje:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Ya existe un pesaje con este número para el ingreso especificado' 
      });
    }
    
    res.status(500).json({ error: 'Error al crear detalle de pesaje', details: error.message });
  }
};

// Actualizar un detalle de pesaje existente
exports.updateDetallePesaje = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      peso, 
      peso_jaba, 
      descuento_merma_pesaje, 
      observacion_pesaje, 
      estado 
    } = req.body;
    
    // Verificar si el detalle de pesaje existe
    const detallePesaje = await DetallePesaje.findByPk(id);
    if (!detallePesaje) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Detalle de pesaje no encontrado' });
    }
    
    // Actualizar el detalle de pesaje
    await detallePesaje.update({
      peso: peso !== undefined ? parseFloat(peso) : detallePesaje.peso,
      peso_jaba: peso_jaba !== undefined ? parseFloat(peso_jaba) : detallePesaje.peso_jaba,
      descuento_merma_pesaje: descuento_merma_pesaje !== undefined ? parseFloat(descuento_merma_pesaje) : detallePesaje.descuento_merma_pesaje,
      observacion_pesaje: observacion_pesaje !== undefined ? observacion_pesaje : detallePesaje.observacion_pesaje,
      estado: estado !== undefined ? estado : detallePesaje.estado,
      usuario_modificacion_id: req.usuario.id,
      fecha_modificacion: new Date()
    }, { transaction });
    
    // Actualizar totales del ingreso
    await actualizarTotalesIngreso(detallePesaje.ingreso_id, transaction);
    
    await transaction.commit();
    
    // Obtener el detalle actualizado con sus relaciones
    const detallePesajeActualizado = await DetallePesaje.findByPk(detallePesaje.id, {
      include: [
        {
          model: Ingreso,
          as: 'ingreso',
          attributes: ['id', 'numero_ingreso', 'fecha']
        },
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario', 'nombre', 'apellido']
        }
      ]
    });
    
    res.json(detallePesajeActualizado);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar detalle de pesaje:', error);
    res.status(500).json({ error: 'Error al actualizar detalle de pesaje', details: error.message });
  }
};

// Eliminar un detalle de pesaje
exports.deleteDetallePesaje = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el detalle de pesaje existe
    const detallePesaje = await DetallePesaje.findByPk(id);
    if (!detallePesaje) {
      return res.status(404).json({ error: 'Detalle de pesaje no encontrado' });
    }
    
    // Eliminar el detalle de pesaje
    await detallePesaje.destroy();
    
    res.json({ message: 'Detalle de pesaje eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar detalle de pesaje:', error);
    res.status(500).json({ error: 'Error al eliminar detalle de pesaje', details: error.message });
  }
};

// Añadir esta función al controlador existente
exports.createBulkDetallesPesaje = async (req, res) => {
  try {
    const { ingreso_id, pesajes } = req.body;
    
    // Validar datos de entrada
    if (!ingreso_id || !Array.isArray(pesajes) || pesajes.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un ID de ingreso válido y un array de pesajes' 
      });
    }
    
    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingreso_id);
    if (!ingresoExiste) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Preparar los datos para la inserción masiva
    const detallesPesajeData = pesajes.map(pesaje => ({
      ingreso_id,
      numero_pesaje: pesaje.numero_pesaje,
      peso: pesaje.peso,
      peso_jaba: pesaje.peso_jaba ? parseFloat(pesaje.peso_jaba) : 2.000,
      descuento_merma_pesaje: pesaje.descuento_merma_pesaje ? parseFloat(pesaje.descuento_merma_pesaje) : 0.000,
      observacion_pesaje: pesaje.observacion_pesaje,
      fecha_pesaje: new Date(),
      estado: true,
      usuario_creacion_id: req.usuario.id,
      fecha_creacion: new Date()
    }));
    
    // Crear los detalles de pesaje en masa
    const detallesCreados = await DetallePesaje.bulkCreate(detallesPesajeData);
    
    // Actualizar totales del ingreso
    await actualizarTotalesIngreso(ingreso_id);
    
    res.status(201).json({
      message: 'Detalles de pesaje creados correctamente',
      detalles: detallesCreados
    });
  } catch (error) {
    console.error('Error al crear detalles de pesaje en masa:', error);
    res.status(500).json({ 
      error: 'Error al crear detalles de pesaje en masa', 
      details: error.message 
    });
  }
};