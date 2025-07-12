const { DetallePesaje, Ingreso, Usuario } = require('../models');

exports.getAllDetallesPesaje = async (req, res) => {
  try {
    const detallesPesaje = await DetallePesaje.findAll({
      include: [
        { model: Ingreso, as: 'ingreso' }
      ]
    });
    res.json(detallesPesaje);
  } catch (error) {
    console.error('Error al obtener detalles de pesaje:', error);
    res.status(500).json({ error: 'Error al obtener detalles de pesaje', details: error.message });
  }
};

exports.getDetallePesajeById = async (req, res) => {
  try {
    const detallePesaje = await DetallePesaje.findByPk(req.params.id, {
      include: [
        { model: Ingreso, as: 'ingreso' }
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
      where: { ingreso_id: ingresoId },
      include: [
        {
          model: Usuario,
          as: 'usuario_creacion',
          attributes: ['id', 'username', 'nombre']
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
  try {
    const { ingreso_id, numero_pesaje, peso } = req.body;
    
    // Verificar si el ingreso existe
    const ingresoExiste = await Ingreso.findByPk(ingreso_id);
    if (!ingresoExiste) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }
    
    // Crear el detalle de pesaje
    const detallePesaje = await DetallePesaje.create({
      ingreso_id,
      numero_pesaje,
      peso,
      estado: true,
      usuario_creacion_id: req.usuario.id,
      usuario_modificacion_id: req.usuario.id
    });
    
    res.status(201).json(detallePesaje);
  } catch (error) {
    console.error('Error al crear detalle de pesaje:', error);
    res.status(500).json({ error: 'Error al crear detalle de pesaje', details: error.message });
  }
};

// Actualizar un detalle de pesaje existente
exports.updateDetallePesaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { peso, estado } = req.body;
    
    // Verificar si el detalle de pesaje existe
    const detallePesaje = await DetallePesaje.findByPk(id);
    if (!detallePesaje) {
      return res.status(404).json({ error: 'Detalle de pesaje no encontrado' });
    }
    
    // Actualizar el detalle de pesaje
    await detallePesaje.update({
      peso: peso !== undefined ? peso : detallePesaje.peso,
      estado: estado !== undefined ? estado : detallePesaje.estado,
      usuario_modificacion_id: req.usuario.id
    });
    
    res.json(detallePesaje);
  } catch (error) {
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
      estado: true,
      usuario_creacion_id: req.usuario.id,
      usuario_modificacion_id: req.usuario.id
    }));
    
    // Crear los detalles de pesaje en masa
    const detallesCreados = await DetallePesaje.bulkCreate(detallesPesajeData);
    
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