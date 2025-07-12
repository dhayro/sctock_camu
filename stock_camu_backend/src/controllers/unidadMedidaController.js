const { UnidadMedida } = require('../models');

// Obtener todas las unidades de medida
exports.getAllUnidadesMedida = async (req, res) => {
  try {
    const unidadesMedida = await UnidadMedida.findAll();
    res.json(unidadesMedida);
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    res.status(500).json({ error: 'Error al obtener unidades de medida', details: error.message });
  }
};

// Obtener una unidad de medida por ID
exports.getUnidadMedidaById = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    res.json(unidadMedida);
  } catch (error) {
    console.error('Error al obtener unidad de medida:', error);
    res.status(500).json({ error: 'Error al obtener unidad de medida', details: error.message });
  }
};

// Crear una nueva unidad de medida
exports.createUnidadMedida = async (req, res) => {
  try {
    const { nombre, abreviatura } = req.body;
    
    // Validaciones básicas
    if (!nombre || !abreviatura) {
      return res.status(400).json({ error: 'El nombre y la abreviatura son obligatorios' });
    }
    
    // Verificar si ya existe una unidad de medida con el mismo nombre o abreviatura
    const existingUnidadNombre = await UnidadMedida.findOne({ where: { nombre } });
    if (existingUnidadNombre) {
      return res.status(400).json({ error: 'Ya existe una unidad de medida con ese nombre' });
    }
    
    const existingUnidadAbreviatura = await UnidadMedida.findOne({ where: { abreviatura } });
    if (existingUnidadAbreviatura) {
      return res.status(400).json({ error: 'Ya existe una unidad de medida con esa abreviatura' });
    }
    
    const newUnidadMedida = await UnidadMedida.create({
      nombre,
      abreviatura
    });
    
    res.status(201).json(newUnidadMedida);
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    res.status(500).json({ error: 'Error al crear unidad de medida', details: error.message });
  }
};

// Actualizar una unidad de medida existente
exports.updateUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, abreviatura } = req.body;
    
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    // Si se cambia el nombre, verificar que no exista otra unidad con ese nombre
    if (nombre && nombre !== unidadMedida.nombre) {
      const existingUnidadNombre = await UnidadMedida.findOne({ where: { nombre } });
      if (existingUnidadNombre) {
        return res.status(400).json({ error: 'Ya existe una unidad de medida con ese nombre' });
      }
      unidadMedida.nombre = nombre;
    }
    
    // Si se cambia la abreviatura, verificar que no exista otra unidad con esa abreviatura
    if (abreviatura && abreviatura !== unidadMedida.abreviatura) {
      const existingUnidadAbreviatura = await UnidadMedida.findOne({ where: { abreviatura } });
      if (existingUnidadAbreviatura) {
        return res.status(400).json({ error: 'Ya existe una unidad de medida con esa abreviatura' });
      }
      unidadMedida.abreviatura = abreviatura;
    }
    
    await unidadMedida.save();
    
    res.json(unidadMedida);
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error);
    res.status(500).json({ error: 'Error al actualizar unidad de medida', details: error.message });
  }
};

// Eliminar una unidad de medida
exports.deleteUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const unidadMedida = await UnidadMedida.findByPk(id);
    
    if (!unidadMedida) {
      return res.status(404).json({ error: 'Unidad de medida no encontrada' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const productosCount = await unidadMedida.countProductos();
    const pedidosCount = await unidadMedida.countPedidos();
    const ingresosCount = await unidadMedida.countIngresos();
    const salidasCount = await unidadMedida.countSalidas();
    
    if (productosCount > 0 || pedidosCount > 0 || ingresosCount > 0 || salidasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar esta unidad de medida porque está siendo utilizada',
        details: `Tiene ${productosCount} productos, ${pedidosCount} pedidos, ${ingresosCount} ingresos y ${salidasCount} salidas asociados`
      });
    }
    
    await unidadMedida.destroy();
    
    res.json({ message: 'Unidad de medida eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error);
    res.status(500).json({ error: 'Error al eliminar unidad de medida', details: error.message });
  }
};