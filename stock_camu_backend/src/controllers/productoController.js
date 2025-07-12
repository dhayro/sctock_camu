const { Producto, UnidadMedida } = require('../models');

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: UnidadMedida, as: 'unidad_medida', attributes: ['id', 'nombre', 'abreviatura'] }
      ]
    });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos', details: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida', attributes: ['id', 'nombre', 'abreviatura'] }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto', details: error.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, unidad_medida_id, descripcion } = req.body;
    
    // Validaciones básicas
    if (!nombre || !unidad_medida_id) {
      return res.status(400).json({ error: 'El nombre y la unidad de medida son obligatorios' });
    }
    
    // Verificar si ya existe un producto con el mismo nombre
    const existingProducto = await Producto.findOne({ where: { nombre } });
    if (existingProducto) {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
    }
    
    // Verificar si la unidad de medida existe
    const unidadMedida = await UnidadMedida.findByPk(unidad_medida_id);
    if (!unidadMedida) {
      return res.status(400).json({ error: 'La unidad de medida especificada no existe' });
    }
    
    const newProducto = await Producto.create({
      nombre,
      unidad_medida_id,
      descripcion,
      estado: true
    });
    
    // Obtener el producto con sus relaciones
    const productoConRelaciones = await Producto.findByPk(newProducto.id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida', attributes: ['id', 'nombre', 'abreviatura'] }
      ]
    });
    
    res.status(201).json(productoConRelaciones);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto', details: error.message });
  }
};

// Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, unidad_medida_id, descripcion, estado } = req.body;
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Si se cambia el nombre, verificar que no exista otro producto con ese nombre
    if (nombre && nombre !== producto.nombre) {
      const existingProducto = await Producto.findOne({ where: { nombre } });
      if (existingProducto) {
        return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
      }
      producto.nombre = nombre;
    }
    
    // Si se cambia la unidad de medida, verificar que exista
    if (unidad_medida_id && unidad_medida_id !== producto.unidad_medida_id) {
      const unidadMedida = await UnidadMedida.findByPk(unidad_medida_id);
      if (!unidadMedida) {
        return res.status(400).json({ error: 'La unidad de medida especificada no existe' });
      }
      producto.unidad_medida_id = unidad_medida_id;
    }
    
    // Actualizar otros campos si se proporcionan
    if (descripcion !== undefined) producto.descripcion = descripcion;
    if (estado !== undefined) producto.estado = estado;
    
    await producto.save();
    
    // Obtener el producto actualizado con sus relaciones
    const productoActualizado = await Producto.findByPk(id, {
      include: [
        { model: UnidadMedida, as: 'unidad_medida', attributes: ['id', 'nombre', 'abreviatura'] }
      ]
    });
    
    res.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const pedidosCount = await producto.countPedidos();
    const ingresosCount = await producto.countIngresos();
    const salidasCount = await producto.countSalidas();
    
    if (pedidosCount > 0 || ingresosCount > 0 || salidasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar este producto porque está siendo utilizado',
        details: `Tiene ${pedidosCount} pedidos, ${ingresosCount} ingresos y ${salidasCount} salidas asociados`
      });
    }
    
    await producto.destroy();
    
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto', details: error.message });
  }
};

// Cambiar estado de un producto (activar/desactivar)
exports.cambiarEstadoProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (estado === undefined) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }
    
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    producto.estado = estado;
    await producto.save();
    
    res.json({ 
      message: `Producto ${estado ? 'activado' : 'desactivado'} correctamente`,
      producto
    });
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    res.status(500).json({ error: 'Error al cambiar estado del producto', details: error.message });
  }
};