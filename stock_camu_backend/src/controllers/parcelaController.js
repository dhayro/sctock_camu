
const { Parcela, Socio,sequelize } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las parcelas con paginación y filtros
exports.getAllParcelas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      socio_id = '',
      tipo_lote = '',
      estado = ''
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      estado: true
    };

    // Filtros
    if (search) {
      whereClause[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { '$socio.nombres$': { [Op.like]: `%${search}%` } },
        { '$socio.apellidos$': { [Op.like]: `%${search}%` } },
        sequelize.literal(`CONCAT(socio.nombres, ' ', socio.apellidos) LIKE '%${search}%'`)
      ];
    }

    if (socio_id) {
      whereClause.socio_id = socio_id;
    }

    if (tipo_lote) {
      whereClause.tipo_lote = tipo_lote;
    }

    if (estado !== '') {
      whereClause.estado = estado === 'true';
    }

    const { count, rows } = await Parcela.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      parcelas: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener parcelas:', error);
    res.status(500).json({ error: 'Error al obtener parcelas', details: error.message });
  }
};

// Obtener parcela por ID
exports.getParcelaById = async (req, res) => {
  try {
    const { id } = req.params;
    const parcela = await Parcela.findByPk(id, {
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ]
    });
    
    if (!parcela) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }
    
    res.json(parcela);
  } catch (error) {
    console.error('Error al obtener parcela:', error);
    res.status(500).json({ error: 'Error al obtener parcela', details: error.message });
  }
};

// Generar código automático para la parcela
const generarCodigoParcela = async (socio_id, periodo) => {
  try {
    // Obtener el código del socio
    const socio = await Socio.findByPk(socio_id);
    if (!socio) {
      throw new Error('Socio no encontrado');
    }

    // Buscar parcelas existentes del socio en el mismo período
    const parcelasExistentes = await Parcela.findAll({
      where: {
        socio_id,
        periodo
      },
      order: [['codigo', 'DESC']]
    });

    // Generar el siguiente número secuencial
    let numeroSecuencial = 1;
    if (parcelasExistentes.length > 0) {
      // Extraer el número secuencial del último código
      const ultimoCodigo = parcelasExistentes[0].codigo;
      const partes = ultimoCodigo.split('-');
      if (partes.length >= 2) {
        const ultimoNumero = parseInt(partes[partes.length - 1]);
        numeroSecuencial = ultimoNumero + 1;
      }
    }

    // Formatear el número secuencial con ceros a la izquierda
    const numeroFormateado = numeroSecuencial.toString().padStart(2, '0');
    
    // Generar el código final: CODIGO_SOCIO-NUMERO_SECUENCIAL
    return `${socio.codigo}-${numeroFormateado}`;
  } catch (error) {
    throw error;
  }
};

// Crear nueva parcela
exports.createParcela = async (req, res) => {
  try {
    const {
      hectarias,
      volumen,
      periodo,
      tipo_lote,
      socio_id,
      fecha_inicio,
      fecha_fin,
      estado = true
    } = req.body;
    
    // Validaciones básicas
    if (!hectarias || hectarias <= 0) {
      return res.status(400).json({ error: 'Las hectáreas son obligatorias y deben ser mayor a 0' });
    }
    
    if (!volumen || volumen <= 0) {
      return res.status(400).json({ error: 'El volumen es obligatorio y debe ser mayor a 0' });
    }
    
    if (!periodo) {
      return res.status(400).json({ error: 'El período es obligatorio' });
    }
    
    if (!socio_id) {
      return res.status(400).json({ error: 'El socio es obligatorio' });
    }
    
    if (!fecha_inicio) {
      return res.status(400).json({ error: 'La fecha de inicio es obligatoria' });
    }

    // Verificar que el socio existe
    const socio = await Socio.findByPk(socio_id);
    if (!socio) {
      return res.status(400).json({ error: 'El socio especificado no existe' });
    }

    // Generar código automático
    const codigo = await generarCodigoParcela(socio_id, periodo);
    
    const newParcela = await Parcela.create({
      codigo,
      hectarias,
      volumen,
      periodo,
      tipo_lote,
      socio_id,
      fecha_inicio,
      fecha_fin,
      estado
    });

    // Obtener la parcela creada con el socio incluido
    const parcelaCreada = await Parcela.findByPk(newParcela.id, {
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ]
    });
    
    res.status(201).json(parcelaCreada);
  } catch (error) {
  console.error('Error al crear/actualizar parcela:', error);
  if (error.name === 'SequelizeUniqueConstraintError') {
    // Verificar si el error es por el constraint único compuesto
    if (error.fields && (error.fields.codigo || error.fields.periodo)) {
      res.status(400).json({ 
        error: 'Ya existe una parcela con este código para el período especificado' 
      });
    } else {
      res.status(400).json({ error: 'Ya existe una parcela con estos datos' });
    }
  } else {
    res.status(500).json({ 
      error: 'Error al crear/actualizar parcela', 
      details: error.message 
    });
  }
}
};

// Actualizar parcela
exports.updateParcela = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hectarias,
      volumen,
      periodo,
      tipo_lote,
      socio_id,
      fecha_inicio,
      fecha_fin,
      estado
    } = req.body;
    
    const parcela = await Parcela.findByPk(id);
    
    if (!parcela) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }

    // Si cambia el socio o el período, regenerar código
    let nuevoCodigo = parcela.codigo;
    if ((socio_id && socio_id !== parcela.socio_id) || (periodo && periodo !== parcela.periodo)) {
      const socioIdFinal = socio_id || parcela.socio_id;
      const periodoFinal = periodo || parcela.periodo;
      
      // Verificar que el socio existe
      const socio = await Socio.findByPk(socioIdFinal);
      if (!socio) {
        return res.status(400).json({ error: 'El socio especificado no existe' });
      }
      
      nuevoCodigo = await generarCodigoParcela(socioIdFinal, periodoFinal);
    }

    if (hectarias && hectarias <= 0) {
      return res.status(400).json({ error: 'Las hectáreas deben ser mayor a 0' });
    }

    if (volumen && volumen <= 0) {
      return res.status(400).json({ error: 'El volumen debe ser mayor a 0' });
    }
    
    // Actualizar campos si se proporcionan
    parcela.codigo = nuevoCodigo;
    if (hectarias) parcela.hectarias = hectarias;
    if (volumen) parcela.volumen = volumen;
    if (periodo) parcela.periodo = periodo;
    if (tipo_lote !== undefined) parcela.tipo_lote = tipo_lote;
    if (socio_id) parcela.socio_id = socio_id;
    if (fecha_inicio) parcela.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) parcela.fecha_fin = fecha_fin;
    if (estado !== undefined) parcela.estado = estado;
    
    await parcela.save();

    // Obtener la parcela actualizada con el socio incluido
    const parcelaActualizada = await Parcela.findByPk(id, {
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ]
    });
    
    res.json(parcelaActualizada);
  } catch (error) {
  console.error('Error al crear/actualizar parcela:', error);
  if (error.name === 'SequelizeUniqueConstraintError') {
    // Verificar si el error es por el constraint único compuesto
    if (error.fields && (error.fields.codigo || error.fields.periodo)) {
      res.status(400).json({ 
        error: 'Ya existe una parcela con este código para el período especificado' 
      });
    } else {
      res.status(400).json({ error: 'Ya existe una parcela con estos datos' });
    }
  } else {
    res.status(500).json({ 
      error: 'Error al crear/actualizar parcela', 
      details: error.message 
    });
  }
}
};

// Eliminar parcela (soft delete)
exports.deleteParcela = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parcela = await Parcela.findByPk(id);
    
    if (!parcela) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }
    
    await parcela.destroy();

    
    res.json({ message: 'Parcela eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar parcela:', error);
    res.status(500).json({ error: 'Error al eliminar parcela', details: error.message });
  }
};

// Obtener parcelas por socio
exports.getParcelasBySocio = async (req, res) => {
  try {
    const { socio_id } = req.params;
    
    const parcelas = await Parcela.findAll({
      where: { 
        socio_id,
        estado: true
      },
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ],
      order: [['estado', 'DESC'],['periodo', 'DESC'], ['codigo', 'DESC']]
    });
    
    res.json(parcelas);
  } catch (error) {
    console.error('Error al obtener parcelas por socio:', error);
    res.status(500).json({ error: 'Error al obtener parcelas por socio', details: error.message });
  }
};

// Obtener parcelas activas
exports.getParcelasActivas = async (req, res) => {
  try {
    const parcelas = await Parcela.findAll({
      where: { estado: true },
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ],
      order: [['codigo', 'ASC']]
    });
    
    res.json(parcelas);
  } catch (error) {
    console.error('Error al obtener parcelas activas:', error);
    res.status(500).json({ error: 'Error al obtener parcelas activas', details: error.message });
  }
};

// Función para verificar fechas y actualizar estado de parcelas
exports.verificarFechasParcelas = async () => {
  try {
    const ahora = new Date();
    
    // Encontrar parcelas con fecha_fin pasada y estado activo
    const parcelasVencidas = await Parcela.findAll({
      where: {
        fecha_fin: { [Op.lt]: ahora },
        estado: true
      }
    });
    
    for (const parcela of parcelasVencidas) {
      // Clonar la parcela activa
      const nuevaParcela = await Parcela.create({
        ...parcela.dataValues,
        id: null, // Para que se genere un nuevo ID
        estado: true, // Mantener como activa
        fecha_fin: null // Limpiar la fecha fin
      });
      
      // Desactivar la parcela original
      parcela.estado = false;
      await parcela.save();
    }
    
    return { mensaje: `Procesadas ${parcelasVencidas.length} parcelas vencidas` };
  } catch (error) {
    console.error('Error al verificar fechas de parcelas:', error);
    throw error;
  }
};

// Clonar parcelas activas para un nuevo período
exports.clonarParcelasActivas = async (req, res) => {
  try {
    const { nuevo_periodo, fecha_inicio, fecha_fin } = req.body;
    
    if (!nuevo_periodo) {
      return res.status(400).json({ error: 'El nuevo período es obligatorio' });
    }
    
    // Verificar que no existan parcelas para el nuevo período
    const parcelasExistentes = await Parcela.findAll({
      where: { periodo: nuevo_periodo }
    });
    
    if (parcelasExistentes.length > 0) {
      return res.status(400).json({ 
        error: `Ya existen ${parcelasExistentes.length} parcelas para el período ${nuevo_periodo}` 
      });
    }
    
    // Obtener todas las parcelas activas
    const parcelasActivas = await Parcela.findAll({
      where: { estado: true },
      include: [
        {
          model: Socio,
          as: 'socio',
          attributes: ['id', 'codigo', 'nombres', 'apellidos']
        }
      ]
    });
    
    if (parcelasActivas.length === 0) {
      return res.status(400).json({ error: 'No hay parcelas activas para clonar' });
    }
    
    const parcelasClonadas = [];
    
    // Clonar cada parcela activa
    for (const parcela of parcelasActivas) {
      // Generar nuevo código para el nuevo período
      const nuevoCodigo = await generarCodigoParcela(parcela.socio_id, nuevo_periodo);
      
      const parcelaClonada = await Parcela.create({
        codigo: nuevoCodigo,
        hectarias: parcela.hectarias,
        volumen: parcela.volumen,
        periodo: nuevo_periodo,
        tipo_lote: parcela.tipo_lote,
        socio_id: parcela.socio_id,
        fecha_inicio: fecha_inicio || new Date(`${nuevo_periodo}-01-01`),
        fecha_fin: fecha_fin || null,
        estado: true
      });
      
      // Obtener la parcela clonada con el socio incluido
      const parcelaConSocio = await Parcela.findByPk(parcelaClonada.id, {
        include: [
          {
            model: Socio,
            as: 'socio',
            attributes: ['id', 'codigo', 'nombres', 'apellidos']
          }
        ]
      });
      
      parcelasClonadas.push(parcelaConSocio);
    }
    
    res.status(201).json({
      message: 'Parcelas clonadas exitosamente',
      parcelas_clonadas: parcelasClonadas.length,
      parcelas: parcelasClonadas
    });
    
  } catch (error) {
    console.error('Error al clonar parcelas activas:', error);
    res.status(500).json({ error: 'Error al clonar parcelas activas', details: error.message });
  }
};

// Verificar y desactivar parcelas vencidas
exports.verificarParcelasVencidas = async (req, res) => {
  try {
    const ahora = new Date();
    
    // Encontrar parcelas con fecha_fin pasada y estado activo
    const parcelasVencidas = await Parcela.findAll({
      where: {
        fecha_fin: { [Op.lt]: ahora },
        estado: true
      }
    });
    
    let parcelasDesactivadas = 0;
    
    for (const parcela of parcelasVencidas) {
      // Desactivar la parcela vencida
      parcela.estado = false;
      await parcela.save();
      parcelasDesactivadas++;
    }
    
    res.json({
      message: 'Verificación de parcelas vencidas completada',
      parcelas_desactivadas: parcelasDesactivadas
    });
    
  } catch (error) {
    console.error('Error al verificar parcelas vencidas:', error);
    res.status(500).json({ error: 'Error al verificar parcelas vencidas', details: error.message });
  }
};
