const { Parcela, Socio, Ingreso, DetalleOrdenCompra, OrdenCompra, Producto, TipoFruta, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

// Helper function to capitalize the first letter of each word
const capitalize = (str) => {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

// Helper function to convert the entire string to uppercase
const toUpperCase = (str) => {
  return str.trim().toUpperCase();
};

// Obtener todos los socios con paginación y filtros
exports.getAllSocios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {};
    if (req.query.search) {
      filters[Op.or] = [
        { nombres: { [Op.like]: `%${req.query.search}%` } },
        { apellidos: { [Op.like]: `%${req.query.search}%` } },
        { codigo: { [Op.like]: `%${req.query.search}%` } },
        { dni: { [Op.like]: `%${req.query.search}%` } },
        { caserio: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    if (req.query.codigo) {
      filters.codigo = { [Op.like]: `%${req.query.codigo}%` };
    }
    if (req.query.dni) {
      filters.dni = { [Op.like]: `%${req.query.dni}%` };
    }
    if (req.query.nombres) {
      filters.nombres = { [Op.like]: `%${req.query.nombres}%` };
    }
    if (req.query.apellidos) {
      filters.apellidos = { [Op.like]: `%${req.query.apellidos}%` };
    }
    if (req.query.caserio) {
      filters.caserio = { [Op.like]: `%${req.query.caserio}%` };
    }
    if (req.query.certificado !== undefined && req.query.certificado !== '') {
      filters.certificado = req.query.certificado === 'true';
    }

    const { count, rows } = await Socio.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [['nombres', 'ASC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      socios: rows
    });
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
    let { 
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
    if (!codigo || !apellidos || !nombres) {
      return res.status(400).json({ error: 'Código, apellidos y nombres son obligatorios' });
    }

    // Convert fields to uppercase
    codigo = toUpperCase(codigo);
    apellidos = toUpperCase(apellidos);
    nombres = toUpperCase(nombres);
    if (caserio) caserio = toUpperCase(caserio);

    // Set dni to null if it's empty
    dni = dni ? dni : null;

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
    let { 
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
    
    // Convert fields to uppercase if they are provided
    if (codigo) socio.codigo = toUpperCase(codigo);
    if (dni !== undefined) socio.dni = dni ? dni : null;
    if (apellidos) socio.apellidos = toUpperCase(apellidos);
    if (nombres) socio.nombres = toUpperCase(nombres);
    if (caserio !== undefined) socio.caserio = toUpperCase(caserio);
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

exports.getSociosContribucionPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin' });
    }

    // Convertir fechas a UTC
    const fechaInicioUTC = moment.tz(fechaInicio, 'YYYY-MM-DD', 'America/Lima').startOf('day').utc().toDate();
    const fechaFinUTC = moment.tz(fechaFin, 'YYYY-MM-DD', 'America/Lima').endOf('day').utc().toDate();

    // Usar findAll con joins en lugar de una consulta SQL directa
    const ingresos = await Ingreso.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicioUTC, fechaFinUTC]
        },
        estado: true
      },
      include: [
        {
          model: Parcela,
          as: 'parcela',
          required: true,
          include: [
            {
              model: Socio,
              as: 'socio',
              required: true,
              attributes: ['id', 'codigo', 'nombres', 'apellidos', 'certificado']
            }
          ]
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              attributes: ['id', 'codigo_lote', 'numero_orden', 'tipo_lote']
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
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Organizar los resultados por socio
    const sociosMap = new Map();
    
    ingresos.forEach(ingreso => {
      if (!ingreso.parcela || !ingreso.parcela.socio) return;
      
      const socio = ingreso.parcela.socio;
      const socioId = socio.id;
      const parcela = ingreso.parcela;
      
      if (!sociosMap.has(socioId)) {
        // Crear nuevo registro de socio
        sociosMap.set(socioId, {
          id: socioId,
          codigo: socio.codigo,
          nombres: socio.nombres,
          apellidos: socio.apellidos,
          certificado: socio.certificado === 1 || socio.certificado === true,
          total_kg: 0,
          parcelas: new Map(),
          ingresos: []
        });
      }
      
      const socioData = sociosMap.get(socioId);
      const pesoNeto = parseFloat(ingreso.peso_neto) || 0;
      
      // Sumar al total del socio
      socioData.total_kg += pesoNeto;
      
      // Agregar o actualizar información de la parcela
      if (!socioData.parcelas.has(parcela.id)) {
        socioData.parcelas.set(parcela.id, {
          id: parcela.id,
          codigo: parcela.codigo,
          hectarias: parcela.hectarias,
          volumen: parcela.volumen,
          periodo: parcela.periodo,
          tipo_lote: parcela.tipo_lote,
          total_kg: 0,
          total_ingresos: 0
        });
      }
      
      const parcelaData = socioData.parcelas.get(parcela.id);
      parcelaData.total_kg += pesoNeto;
      parcelaData.total_ingresos += 1;
      
      // Agregar ingreso resumido
      socioData.ingresos.push({
        id: ingreso.id,
        fecha: ingreso.fecha,
        numero_ingreso: ingreso.numero_ingreso,
        parcela_id: parcela.id,
        parcela_codigo: parcela.codigo,
        
        // Campos de peso y medidas
        peso_bruto: ingreso.peso_bruto || 0,
        peso_total_jabas: ingreso.peso_total_jabas || 0,
        num_jabas: ingreso.num_jabas || 0,
        peso_neto: ingreso.peso_neto || 0,
        
        // Campos de descuentos
        dscto_merma: ingreso.dscto_merma || 0,
        aplicarPrecioJaba: ingreso.aplicarPrecioJaba || false,
        
        // Campos financieros
        precio_venta_kg: ingreso.precio_venta_kg || 0,
        precio_jaba: ingreso.precio_jaba || 0,
        impuesto: ingreso.impuesto || 0,
        pago_transporte: ingreso.pago_transporte || 0,
        monto_transporte: ingreso.monto_transporte || 0,
        ingreso_cooperativa: ingreso.ingreso_cooperativa || 0,
        pago_socio: ingreso.pago_socio || 0,
        subtotal: ingreso.subtotal || 0,
        
        detalle_orden: ingreso.detalle_orden ? {
          producto: ingreso.detalle_orden.producto?.nombre,
          tipo_fruta: ingreso.detalle_orden.tipo_fruta?.nombre,
          precio: ingreso.detalle_orden.precio || 0,
          orden_compra: {
            codigo_lote: ingreso.detalle_orden.orden_compra?.codigo_lote,
            tipo_lote: ingreso.detalle_orden.orden_compra?.tipo_lote
          }
        } : null
      });
    });
    
    // Convertir el mapa a un array y las parcelas de mapa a array
    const resultado = Array.from(sociosMap.values()).map(socio => {
      return {
        ...socio,
        parcelas: Array.from(socio.parcelas.values())
      };
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener contribuciones de socios:', error);
    res.status(500).json({ error: 'Error al obtener contribuciones de socios', details: error.message });
  }
};

// Obtener contribuciones de un socio específico por fecha
exports.getSocioContribucionPorFecha = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, socioId } = req.query;

    if (!fechaInicio || !fechaFin || !socioId) {
      return res.status(400).json({ error: 'Se requieren fechas de inicio y fin, y el ID del socio' });
    }

    // Convertir fechas a UTC
    const fechaInicioUTC = moment.tz(fechaInicio, 'YYYY-MM-DD', 'America/Lima').startOf('day').utc().toDate();
    const fechaFinUTC = moment.tz(fechaFin, 'YYYY-MM-DD', 'America/Lima').endOf('day').utc().toDate();

    // Buscar primero el socio para asegurarnos que existe
    const socio = await Socio.findByPk(socioId);
    
    if (!socio) {
      return res.status(404).json({ error: 'Socio no encontrado' });
    }

    // Consultar los ingresos del socio específico en el rango de fechas
    const ingresos = await Ingreso.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicioUTC, fechaFinUTC]
        },
        estado: true
      },
      include: [
        {
          model: Parcela,
          as: 'parcela',
          required: true,
          where: {
            socio_id: socioId
          },
          include: [
            {
              model: Socio,
              as: 'socio',
              required: true,
              attributes: ['id', 'codigo', 'nombres', 'apellidos', 'certificado']
            }
          ]
        },
        {
          model: DetalleOrdenCompra,
          as: 'detalle_orden',
          include: [
            {
              model: OrdenCompra,
              as: 'orden_compra',
              attributes: ['id', 'codigo_lote', 'numero_orden', 'tipo_lote']
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
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Crear la estructura de datos similar a getSociosContribucionPorFecha
    const socioData = {
      id: socio.id,
      codigo: socio.codigo,
      nombres: socio.nombres,
      apellidos: socio.apellidos,
      certificado: socio.certificado === 1 || socio.certificado === true,
      total_kg: 0,
      parcelas: new Map(),
      ingresos: []
    };

    // Procesar los ingresos
    ingresos.forEach(ingreso => {
      if (!ingreso.parcela) return;
      
      const parcela = ingreso.parcela;
      const pesoNeto = parseFloat(ingreso.peso_neto) || 0;
      
      // Sumar al total del socio
      socioData.total_kg += pesoNeto;
      
      // Agregar o actualizar información de la parcela
      if (!socioData.parcelas.has(parcela.id)) {
        socioData.parcelas.set(parcela.id, {
          id: parcela.id,
          codigo: parcela.codigo,
          hectarias: parcela.hectarias,
          volumen: parcela.volumen,
          periodo: parcela.periodo,
          tipo_lote: parcela.tipo_lote,
          total_kg: 0,
          total_ingresos: 0
        });
      }
      
      const parcelaData = socioData.parcelas.get(parcela.id);
      parcelaData.total_kg += pesoNeto;
      parcelaData.total_ingresos += 1;
      
      // Agregar ingreso resumido
      socioData.ingresos.push({
        id: ingreso.id,
        fecha: ingreso.fecha,
        numero_ingreso: ingreso.numero_ingreso,
        parcela_id: parcela.id,
        parcela_codigo: parcela.codigo,
        
        // Campos de peso y medidas
        peso_bruto: ingreso.peso_bruto || 0,
        peso_total_jabas: ingreso.peso_total_jabas || 0,
        num_jabas: ingreso.num_jabas || 0,
        peso_neto: ingreso.peso_neto || 0,
        
        // Campos de descuentos
        dscto_merma: ingreso.dscto_merma || 0,
        aplicarPrecioJaba: ingreso.aplicarPrecioJaba || false,
        
        // Campos financieros
        precio_venta_kg: ingreso.precio_venta_kg || 0,
        precio_jaba: ingreso.precio_jaba || 0,
        impuesto: ingreso.impuesto || 0,
        pago_transporte: ingreso.pago_transporte || 0,
        monto_transporte: ingreso.monto_transporte || 0,
        ingreso_cooperativa: ingreso.ingreso_cooperativa || 0,
        pago_socio: ingreso.pago_socio || 0,
        subtotal: ingreso.subtotal || 0,
        
        detalle_orden: ingreso.detalle_orden ? {
          producto: ingreso.detalle_orden.producto?.nombre,
          tipo_fruta: ingreso.detalle_orden.tipo_fruta?.nombre,
          precio: ingreso.detalle_orden.precio || 0,
          orden_compra: {
            codigo_lote: ingreso.detalle_orden.orden_compra?.codigo_lote,
            tipo_lote: ingreso.detalle_orden.orden_compra?.tipo_lote
          }
        } : null
      });
    });

    // Convertir las parcelas de Map a Array
    const resultado = {
      ...socioData,
      parcelas: Array.from(socioData.parcelas.values())
    };
    
    res.json([resultado]); // Devolver como array para mantener consistencia con getSociosContribucionPorFecha
  } catch (error) {
    console.error('Error al obtener contribuciones del socio:', error);
    res.status(500).json({ error: 'Error al obtener contribuciones del socio', details: error.message });
  }
};
