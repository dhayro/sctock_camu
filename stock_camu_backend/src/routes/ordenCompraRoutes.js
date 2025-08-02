const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const ordenCompraController = require('../controllers/ordenCompraController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrdenCompra:
 *       type: object
 *       required:
 *         - codigo_lote
 *         - cliente_id
 *         - fecha_emision
 *         - usuario_creacion_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la orden de compra
 *         codigo_lote:
 *           type: string
 *           description: Código de lote de la orden de compra
 *         cliente_id:
 *           type: integer
 *           description: ID del cliente asociado
 *         numero_orden:
 *           type: string
 *           description: Número de orden
 *         fecha_emision:
 *           type: string
 *           format: date
 *           description: Fecha de emisión de la orden
 *         fecha_entrega:
 *           type: string
 *           format: date
 *           description: Fecha de entrega prevista
 *         lugar_entrega:
 *           type: string
 *           description: Lugar de entrega
 *         estado:
 *           type: string
 *           enum: [pendiente, en_proceso, completado, cancelado]
 *           description: Estado de la orden de compra
 *         observacion:
 *           type: string
 *           description: Observaciones adicionales
 *         forma_pago:
 *           type: string
 *           description: Forma de pago
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que creó la orden
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó la orden
 */

/**
 * @swagger
 * tags:
 *   name: OrdenesCompra
 *   description: API para gestionar órdenes de compra
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// IMPORTANTE: Las rutas más específicas deben ir ANTES que las rutas con parámetros
/**
 * @swagger
 * /api/ordenes-compra/pendientes:
 *   get:
 *     summary: Obtiene todas las órdenes de compra pendientes con paginación y filtros
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda general
 *     responses:
 *       200:
 *         description: Lista de órdenes de compra pendientes
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
 *                 ordenesPendientes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrdenCompra'
 *       500:
 *         description: Error del servidor
 */
router.get('/pendientes', ordenCompraController.getOrdenesPendientes);

/**
 * @swagger
 * /api/ordenes-compra/pendientes/socio/{socioId}:
 *   get:
 *     summary: Obtiene órdenes de compra pendientes por socio
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: path
 *         name: socioId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del socio
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de órdenes pendientes del socio
 *       500:
 *         description: Error del servidor
 */
router.get('/pendientes/socio/:socioId', ordenCompraController.getOrdenesPendientesPorSocio);

// Rutas generales
/**
 * @swagger
 * /api/ordenes-compra:
 *   get:
 *     summary: Obtiene todas las órdenes de compra con paginación y filtros
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda general
 *     responses:
 *       200:
 *         description: Lista de órdenes de compra
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
 *                 ordenesCompra:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrdenCompra'
 *       500:
 *         description: Error del servidor
 */
router.get('/', ordenCompraController.getAllOrdenesCompra);

/**
 * @swagger
 * /api/ordenes-compra:
 *   post:
 *     summary: Crea una nueva orden de compra
 *     tags: [OrdenesCompra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenCompra'
 *     responses:
 *       201:
 *         description: Orden de compra creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.post('/', ordenCompraController.createOrdenCompra);

// Rutas con parámetros ID deben ir al final
/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   get:
 *     summary: Obtiene una orden de compra por su ID
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden de compra
 *     responses:
 *       200:
 *         description: Orden de compra encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       404:
 *         description: Orden de compra no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', ordenCompraController.getOrdenCompraById);

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   put:
 *     summary: Actualiza una orden de compra existente
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenCompra'
 *     responses:
 *       200:
 *         description: Orden de compra actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenCompra'
 *       404:
 *         description: Orden de compra no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', ordenCompraController.updateOrdenCompra);

/**
 * @swagger
 * /api/ordenes-compra/{id}:
 *   delete:
 *     summary: Elimina una orden de compra
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden de compra
 *     responses:
 *       200:
 *         description: Orden de compra eliminada exitosamente
 *       404:
 *         description: Orden de compra no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', ordenCompraController.deleteOrdenCompra);

/**
 * @swagger
 * /api/ordenes-compra/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de una orden de compra
 *     tags: [OrdenesCompra]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la orden de compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, en_proceso, completado, cancelado]
 *     responses:
 *       200:
 *         description: Estado de la orden de compra actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Orden de compra no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/estado', ordenCompraController.cambiarEstadoOrdenCompra);

module.exports = router;