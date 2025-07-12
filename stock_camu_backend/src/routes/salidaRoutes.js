const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const salidaController = require('../controllers/salidaController');
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Salida:
 *       type: object
 *       required:
 *         - fecha
 *         - pedido_lote_id
 *         - cliente_id
 *         - producto_id
 *         - cantidad
 *         - unidad_medida_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la salida
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la salida
 *         pedido_lote_id:
 *           type: integer
 *           description: ID del pedido de lote asociado
 *         cliente_id:
 *           type: integer
 *           description: ID del cliente al que se entrega
 *         producto_id:
 *           type: integer
 *           description: ID del producto despachado
 *         cantidad:
 *           type: number
 *           description: Cantidad despachada
 *         unidad_medida_id:
 *           type: integer
 *           description: ID de la unidad de medida
 *         guia_remision:
 *           type: string
 *           description: Número de guía de remisión
 *         destino:
 *           type: string
 *           description: Dirección o punto de entrega
 *         observacion:
 *           type: string
 *           description: Observaciones adicionales
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que registró la salida
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó la salida
 */

/**
 * @swagger
 * /api/salidas:
 *   get:
 *     summary: Obtiene todas las salidas
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       500:
 *         description: Error del servidor
 */
router.get('/', salidaController.getAllSalidas);

/**
 * @swagger
 * /api/salidas/{id}:
 *   get:
 *     summary: Obtiene una salida por su ID
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la salida
 *     responses:
 *       200:
 *         description: Detalles de la salida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Salida'
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', salidaController.getSalidaById);

/**
 * @swagger
 * /api/salidas:
 *   post:
 *     summary: Crea una nueva salida
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pedido_lote_id
 *               - cliente_id
 *               - producto_id
 *               - cantidad
 *               - unidad_medida_id
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               pedido_lote_id:
 *                 type: integer
 *               cliente_id:
 *                 type: integer
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               unidad_medida_id:
 *                 type: integer
 *               guia_remision:
 *                 type: string
 *               destino:
 *                 type: string
 *               observacion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Salida creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Salida'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', salidaController.createSalida);

/**
 * @swagger
 * /api/salidas/{id}:
 *   put:
 *     summary: Actualiza una salida existente
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la salida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               pedido_lote_id:
 *                 type: integer
 *               cliente_id:
 *                 type: integer
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               unidad_medida_id:
 *                 type: integer
 *               guia_remision:
 *                 type: string
 *               destino:
 *                 type: string
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Salida actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Salida'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', salidaController.updateSalida);

/**
 * @swagger
 * /api/salidas/{id}:
 *   delete:
 *     summary: Elimina una salida
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la salida
 *     responses:
 *       200:
 *         description: Salida eliminada exitosamente
 *       404:
 *         description: Salida no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', salidaController.deleteSalida);

/**
 * @swagger
 * /api/salidas/pedido-lote/{pedidoLoteId}:
 *   get:
 *     summary: Obtiene salidas por pedido de lote
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pedidoLoteId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
 *     responses:
 *       200:
 *         description: Lista de salidas del pedido de lote especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/pedido-lote/:pedidoLoteId', salidaController.getSalidasByPedidoLote);

/**
 * @swagger
 * /api/salidas/cliente/{clienteId}:
 *   get:
 *     summary: Obtiene salidas por cliente
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de salidas del cliente especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/cliente/:clienteId', salidaController.getSalidasByCliente);

/**
 * @swagger
 * /api/salidas/producto/{productoId}:
 *   get:
 *     summary: Obtiene salidas por producto
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Lista de salidas del producto especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/producto/:productoId', salidaController.getSalidasByProducto);

/**
 * @swagger
 * /api/salidas/fecha:
 *   get:
 *     summary: Obtiene salidas por rango de fechas
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio del rango (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin del rango (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de salidas en el rango de fechas especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       400:
 *         description: Parámetros de fecha inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/fecha', salidaController.getSalidasByFecha);

/**
 * @swagger
 * /api/salidas/search:
 *   get:
 *     summary: Busca salidas por término (guía de remisión, destino, cliente, etc.)
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de salidas que coinciden con el término de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salida'
 *       400:
 *         description: Término de búsqueda no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/search', salidaController.searchSalidas);

/**
 * @swagger
 * /api/salidas/dashboard/resumen:
 *   get:
 *     summary: Obtiene resumen estadístico de salidas para el dashboard
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen estadístico de salidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSalidas:
 *                   type: integer
 *                 salidasMesActual:
 *                   type: integer
 *                 cantidadTotal:
 *                   type: number
 *                 cantidadPorProducto:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                       total:
 *                         type: number
 *                 cantidadPorCliente:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       razon_social:
 *                         type: string
 *                       total:
 *                         type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/dashboard/resumen', salidaController.getDashboardResumen);

/**
 * @swagger
 * /api/salidas/reporte:
 *   get:
 *     summary: Genera un reporte de salidas
 *     tags: [Salidas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *         required: true
 *         description: Formato del reporte
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Fecha de fin para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del cliente para filtrar
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del producto para filtrar
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/reporte', salidaController.generarReporte);

module.exports = router;