const express = require('express');
const detallePesajeController = require('../controllers/detallePesajeController');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     DetallePesaje:
 *       type: object
 *       required:
 *         - ingreso_id
 *         - numero_pesaje
 *         - peso
 *         - usuario_creacion_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle de pesaje
 *         ingreso_id:
 *           type: integer
 *           description: ID del ingreso al que pertenece
 *         numero_pesaje:
 *           type: integer
 *           description: Número secuencial del pesaje
 *         peso:
 *           type: number
 *           format: decimal
 *           description: Peso registrado
 *         peso_jaba:
 *           type: number
 *           format: decimal
 *           description: Peso de la jaba (por defecto 2.000)
 *         descuento_merma_pesaje:
 *           type: number
 *           format: decimal
 *           description: Descuento por merma en el pesaje
 *         observacion_pesaje:
 *           type: string
 *           description: Observaciones del pesaje
 *         fecha_pesaje:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del pesaje
 *         estado:
 *           type: boolean
 *           description: Estado del detalle de pesaje (activo/inactivo)
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que creó el registro
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó el registro
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de modificación del registro
 *       example:
 *         id: 1
 *         ingreso_id: 1
 *         numero_pesaje: 1
 *         peso: 25.50
 *         peso_jaba: 2.000
 *         descuento_merma_pesaje: 0.500
 *         observacion_pesaje: "Pesaje normal"
 *         fecha_pesaje: "2024-01-15T10:30:00Z"
 *         estado: true
 *         usuario_creacion_id: 1
 *         usuario_modificacion_id: null
 *         fecha_creacion: "2024-01-15T10:30:00Z"
 *         fecha_modificacion: "2024-01-15T10:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: DetallesPesaje
 *   description: API para gestionar detalles de pesaje
 */

/**
 * @swagger
 * /api/detalles-pesaje:
 *   get:
 *     summary: Obtiene todos los detalles de pesaje con paginación y filtros
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true/false)
 *       - in: query
 *         name: ingreso_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de ingreso
 *     responses:
 *       200:
 *         description: Lista paginada de detalles de pesaje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de registros
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *                 currentPage:
 *                   type: integer
 *                   description: Página actual
 *                 detallesPesaje:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DetallePesaje'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
router.get('/', detallePesajeController.getAllDetallesPesaje);

/**
 * @swagger
 * /api/detalles-pesaje/{id}:
 *   get:
 *     summary: Obtiene un detalle de pesaje por su ID
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de pesaje
 *     responses:
 *       200:
 *         description: Detalle de pesaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetallePesaje'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Detalle de pesaje no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', detallePesajeController.getDetallePesajeById);

/**
 * @swagger
 * /api/detalles-pesaje/ingreso/{ingresoId}:
 *   get:
 *     summary: Obtiene todos los detalles de pesaje activos de un ingreso específico
 *     tags: [DetallesPesaje]
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
 *         description: Lista de detalles de pesaje del ingreso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetallePesaje'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/ingreso/:ingresoId', detallePesajeController.getDetallesPesajeByIngresoId);

/**
 * @swagger
 * /api/detalles-pesaje:
 *   post:
 *     summary: Crea un nuevo detalle de pesaje y actualiza totales del ingreso
 *     tags: [DetallesPesaje]
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
 *                 description: ID del ingreso al que pertenece
 *               numero_pesaje:
 *                 type: integer
 *                 description: Número secuencial del pesaje (debe ser único por ingreso)
 *               peso:
 *                 type: number
 *                 format: decimal
 *                 description: Peso registrado
 *               peso_jaba:
 *                 type: number
 *                 format: decimal
 *                 description: Peso de la jaba (por defecto 2.000)
 *               descuento_merma_pesaje:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por merma en el pesaje (por defecto 0.000)
 *               observacion_pesaje:
 *                 type: string
 *                 description: Observaciones del pesaje
 *             example:
 *               ingreso_id: 1
 *               numero_pesaje: 1
 *               peso: 25.50
 *               peso_jaba: 2.000
 *               descuento_merma_pesaje: 0.500
 *               observacion_pesaje: "Pesaje normal"
 *     responses:
 *       201:
 *         description: Detalle de pesaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetallePesaje'
 *       400:
 *         description: Datos inválidos o número de pesaje duplicado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/', detallePesajeController.createDetallePesaje);

/**
 * @swagger
 * /api/detalles-pesaje/{id}:
 *   put:
 *     summary: Actualiza un detalle de pesaje existente y recalcula totales del ingreso
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de pesaje
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               peso:
 *                 type: number
 *                 format: decimal
 *                 description: Peso registrado
 *               peso_jaba:
 *                 type: number
 *                 format: decimal
 *                 description: Peso de la jaba
 *               descuento_merma_pesaje:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por merma en el pesaje
 *               observacion_pesaje:
 *                 type: string
 *                 description: Observaciones del pesaje
 *               estado:
 *                 type: boolean
 *                 description: Estado del detalle de pesaje
 *             example:
 *               peso: 27.75
 *               peso_jaba: 2.000
 *               descuento_merma_pesaje: 0.750
 *               observacion_pesaje: "Pesaje actualizado"
 *               estado: true
 *     responses:
 *       200:
 *         description: Detalle de pesaje actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetallePesaje'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Detalle de pesaje no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', detallePesajeController.updateDetallePesaje);

/**
 * @swagger
 * /api/detalles-pesaje/{id}:
 *   delete:
 *     summary: Elimina un detalle de pesaje
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de pesaje
 *     responses:
 *       200:
 *         description: Detalle de pesaje eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detalle de pesaje eliminado correctamente
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Detalle de pesaje no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Detalle de pesaje no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.delete('/:id', detallePesajeController.deleteDetallePesaje);

/**
 * @swagger
 * /api/detalles-pesaje/bulk:
 *   post:
 *     summary: Crea múltiples detalles de pesaje para un ingreso y actualiza totales
 *     tags: [DetallesPesaje]
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
 *               - pesajes
 *             properties:
 *               ingreso_id:
 *                 type: integer
 *                 description: ID del ingreso al que pertenecen
 *               pesajes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - numero_pesaje
 *                     - peso
 *                   properties:
 *                     numero_pesaje:
 *                       type: integer
 *                     peso:
 *                       type: number
 *                       format: decimal
 *                     peso_jaba:
 *                       type: number
 *                       format: decimal
 *                     descuento_merma_pesaje:
 *                       type: number
 *                       format: decimal
 *                     observacion_pesaje:
 *                       type: string
 *             example:
 *               ingreso_id: 1
 *               pesajes: [
 *                 { numero_pesaje: 1, peso: 25.50, peso_jaba: 2.000, descuento_merma_pesaje: 0.500, observacion_pesaje: "Pesaje 1" },
 *                 { numero_pesaje: 2, peso: 27.75, peso_jaba: 2.000, descuento_merma_pesaje: 0.750, observacion_pesaje: "Pesaje 2" },
 *                 { numero_pesaje: 3, peso: 26.30, peso_jaba: 2.000, descuento_merma_pesaje: 0.600, observacion_pesaje: "Pesaje 3" }
 *               ]
 *     responses:
 *       201:
 *         description: Detalles de pesaje creados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detalles de pesaje creados correctamente
 *                 detalles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DetallePesaje'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/bulk', detallePesajeController.createBulkDetallesPesaje);


/**
 * @swagger
 * /api/detalles-pesaje/ingreso/{ingreso_id}:
 *   delete:
 *     summary: Elimina todos los detalles de pesaje asociados a un ingreso específico
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ingreso_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ingreso cuyos detalles de pesaje se eliminarán
 *     responses:
 *       200:
 *         description: Detalles de pesaje eliminados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detalles de pesaje eliminados correctamente
 *                 count:
 *                   type: integer
 *                   description: Número de detalles eliminados
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/ingreso/:ingreso_id', detallePesajeController.deleteDetallesPesajeByIngresoId);


module.exports = router;