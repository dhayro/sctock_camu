
const { Cliente, PedidoLote, Salida } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los clientes con paginación y filtros
exports.getAllClientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.search) {
      filters[Op.or] = [
        { razon_social: { [Op.like]: `%${req.query.search}%` } },
        { ruc: { [Op.like]: `%${req.query.search}%` } },
        { direccion: { [Op.like]: `%${req.query.search}%` } },
        { telefono: { [Op.like]: `%${req.query.search}%` } },
        { email: { [Op.like]: `%${req.query.search}%` } }
      ];
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['razon_social', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      clientes: rows
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes', details: error.message });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente', details: error.message });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    let { razon_social, ruc, direccion, telefono, email } = req.body;
    
    // Validaciones básicas
    if (!razon_social || !ruc) {
      return res.status(400).json({ error: 'Razón social y RUC son obligatorios' });
    }
    if (!/^\d{11}$/.test(ruc)) {
      return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos' });
    }

    // Convert razon_social to uppercase
    razon_social = razon_social.trim().toUpperCase();

    const newCliente = await Cliente.create({
      razon_social,
      ruc,
      direccion,
      telefono,
      email,
      estado: true
    });
    
    res.status(201).json(newCliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente', details: error.message });
  }
};

// Actualizar un cliente existente
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    let { razon_social, ruc, direccion, telefono, email, estado } = req.body;
    
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    if (razon_social !== undefined) {
      // Convert razon_social to uppercase
      cliente.razon_social = razon_social.trim().toUpperCase();
    }
    if (ruc !== undefined) {
      if (!/^\d{11}$/.test(ruc)) {
        return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos' });
      }
      cliente.ruc = ruc;
    }
    if (direccion !== undefined) cliente.direccion = direccion;
    if (telefono !== undefined) cliente.telefono = telefono;
    if (email !== undefined) cliente.email = email;
    if (estado !== undefined) cliente.estado = estado;
    
    await cliente.save();
    
    res.json(cliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente', details: error.message });
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Verificar si hay relaciones con otros modelos antes de eliminar
    const pedidosCount = await PedidoLote.count({ where: { cliente_id: id } });
    const salidasCount = await Salida.count({ where: { cliente_id: id } });
    
    if (pedidosCount > 0 || salidasCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar este cliente porque está siendo utilizado',
        details: `Tiene ${pedidosCount} pedidos y ${salidasCount} salidas asociados`
      });
    }
    
    await cliente.destroy();
    
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
  }
};

// Cambiar estado de un cliente (activar/desactivar)
exports.cambiarEstadoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (estado === undefined) {
      return res.status(400).json({ error: 'El estado es obligatorio' });
    }
    
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    cliente.estado = estado;
    await cliente.save();
    
    res.json({ 
      message: `Cliente ${estado ? 'activado' : 'desactivado'} correctamente`,
      cliente
    });
  } catch (error) {
    console.error('Error al cambiar estado del cliente:', error);
    res.status(500).json({ error: 'Error al cambiar estado del cliente', details: error.message });
  }
};

// Buscar clientes por término (razón social o RUC)
exports.searchClientes = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ error: 'El término de búsqueda es obligatorio' });
    }
    
    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { razon_social: { [Op.like]: `%${term}%` } },
          { ruc: { [Op.like]: `%${term}%` } }
        ]
      },
      order: [['razon_social', 'ASC']]
    });
    
    res.json(clientes);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes', details: error.message });
  }
};

// Función auxiliar para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}