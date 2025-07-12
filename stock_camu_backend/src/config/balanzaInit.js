const BalanzaService = require('../services/balanzaService');

// Crear una instancia del servicio de balanza
const balanzaService = new BalanzaService({
  // Configuración por defecto
  baudRate: 9600,
  // No activar automáticamente el modo simulado en caso de error
  fallbackToMock: false,
  // Tiempo de espera para la conexión en milisegundos
  connectionTimeout: 5000
});

// Inicializar el servicio (si es necesario)
const initBalanzaService = (app) => {
  // Registrar el servicio en la aplicación para que esté disponible en todos los controladores
  app.set('balanzaService', balanzaService);
  
  // Intentar conectar automáticamente si hay configuración en variables de entorno
  if (process.env.BALANZA_AUTOCONNECT === 'true') {
    balanzaService.connect()
      .then(() => console.log('Balanza conectada automáticamente'))
      .catch(err => console.error('Error al conectar automáticamente la balanza:', err));
  }
  
  // Configurar manejadores de eventos para registrar actividad
  balanzaService.on('connected', (info) => {
    console.log(`[BALANZA] Conectada: ${JSON.stringify(info)}`);
  });
  
  balanzaService.on('disconnected', () => {
    console.log('[BALANZA] Desconectada');
  });
  
  balanzaService.on('error', (err) => {
    console.error('[BALANZA] Error:', err);
  });
  
  balanzaService.on('weight', (weight) => {
    console.log(`[BALANZA] Peso: ${weight}`);
  });
};

module.exports = {
  balanzaService,
  initBalanzaService
};