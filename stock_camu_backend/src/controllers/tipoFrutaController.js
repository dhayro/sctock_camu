const { TipoFruta } = require('../models');

// Obtener todos los tipos de fruta
exports.getAllTiposFruta = async (req, res) => {
  try {
    const tiposFruta = await TipoFruta.findAll();
    res.json(tiposFruta);
  } catch (error) {
    console.error('Error al obtener tipos de fruta:', error);
    res.status(500).json({ error: 'Error al obtener tipos de fruta', details: error.message });
  }
};

// Obtener un tipo de fruta por ID
exports.getTipoFrutaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    res.json(tipoFruta);
  } catch (error) {
    console.error('Error al obtener tipo de fruta:', error);
    res.status(500).json({ error: 'Error al obtener tipo de fruta', details: error.message });
  }
};

// Crear un nuevo tipo de fruta
exports.createTipoFruta = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    
    // Verificar si ya existe un tipo de fruta con el mismo nombre
    const existingTipoFruta = await TipoFruta.findOne({ where: { nombre } });
    if (existingTipoFruta) {
      return res.status(400).json({ error: 'Ya existe un tipo de fruta con ese nombre' });
    }
    
    const newTipoFruta = await TipoFruta.create({
      nombre,
      descripcion
    });
    
    res.status(201).json(newTipoFruta);
  } catch (error) {
    console.error('Error al crear tipo de fruta:', error);
    res.status(500).json({ error: 'Error al crear tipo de fruta', details: error.message });
  }
};

// Actualizar un tipo de fruta existente
exports.updateTipoFruta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    // Si se cambia el nombre, verificar que no exista otro tipo de fruta con ese nombre
    if (nombre && nombre !== tipoFruta.nombre) {
      const existingTipoFruta = await TipoFruta.findOne({ where: { nombre } });
      if (existingTipoFruta) {
        return res.status(400).json({ error: 'Ya existe un tipo de fruta con ese nombre' });
      }
      tipoFruta.nombre = nombre;
    }
    
    // Actualizar descripción si se proporciona
    if (descripcion !== undefined) {
      tipoFruta.descripcion = descripcion;
    }
    
    await tipoFruta.save();
    
    res.json(tipoFruta);
  } catch (error) {
    console.error('Error al actualizar tipo de fruta:', error);
    res.status(500).json({ error: 'Error al actualizar tipo de fruta', details: error.message });
  }
};

// Eliminar un tipo de fruta
exports.deleteTipoFruta = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoFruta = await TipoFruta.findByPk(id);
    
    if (!tipoFruta) {
      return res.status(404).json({ error: 'Tipo de fruta no encontrado' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const pedidosCount = await tipoFruta.countPedidos();
    const ingresosCount = await tipoFruta.countIngresos();
    
    if (pedidosCount > 0 || ingresosCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar este tipo de fruta porque está siendo utilizado',
        details: `Tiene ${pedidosCount} pedidos y ${ingresosCount} ingresos asociados`
      });
    }
    
    await tipoFruta.destroy();
    
    res.json({ message: 'Tipo de fruta eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de fruta:', error);
    res.status(500).json({ error: 'Error al eliminar tipo de fruta', details: error.message });
  }
};