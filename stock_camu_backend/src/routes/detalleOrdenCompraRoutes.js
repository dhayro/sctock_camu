const express = require('express');
const detalleOrdenCompraController = require('../controllers/detalleOrdenCompraController');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/detalles-orden-compra:
 *   get:
 *     summary: Obtiene todos los detalles de orden de compra con paginación y filtros
 *     tags: [DetallesOrdenCompra]
 *     responses:
 *       200:
 *         description: Lista de detalles de orden de compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 detallesOrdenCompra:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DetalleOrdenCompra'
 *       500:
 *         description: Error del servidor
 */
router.get('/', detalleOrdenCompraController.getAllDetallesOrdenCompra);

/**
 * @swagger
 * /api/detalles-orden-compra/{id}:
 *   get:
 *     summary: Obtiene un detalle de orden de compra por su ID
 *     tags: [DetallesOrdenCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de orden de compra
 *     responses:
 *       200:
 *         description: Detalle de orden de compra encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalleOrdenCompra'
 *       404:
 *         description: Detalle de orden de compra no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', detalleOrdenCompraController.getDetalleOrdenCompraById);

/**
 * @swagger
 * /api/detalles-orden-compra:
 *   post:
 *     summary: Crea un nuevo detalle de orden de compra
 *     tags: [DetallesOrdenCompra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetalleOrdenCompra'
 *     responses:
 *       201:
 *         description: Detalle de orden de compra creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalleOrdenCompra'
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.post('/', detalleOrdenCompraController.createDetalleOrdenCompra);

/**
 * @swagger
 * /api/detalles-orden-compra/{id}:
 *   put:
 *     summary: Actualiza un detalle de orden de compra existente
 *     tags: [DetallesOrdenCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetalleOrdenCompra'
 *     responses:
 *       200:
 *         description: Detalle de orden de compra actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetalleOrdenCompra'
 *       404:
 *         description: Detalle de orden de compra no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', detalleOrdenCompraController.updateDetalleOrdenCompra);

/**
 * @swagger
 * /api/detalles-orden-compra/{id}:
 *   delete:
 *     summary: Elimina un detalle de orden de compra
 *     tags: [DetallesOrdenCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del detalle de orden de compra
 *     responses:
 *       200:
 *         description: Detalle de orden de compra eliminado exitosamente
 *       404:
 *         description: Detalle de orden de compra no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', detalleOrdenCompraController.deleteDetalleOrdenCompra);

/**
 * @swagger
 * /api/detalles-orden-compra/orden/{ordenId}:
 *   get:
 *     summary: Obtiene todos los detalles de una orden de compra específica
 *     tags: [DetallesOrdenCompra]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ordenId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden de compra
 *     responses:
 *       200:
 *         description: Lista de detalles de la orden de compra
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DetalleOrdenCompra'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden de compra no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/orden/:ordenId', detalleOrdenCompraController.getDetallesByOrdenId);

module.exports = router;