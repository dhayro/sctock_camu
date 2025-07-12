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
 *         estado:
 *           type: boolean
 *           description: Estado del detalle de pesaje (activo/inactivo)
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que creó el registro
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó el registro
 *       example:
 *         id: 1
 *         ingreso_id: 1
 *         numero_pesaje: 1
 *         peso: 25.50
 *         estado: true
 *         usuario_creacion_id: 1
 *         usuario_modificacion_id: null
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
 *     summary: Obtiene todos los detalles de pesaje
 *     tags: [DetallesPesaje]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de detalles de pesaje
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetallePesaje'
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
 *     summary: Obtiene todos los detalles de pesaje de un ingreso específico
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
 *       500:
 *         description: Error del servidor
 */
router.get('/ingreso/:ingresoId', detallePesajeController.getDetallesPesajeByIngresoId);

/**
 * @swagger
 * /api/detalles-pesaje:
 *   post:
 *     summary: Crea un nuevo detalle de pesaje
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
 *                 description: Número secuencial del pesaje
 *               peso:
 *                 type: number
 *                 format: decimal
 *                 description: Peso registrado
 *             example:
 *               ingreso_id: 1
 *               numero_pesaje: 1
 *               peso: 25.50
 *     responses:
 *       201:
 *         description: Detalle de pesaje creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetallePesaje'
 *       400:
 *         description: Datos inválidos
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
 *     summary: Actualiza un detalle de pesaje existente
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
 *               ingreso_id:
 *                 type: integer
 *                 description: ID del ingreso al que pertenece
 *               numero_pesaje:
 *                 type: integer
 *                 description: Número secuencial del pesaje
 *               peso:
 *                 type: number
 *                 format: decimal
 *                 description: Peso registrado
 *               estado:
 *                 type: boolean
 *                 description: Estado del detalle de pesaje
 *             example:
 *               peso: 27.75
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
 *     summary: Crea múltiples detalles de pesaje para un ingreso
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
 *                 description: ID del ingreso al que pertenecen los pesajes
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
 *             example:
 *               ingreso_id: 1
 *               pesajes: [
 *                 { numero_pesaje: 1, peso: 25.50 },
 *                 { numero_pesaje: 2, peso: 27.75 },
 *                 { numero_pesaje: 3, peso: 26.30 }
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

module.exports = router;