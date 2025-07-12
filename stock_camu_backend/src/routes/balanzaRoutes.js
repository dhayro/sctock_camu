const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const balanzaController = require('../controllers/balanzaController');
// Importar el servicio de balanza
const { balanzaService } = require('../config/balanzaInit');
const router = express.Router();

// Add this function to check if controller methods exist and create fallbacks
const ensureControllerMethod = (methodName) => {
  if (!balanzaController[methodName] || typeof balanzaController[methodName] !== 'function') {
    return (req, res) => {
      res.status(501).json({ 
        error: `Method ${methodName} not implemented`,
        message: "This endpoint is defined in the API but not yet implemented in the controller"
      });
    };
  }
  return balanzaController[methodName];
};

/**
 * @swagger
 * /api/balanza/puertos:
 *   get:
 *     summary: Obtiene la lista de puertos COM disponibles
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de puertos COM disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                     example: "COM4"
 *                   manufacturer:
 *                     type: string
 *                     example: "FTDI"
 *                   serialNumber:
 *                     type: string
 *                     example: "A6008isP"
 *                   pnpId:
 *                     type: string
 *                     example: "FTDIBUS\\VID_0403+PID_6001+A6008isPB\\0000"
 *                   locationId:
 *                     type: string
 *                     example: "Port_#0003.Hub_#0004"
 *                   vendorId:
 *                     type: string
 *                     example: "0403"
 *                   productId:
 *                     type: string
 *                     example: "6001"
 *       500:
 *         description: Error al obtener los puertos disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los puertos disponibles"
 *                 details:
 *                   type: string
 */
router.get('/puertos', ensureControllerMethod('getPuertosDisponibles'));

/**
 * @swagger
 * /api/balanza/connect:
 *   post:
 *     summary: Conecta la aplicación a la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - port
 *             properties:
 *               port:
 *                 type: string
 *                 description: Puerto COM al que se conectará (ej. COM4)
 *                 example: "COM4"
 *               baudRate:
 *                 type: integer
 *                 description: Velocidad de transmisión en baudios
 *                 default: 9600
 *                 example: 9600
 *               fallbackToMock:
 *                 type: boolean
 *                 description: Si debe usar modo simulado en caso de error de conexión
 *                 default: false
 *                 example: false
 *               connectionTimeout:
 *                 type: integer
 *                 description: Tiempo de espera para la conexión en milisegundos
 *                 default: 5000
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Conexión establecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conectado exitosamente a COM4"
 *                 port:
 *                   type: string
 *                   example: "COM4"
 *                 connected:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Datos inválidos o error de conexión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Puerto no especificado o inválido"
 *       500:
 *         description: Error del servidor al intentar conectar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al conectar con la balanza"
 *                 details:
 *                   type: string
 *                   example: "Error: Port COM4 is not available"
 */
router.post('/connect', ensureControllerMethod('connect'));

/**
 * @swagger
 * /api/balanza/disconnect:
 *   post:
 *     summary: Desconecta la aplicación de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Desconexión exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Desconectado exitosamente"
 *                 connected:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: La balanza no estaba conectada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La balanza no está conectada"
 *       500:
 *         description: Error al desconectar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al desconectar la balanza"
 *                 details:
 *                   type: string
 */
router.post('/disconnect', ensureControllerMethod('disconnect'));

/**
 * @swagger
 * /api/balanza/status:
 *   get:
 *     summary: Obtiene el estado actual de la conexión con la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de la conexión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   example: true
 *                 port:
 *                   type: string
 *                   example: "COM4"
 *                 baudRate:
 *                   type: integer
 *                   example: 9600
 *                 mockMode:
 *                   type: boolean
 *                   example: false
 *                 lastDataReceived:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *       500:
 *         description: Error al obtener el estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el estado de la balanza"
 */
router.get('/status', ensureControllerMethod('getStatus'));

/**
 * @swagger
 * /api/balanza/weight:
 *   get:
 *     summary: Obtiene el peso actual registrado por la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Peso actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   format: float
 *                   example: 10.123
 *                 unit:
 *                   type: string
 *                   example: "kg"
 *                 isStable:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *       400:
 *         description: La balanza no está conectada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La balanza no está conectada"
 *       404:
 *         description: No hay datos de peso disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No hay datos de peso disponibles"
 *       500:
 *         description: Error al obtener el peso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el peso de la balanza"
 */
router.get('/weight', ensureControllerMethod('getWeight'));

/**
 * @swagger
 * /api/balanza/configurar:
 *   post:
 *     summary: Configura los parámetros de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baudRate:
 *                 type: integer
 *                 description: Velocidad de transmisión en baudios
 *                 example: 9600
 *               dataBits:
 *                 type: integer
 *                 description: Bits de datos
 *                 example: 8
 *               stopBits:
 *                 type: integer
 *                 description: Bits de parada
 *                 example: 1
 *               parity:
 *                 type: string
 *                 description: Paridad
 *                 example: "none"
 *               parser:
 *                 type: string
 *                 description: Tipo de parser a utilizar
 *                 example: "readline"
 *               delimiter:
 *                 type: string
 *                 description: Delimitador para el parser readline
 *                 example: "\r\n"
 *     responses:
 *       200:
 *         description: Configuración aplicada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configuración aplicada exitosamente"
 *                 config:
 *                   type: object
 *                   properties:
 *                     baudRate:
 *                       type: integer
 *                       example: 9600
 *       400:
 *         description: La balanza no está conectada o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La balanza no está conectada"
 *       500:
 *         description: Error al configurar la balanza
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al configurar la balanza"
 */
router.post('/configurar', ensureControllerMethod('configurarBalanza'));

/**
 * @swagger
 * /api/balanza/guardar-peso:
 *   post:
 *     summary: Guarda un registro de peso en la base de datos
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingreso_id
 *               - numero_pesaje
 *               - peso
 *             properties:
 *               ingreso_id:
 *                 type: integer
 *                 description: ID del ingreso asociado
 *                 example: 1
 *               numero_pesaje:
 *                 type: integer
 *                 description: Número de pesaje
 *                 example: 1
 *               peso:
 *                 type: number
 *                 format: float
 *                 description: Peso registrado
 *                 example: 10.123
 *               observacion:
 *                 type: string
 *                 description: Observación opcional
 *                 example: "Pesaje normal"
 *     responses:
 *       201:
 *         description: Peso guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Peso guardado exitosamente"
 *                 detallePesaje:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     ingreso_id:
 *                       type: integer
 *                       example: 1
 *                     numero_pesaje:
 *                       type: integer
 *                       example: 1
 *                     peso:
 *                       type: number
 *                       format: float
 *                       example: 10.123
 */
router.post('/guardar-peso', ensureControllerMethod('saveWeight'));

/**
 * @swagger
 * /api/balanza/pesajes/{ingresoId}:
 *   get:
 *     summary: Obtiene todos los pesajes asociados a un ingreso específico
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ingresoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Lista de pesajes del ingreso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   ingreso_id:
 *                     type: integer
 *                     example: 1
 *                   numero_pesaje:
 *                     type: integer
 *                     example: 1
 *                   peso:
 *                     type: number
 *                     format: float
 *                     example: 10.123
 *                   observacion:
 *                     type: string
 *                     example: "Pesaje normal"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-06-15T10:30:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-06-15T10:30:00Z"
 *       404:
 *         description: No se encontraron pesajes para el ingreso especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se encontraron pesajes para el ingreso especificado"
 *       500:
 *         description: Error al obtener los pesajes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los pesajes"
 *                 details:
 *                   type: string
 */
router.get('/pesajes/:ingresoId', ensureControllerMethod('getPesajesByIngreso'));

/**
 * @swagger
 * /api/balanza/pesajes/{id}:
 *   delete:
 *     summary: Elimina un registro de pesaje específico
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pesaje a eliminar
 *     responses:
 *       200:
 *         description: Pesaje eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pesaje eliminado correctamente"
 *       404:
 *         description: Pesaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pesaje no encontrado"
 *       500:
 *         description: Error al eliminar el pesaje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el pesaje"
 *                 details:
 *                   type: string
 */
router.delete('/pesajes/:id', ensureControllerMethod('deletePesaje'));

/**
 * @swagger
 * /api/balanza/pesajes/{id}/observacion:
 *   patch:
 *     summary: Actualiza la observación de un pesaje específico
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pesaje a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - observacion
 *             properties:
 *               observacion:
 *                 type: string
 *                 description: Nueva observación para el pesaje
 *                 example: "Pesaje con ajuste manual"
 *     responses:
 *       200:
 *         description: Observación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Observación actualizada correctamente"
 *                 detallePesaje:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     observacion:
 *                       type: string
 *                       example: "Pesaje con ajuste manual"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La observación es requerida"
 *       404:
 *         description: Pesaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Pesaje no encontrado"
 *       500:
 *         description: Error al actualizar la observación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar la observación"
 *                 details:
 *                   type: string
 */
router.patch('/pesajes/:id/observacion', ensureControllerMethod('updateObservacionPesaje'));

/**
 * @swagger
 * /api/balanza/realtime:
 *   get:
 *     summary: Inicia un stream de pesaje en tiempo real
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     description: Establece una conexión para recibir datos de pesaje en tiempo real
 *     produces:
 *       - text/event-stream
 *     responses:
 *       200:
 *         description: Stream de pesaje en tiempo real establecido
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   format: float
 *                   example: 10.123
 *                 isStable:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *       400:
 *         description: La balanza no está conectada
 *       500:
 *         description: Error al iniciar el stream de pesaje
 */
router.get('/realtime', ensureControllerMethod('iniciarPesajeRealtime'));

/**
 * @swagger
 * /api/balanza/pesaje-realtime:
 *   get:
 *     summary: Inicia un stream de pesaje en tiempo real (alias)
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     description: Alias para la ruta /api/balanza/realtime
 *     produces:
 *       - text/event-stream
 *     responses:
 *       200:
 *         description: Stream de pesaje en tiempo real establecido
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 weight:
 *                   type: number
 *                   format: float
 *                   example: 10.123
 *                 isStable:
 *                   type: boolean
 *                   example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *       400:
 *         description: La balanza no está conectada
 *       500:
 *         description: Error al iniciar el stream de pesaje
 */
router.get('/pesaje-realtime', ensureControllerMethod('iniciarPesajeRealtime')); // Asegúrate de que esta ruta esté correctamente definida

/**
 * @swagger
 * /api/balanza/mock:
 *   post:
 *     summary: Activa o desactiva el modo simulado de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Indica si el modo simulado debe estar activado
 *                 example: true
 *     responses:
 *       200:
 *         description: Modo simulado cambiado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Modo simulado activado exitosamente"
 *                 mockMode:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acceso denegado. Token no proporcionado o inválido."
 *       500:
 *         description: Error al cambiar el modo simulado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al cambiar el modo simulado"
 *                 details:
 *                   type: string
 */
router.post('/mock', verifyToken, ensureControllerMethod('toggleMockMode'));

/**
 * @swagger
 * /api/balanza/raw-data:
 *   get:
 *     summary: Obtiene los datos crudos recibidos de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos crudos de la balanza
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rawData:
 *                   type: string
 *                   example: "ST,GS,+   10.123kg"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *       400:
 *         description: La balanza no está conectada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La balanza no está conectada"
 *       404:
 *         description: No hay datos crudos disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No hay datos crudos disponibles"
 *       500:
 *         description: Error al obtener los datos crudos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los datos crudos"
 *                 details:
 *                   type: string
 */
router.get('/raw-data', ensureControllerMethod('getRawData'));

/**
 * @swagger
 * /api/balanza/last-data:
 *   get:
 *     summary: Obtiene los últimos datos recibidos de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Últimos datos recibidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rawData:
 *                   type: string
 *                   example: "ST,GS,+   10.123kg"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-06-15T10:30:00Z"
 *                 parsedWeight:
 *                   type: number
 *                   format: float
 *                   example: 10.123
 *                 isStable:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: La balanza no está conectada
 *       404:
 *         description: No hay datos disponibles
 *       500:
 *         description: Error al obtener los datos
 */
router.get('/last-data', balanzaController.getLastData);

/**
 * @swagger
 * /api/balanza/data-history:
 *   get:
 *     summary: Obtiene el historial de datos recibidos de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de registros a devolver
 *     responses:
 *       200:
 *         description: Historial de datos recibidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rawData:
 *                     type: string
 *                     example: "ST,GS,+   10.123kg"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-06-15T10:30:00Z"
 *                   parsedWeight:
 *                     type: number
 *                     format: float
 *                     example: 10.123
 *                   isStable:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Error al obtener el historial de datos
 */
router.get('/data-history', balanzaController.getDataHistory);

/**
 * @swagger
 * /api/balanza/mock-mode:
 *   post:
 *     summary: Activa o desactiva el modo simulado de la balanza
 *     tags: [Balanza]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 description: Indica si el modo simulado debe estar activado
 *                 example: true
 *     responses:
 *       200:
 *         description: Modo simulado cambiado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Modo simulado activado exitosamente"
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error al cambiar el modo simulado
 */
router.post('/mock-mode', verifyToken, balanzaController.toggleMockMode);

router.get('/check-service', balanzaController.checkBalanzaService);

/**
 * @swagger
 * /api/balanza/monitor-data:
 *   get:
 *     summary: Monitorea los datos de la balanza en tiempo real usando Server-Sent Events (SSE)
 *     tags: [Balanza]
 *     description: Establece una conexión SSE para recibir actualizaciones en tiempo real de los datos de la balanza
 *     produces:
 *       - text/event-stream
 *     responses:
 *       200:
 *         description: Stream de eventos establecido correctamente
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     rawData:
 *                       type: string
 *                       example: "ST,GS,+   10.123kg"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-06-15T10:30:00Z"
 *                     parsedWeight:
 *                       type: number
 *                       format: float
 *                       example: 10.123
 *                     isStable:
 *                       type: boolean
 *                       example: true
 *       500:
 *         description: Error al establecer el stream de eventos
 */
router.get('/monitor-data', (req, res) => {
    // Configurar cabeceras para SSE
    res.setHeader('Content-Type', 'text/event-stream'); 
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Iniciar el stream de datos
    const sseStream = balanzaService.setupMonitorDataStream();
    sseStream.init(req, res);
});

module.exports = router;