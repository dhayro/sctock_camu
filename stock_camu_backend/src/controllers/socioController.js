const { Socio } = require('../models');

// Obtener todos los socios
exports.getAllSocios = async (req, res) => {
  try {
    const socios = await Socio.findAll();
    res.json(socios);
  } catch (error) {
    console.error('Error al obtener socios:', error);
    res.status(500).json({ error: 'Error al obtener socios', details: error.message });
  }
};

// Obtener un socio por ID
exports.getSocioById = async (req, res) => {
  try {
    const { id } = req.params;
    const socio = await Socio.findByPk(id);
    
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }
    
    res.json(socio);
  } catch (error) {
    console.error('Error al obtener socio:', error);
    res.status(500).json({ error: 'Error al obtener socio', details: error.message });
  }
};

// Crear un nuevo socio
exports.createSocio = async (req, res) => {
  try {
    const { 
      codigo, 
      dni, 
      apellidos, 
      nombres, 
      caserio, 
      certificado, 
      direccion, 
      telefono, 
      email 
    } = req.body;
    
    // Validaciones básicas
    if (!codigo || !dni || !apellidos || !nombres) {
      return res.status(400).json({ error: 'Código, DNI, apellidos y nombres son obligatorios' });
    }
    
    const newSocio = await Socio.create({
      codigo,
      dni,
      apellidos,
      nombres,
      caserio,
      certificado: certificado || false,
      direccion,
      telefono,
      email,
      estado: true
    });
    
    res.status(201).json(newSocio);
  } catch (error) {
    console.error('Error al crear socio:', error);
    res.status(500).json({ error: 'Error al crear socio', details: error.message });
  }
};

// Actualizar un socio existente
exports.updateSocio = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      codigo, 
      dni, 
      apellidos, 
      nombres, 
      caserio, 
      certificado, 
      direccion, 
      telefono, 
      email,
      estado 
    } = req.body;
    
    const socio = await Socio.findByPk(id);
    
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }
    
    // Actualizar campos si se proporcionan
    if (codigo) socio.codigo = codigo;
    if (dni) socio.dni = dni;
    if (apellidos) socio.apellidos = apellidos;
    if (nombres) socio.nombres = nombres;
    if (caserio !== undefined) socio.caserio = caserio;
    if (certificado !== undefined) socio.certificado = certificado;
    if (direccion !== undefined) socio.direccion = direccion;
    if (telefono !== undefined) socio.telefono = telefono;
    if (email !== undefined) socio.email = email;
    if (estado !== undefined) socio.estado = estado;
    
    await socio.save();
    
    res.json(socio);
  } catch (error) {
    console.error('Error al actualizar socio:', error);
    res.status(500).json({ error: 'Error al actualizar socio', details: error.message });
  }
};

// Eliminar un socio
exports.deleteSocio = async (req, res) => {
  try {
    const { id } = req.params;
    const socio = await Socio.findByPk(id);
    
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }
    
    await socio.destroy();
    
    res.json({ message: 'Socio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar socio:', error);
    res.status(500).json({ error: 'Error al eliminar socio', details: error.message });
  }
};