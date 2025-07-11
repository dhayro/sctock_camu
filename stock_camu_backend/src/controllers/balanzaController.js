const BalanzaService = require('../services/balanzaService');
const balanzaService = new BalanzaService();
const { DetallePesaje } = require('../models');
const SSE = require('express-sse');

// Crear una instancia de SSE para el streaming de datos
const sse = new SSE();

// Mapa para almacenar las conexiones SSE activas
const sseConnections = new Map();

// Configurar los listeners de eventos de la balanza
balanzaService.on('rawData', (data) => {
    // console.log('Evento rawData recibido:', JSON.stringify(data, null, 2));
    
    // Enviar a todas las conexiones SSE activas
    for (const [id, res] of sseConnections.entries()) {
        try {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (error) {
            console.error(`Error al enviar datos a la conexión SSE ${id}:`, error);
            sseConnections.delete(id);
        }
    }
});

balanzaService.on('weightData', (data) => {
    console.log('Evento weightData recibido:', JSON.stringify(data, null, 2));
    
    // Enviar a todas las conexiones SSE activas
    for (const [id, res] of sseConnections.entries()) {
        try {
            res.write(`data: ${JSON.stringify({
                type: 'weightData',
                timestamp: new Date().toISOString(),
                weight: data,
                stable: true // Determinar si es estable según tu lógica
            })}\n\n`);
        } catch (error) {
            console.error(`Error al enviar datos de peso a la conexión SSE ${id}:`, error);
            sseConnections.delete(id);
        }
    }
});

balanzaService.on('messageProcessed', (data) => {
    // console.log('Evento messageProcessed recibido:', JSON.stringify(data, null, 2));
    
    // Enviar a todas las conexiones SSE activas
    for (const [id, res] of sseConnections.entries()) {
        try {
            res.write(`data: ${JSON.stringify({
                type: 'messageProcessed',
                ...data
            })}\n\n`);
        } catch (error) {
            console.error(`Error al enviar mensaje procesado a la conexión SSE ${id}:`, error);
            sseConnections.delete(id);
        }
    }
});

// Controller methods
const balanzaController = {
  // Obtener puertos disponibles
  getPuertosDisponibles: async (req, res) => {
    try {
      console.log('Obteniendo puertos disponibles...');
      const ports = await balanzaService.getPorts();
      console.log('Puertos disponibles:', ports);
      res.json(ports);
    } catch (error) {
      console.error('Error al obtener puertos:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Conectar a la balanza
  connect: async (req, res) => {
    try {
      const { port, baudRate } = req.body;
      
      if (!port) {
        return res.status(400).json({ error: 'Se requiere especificar un puerto' });
      }
      
      console.log(`Intentando conectar a puerto ${port} con baudRate ${baudRate}...`);
      const result = await balanzaService.connect({ port, baudRate: parseInt(baudRate) || 9600 });
      console.log('Resultado de la conexión:', result);
      
      res.json(result);
    } catch (error) {
      console.error('Error al conectar a la balanza:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Desconectar de la balanza
  disconnect: async (req, res) => {
    try {
      console.log('Desconectando de la balanza...');
      const result = await balanzaService.disconnect();
      console.log('Resultado de la desconexión:', result);
      
      res.json(result);
    } catch (error) {
      console.error('Error al desconectar de la balanza:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estado de la conexión
  getStatus: (req, res) => {
    try {
      const status = balanzaService.getStatus();
      console.log('Estado actual de la balanza:', status);
      res.json(status);
    } catch (error) {
      console.error('Error al obtener el estado de la balanza:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Guardar configuración
  configurarBalanza: async (req, res) => {
    try {
      const { port, baudRate } = req.body;
      
      if (!port || !baudRate) {
        return res.status(400).json({ error: 'Se requieren puerto y baudRate' });
      }
      
      console.log(`Guardando configuración: puerto=${port}, baudRate=${baudRate}`);
      
      // Aquí podrías guardar la configuración en una base de datos o archivo
      
      res.json({ 
          success: true, 
          message: 'Configuración guardada correctamente',
          config: { port, baudRate }
      });
    } catch (error) {
      console.error('Error al configurar la balanza:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Guardar peso en la base de datos
  saveWeight: async (req, res) => {
    try {
      const { ingresoId, observacion } = req.body;
      const usuarioId = req.usuario.id; // Asumiendo que el middleware de autenticación añade el usuario a req

      if (!ingresoId) {
        return res.status(400).json({ error: 'Se requiere el ID del ingreso' });
      }

      const status = balanzaService.getStatus();

      if (!status.connected) {
        return res.status(400).json({ error: 'La balanza no está conectada' });
      }

      const weightData = balanzaService.getWeight();

      if (!weightData.isStable) {
        return res.status(400).json({ error: 'El peso no es estable' });
      }

      const result = await balanzaService.guardarPeso(ingresoId, weightData.stableWeight, usuarioId, observacion);
      res.json(result);
    } catch (error) {
      console.error('Error al guardar peso:', error);
      res.status(500).json({ error: 'Error al guardar el peso', details: error.message });
    }
  },

  // Endpoint para SSE (Server-Sent Events)
  iniciarPesajeRealtime: (req, res) => {
    try {
      // Configurar cabeceras para SSE
      res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
      });
      
      // Enviar un evento inicial para confirmar la conexión
      res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
      
      // Generar un ID único para esta conexión
      const connectionId = Date.now().toString();
      
      // Almacenar la conexión
      sseConnections.set(connectionId, res);
      
      console.log(`Nueva conexión SSE establecida: ${connectionId}`);
      console.log(`Total de conexiones SSE activas: ${sseConnections.size}`);
      
      // Manejar cierre de conexión
      req.on('close', () => {
          console.log(`Conexión SSE cerrada: ${connectionId}`);
          sseConnections.delete(connectionId);
          console.log(`Total de conexiones SSE activas: ${sseConnections.size}`);
      });
    } catch (error) {
      console.error('Error al establecer conexión SSE:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener el peso actual
  getWeight: (req, res) => {
    try {
      const status = balanzaService.getStatus();

      if (!status.connected) {
        return res.status(400).json({ error: 'La balanza no está conectada' });
      }

      const weightData = balanzaService.getWeight();
      res.json(weightData);
    } catch (error) {
      console.error('Error al obtener el peso:', error);
      res.status(500).json({ error: 'Error al obtener el peso de la balanza', details: error.message });
    }
  },

  // Obtener pesajes por ingreso
  getPesajesByIngreso: async (req, res) => {
    try {
      const { ingresoId } = req.params;

      const pesajes = await DetallePesaje.findAll({
        where: { ingreso_id: ingresoId },
        order: [['fecha_pesaje', 'DESC']]
      });

      res.json(pesajes);
    } catch (error) {
      console.error('Error al obtener pesajes:', error);
      res.status(500).json({ error: 'Error al obtener los pesajes', details: error.message });
    }
  },

  // Eliminar un pesaje
  deletePesaje: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.usuario.id; // Asumiendo que el middleware de autenticación añade el usuario a req

      const pesaje = await DetallePesaje.findByPk(id);

      if (!pesaje) {
        return res.status(404).json({ error: 'Pesaje no encontrado' });
      }

      await pesaje.destroy();

      res.json({ message: 'Pesaje eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar pesaje:', error);
      res.status(500).json({ error: 'Error al eliminar el pesaje', details: error.message });
    }
  },

  // Actualizar observación de un pesaje
  updateObservacionPesaje: async (req, res) => {
    try {
      const { id } = req.params;
      const { observacion } = req.body;
      const userId = req.usuario.id; // Asumiendo que el middleware de autenticación añade el usuario a req

      if (!observacion && observacion !== '') {
        return res.status(400).json({ error: 'Se requiere la observación' });
      }

      const pesaje = await DetallePesaje.findByPk(id);

      if (!pesaje) {
        return res.status(404).json({ error: 'Pesaje no encontrado' });
      }

      pesaje.observacion = observacion;
      await pesaje.save();

      res.json(pesaje);
    } catch (error) {
      console.error('Error al actualizar observación:', error);
      res.status(500).json({ error: 'Error al actualizar la observación', details: error.message });
    }
  },

  // Activar/desactivar modo simulado
  toggleMockMode: (req, res) => {
    try {
      const { enabled } = req.body;

      if (enabled === undefined) {
        return res.status(400).json({ error: 'Se requiere especificar si el modo simulado está habilitado o no' });
      }

      balanzaService.configurar({ mockMode: enabled });

      res.json({ message: `Modo simulado ${enabled ? 'activado' : 'desactivado'} exitosamente` });
    } catch (error) {
      console.error('Error al cambiar modo simulado:', error);
      res.status(500).json({ error: 'Error al cambiar el modo simulado', details: error.message });
    }
  },

  // Obtener datos crudos
  getRawData: async (req, res) => {
    try {
      if (!balanzaService) {
        console.error('balanzaService is not initialized');
        return res.status(500).json({
          error: 'Servicio de balanza no inicializado',
          lastRawData: null,
          rawDataHistory: []
        });
      }

      let lastRawData = null;
      // if (typeof balanzaService.getLastRawData === 'function') {
      //   lastRawData = balanzaService.getLastRawData();
      // } else {
      //   console.warn('getLastRawData method not found in balanzaService');
      // }

      let rawDataHistory = [];
      if (typeof balanzaService.getRawDataHistory === 'function') {
        const history = balanzaService.getRawDataHistory();
        if (Array.isArray(history)) {
          rawDataHistory = history.slice(0, 50);
        } else {
          console.warn('getRawDataHistory did not return an array:', history);
        }
      }
      //  else {
      //   console.warn('getRawDataHistory method not found in balanzaService');
      // }

      return res.status(200).json({
        connected: balanzaService.isConnected,
        lastRawData: lastRawData,
        rawDataHistory: rawDataHistory
      });
    } catch (error) {
      console.error('Error al obtener los datos crudos de la balanza:', error);
      return res.status(500).json({
        error: 'Error al obtener los datos crudos de la balanza',
        details: error.message,
        lastRawData: null,
        rawDataHistory: []
      });
    }
  },

  // Método para obtener los últimos datos recibidos
  getLastData: (req, res) => {
    try {
      const balanzaService = req.app.get('balanzaService');

      if (!balanzaService) {
        return res.status(500).json({ error: 'Servicio de balanza no inicializado' });
      }

      if (!balanzaService.isConnected) {
        return res.status(400).json({ error: 'La balanza no está conectada' });
      }

      const lastData = balanzaService.rawDataHistory && balanzaService.rawDataHistory.length > 0
        ? balanzaService.rawDataHistory[balanzaService.rawDataHistory.length - 1]
        : null;

      if (!lastData) {
        return res.status(404).json({ error: 'No hay datos disponibles' });
      }

      console.log('Último dato recibido:', lastData);

      return res.status(200).json(lastData);
    } catch (error) {
      console.error('Error al obtener el último dato:', error);
      return res.status(500).json({
        error: 'Error al obtener el último dato',
        details: error.message
      });
    }
  },

  // Método para obtener el historial de datos
  getDataHistory: async (req, res) => {
    try {
      const balanzaService = req.app.get('balanzaService');
      const limit = parseInt(req.query.limit) || 20;

      if (!balanzaService) {
        return res.status(500).json({ error: 'Servicio de balanza no inicializado' });
      }

      const history = balanzaService.getDataHistory ? balanzaService.getDataHistory(limit) : [];

      console.log(`Historial de datos crudos (últimos ${limit}):`, history);

      return res.status(200).json(history);
    } catch (error) {
      console.error('Error al obtener el historial de datos:', error);
      return res.status(500).json({
        error: 'Error al obtener el historial de datos',
        details: error.message
      });
    }
  },

  // Add a new endpoint to check the balanza service status
  checkBalanzaService: (req, res) => {
    try {
      const importedService = balanzaService;
      const appService = req.app.get('balanzaService');

      res.json({
        importedServiceExists: !!importedService,
        appServiceExists: !!appService,
        importedServiceMethods: importedService ? Object.keys(importedService).filter(key => typeof importedService[key] === 'function') : [],
        appServiceMethods: appService ? Object.keys(appService).filter(key => typeof appService[key] === 'function') : [],
        importedServiceConnected: importedService ? importedService.isConnected : false,
        appServiceConnected: appService ? appService.isConnected : false,
        areServicesEqual: importedService === appService
      });
    } catch (error) {
      console.error('Error checking balanza service:', error);
      res.status(500).json({ error: 'Error checking balanza service', details: error.message });
    }
  },

  // Controlador para el monitor de balanza (página HTML)
  monitorBalanza: (req, res) => {
    res.sendFile('balanza-monitor.html', { root: './src/public' });
  }
};

module.exports = balanzaController;