const { DetallePesaje, Ingreso, DetalleOrdenCompra, Usuario, sequelize } = require('../models');

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
          attributes: ['id', 'usuario']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario']
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
          attributes: ['id', 'usuario']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario']
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

// Función para recalcular y actualizar la cantidad ingresada
async function actualizarCantidadIngresada(detalleOrdenId, transaction) {
  // Obtener todos los DetallePesaje activos asociados al mismo detalle_orden_id
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

  // Recalcular la cantidad ingresada sumando todos los pesos netos de los pesajes activos
  const totalPesoNeto = ingresosRelacionados.reduce((sum, ingresoRelacionado) => {
    return sum + ingresoRelacionado.pesajes.reduce((pesajeSum, pesaje) => {
      return pesajeSum + parseFloat(pesaje.peso_neto || 0);
    }, 0);
  }, 0);

  // Actualizar la cantidad ingresada en el detalle de orden
  const detalleOrden = await DetalleOrdenCompra.findByPk(detalleOrdenId, { transaction });
  if (detalleOrden) {
    await detalleOrden.update({ cantidad_ingresada: totalPesoNeto }, { transaction });
  }
}

// Crear un nuevo detalle de pesaje
exports.createDetallePesaje = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      ingreso_id,
      numero_pesaje,
      peso_bruto,
      num_jabas_pesaje,
      peso_jaba,
      descuento_merma,
      rawData,
      observacion,
      producto_id,
      detalle_orden_id,
      tipo_fruta_id,
      producto_nombre, 
      tipo_fruta_nombre 
    } = req.body;

    // Validar campos obligatorios
    if (!ingreso_id || !numero_pesaje || !peso_bruto || !num_jabas_pesaje || !peso_jaba || !producto_id || !detalle_orden_id || !tipo_fruta_id) {
      throw new Error('Los campos ingreso_id, numero_pesaje, peso_bruto, num_jabas_pesaje, peso_jaba, producto_id, detalle_orden_id, y tipo_fruta_id son obligatorios');
    }

    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingreso_id);
    if (!ingresoExiste) {
      throw new Error('Ingreso no encontrado');
    }

    // Verificar que no exista ya un pesaje con el mismo número para este ingreso
    const pesajeExistente = await DetallePesaje.findOne({
      where: {
        ingreso_id,
        numero_pesaje
      }
    });

    if (pesajeExistente) {
      throw new Error(`Ya existe un pesaje con el número ${numero_pesaje} para este ingreso`);
    }

    // Crear el detalle de pesaje
    const detallePesaje = await DetallePesaje.create({
      ingreso_id,
      numero_pesaje,
      peso_bruto: parseFloat(peso_bruto),
      num_jabas_pesaje: parseInt(num_jabas_pesaje),
      peso_jaba: parseFloat(peso_jaba),
      descuento_merma: descuento_merma ? parseFloat(descuento_merma) : 0.000,
      rawData,
      observacion,
      producto_id,
      detalle_orden_id,
      tipo_fruta_id,
      producto_nombre,
      tipo_fruta_nombre,
      fecha_pesaje: new Date(),
      estado: true,
      usuario_creacion_id: req.usuario.id,
      fecha_creacion: new Date()
    }, { transaction });

    // Actualizar cantidad_ingresada en DetalleOrdenCompra
    await actualizarCantidadIngresada(ingresoExiste.detalle_orden_id, transaction);

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
          attributes: ['id', 'usuario']
        }
      ]
    });

    res.status(201).json(detallePesajeCompleto);
  } catch (error) {
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error('Error al crear detalle de pesaje:', error);
    res.status(500).json({ error: 'Error al crear detalle de pesaje', details: error.message });
  }
};

// Actualizar un detalle de pesaje existente
exports.updateDetallePesaje = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      peso_bruto,
      num_jabas_pesaje,
      peso_jaba,
      descuento_merma,
      rawData,
      observacion,
      producto_id,
      detalle_orden_id,
      tipo_fruta_id,
      producto_nombre, 
      tipo_fruta_nombre,
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
      peso_bruto: peso_bruto !== undefined ? parseFloat(peso_bruto) : detallePesaje.peso_bruto,
      num_jabas_pesaje: num_jabas_pesaje !== undefined ? parseInt(num_jabas_pesaje) : detallePesaje.num_jabas_pesaje,
      peso_jaba: peso_jaba !== undefined ? parseFloat(peso_jaba) : detallePesaje.peso_jaba,
      descuento_merma: descuento_merma !== undefined ? parseFloat(descuento_merma) : detallePesaje.descuento_merma,
      rawData: rawData !== undefined ? rawData : detallePesaje.rawData,
      observacion: observacion !== undefined ? observacion : detallePesaje.observacion,
      producto_id: producto_id !== undefined ? producto_id : detallePesaje.producto_id,
      detalle_orden_id: detalle_orden_id !== undefined ? detalle_orden_id : detallePesaje.detalle_orden_id,
      tipo_fruta_id: tipo_fruta_id !== undefined ? tipo_fruta_id : detallePesaje.tipo_fruta_id,
      estado: estado !== undefined ? estado : detallePesaje.estado,
      usuario_modificacion_id: req.usuario.id,
      producto_nombre: producto_nombre !== undefined ? producto_nombre : detallePesaje.producto_nombre, // Add this line
      tipo_fruta_nombre: tipo_fruta_nombre !== undefined ? tipo_fruta_nombre : detallePesaje.tipo_fruta_nombre,
      fecha_modificacion: new Date()
    }, { transaction });

    // Obtener el ingreso relacionado
    const ingreso = await Ingreso.findByPk(detallePesaje.ingreso_id, { transaction });
    if (ingreso) {
      // Actualizar cantidad_ingresada en DetalleOrdenCompra
      await actualizarCantidadIngresada(ingreso.detalle_orden_id, transaction);
    }

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
          attributes: ['id', 'usuario']
        },
        {
          model: Usuario,
          as: 'usuario_modificacion',
          attributes: ['id', 'usuario']
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

exports.deleteDetallesPesajeByIngresoId = async (req, res) => {
  try {
    const { ingreso_id } = req.params;

    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingreso_id);
    if (!ingresoExiste) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    // Eliminar todos los detalles de pesaje asociados al ingreso_id
    const deletedCount = await DetallePesaje.destroy({
      where: { ingreso_id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'No se encontraron detalles de pesaje para eliminar' });
    }

    res.json({ message: 'Detalles de pesaje eliminados correctamente', count: deletedCount });
  } catch (error) {
    console.error('Error al eliminar detalles de pesaje:', error);
    res.status(500).json({ error: 'Error al eliminar detalles de pesaje', details: error.message });
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
      peso_bruto: pesaje.peso_bruto,
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
    // await actualizarTotalesIngreso(ingreso_id);

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