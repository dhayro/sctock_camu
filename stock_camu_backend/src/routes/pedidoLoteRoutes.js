const express = require('express');
const router = express.Router();
const pedidoLoteController = require('../controllers/pedidoLoteController');
const { verifyToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     PedidoLote:
 *       type: object
 *       required:
 *         - codigo
 *         - cliente_id
 *         - producto_id
 *         - cantidad
 *         - unidad_medida_id
 *         - fecha_pedido
 *         - tipo_fruta_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pedido de lote
 *         codigo:
 *           type: string
 *           description: Código único del pedido (ej. COOPAY25-S1-01)
 *         cliente_id:
 *           type: integer
 *           description: ID del cliente que realiza el pedido
 *         producto_id:
 *           type: integer
 *           description: ID del producto solicitado
 *         cantidad:
 *           type: number
 *           format: decimal
 *           description: Cantidad solicitada
 *         unidad_medida_id:
 *           type: integer
 *           description: ID de la unidad de medida
 *         fecha_pedido:
 *           type: string
 *           format: date
 *           description: Fecha en que se realizó el pedido
 *         tipo_fruta_id:
 *           type: integer
 *           description: ID del tipo de fruta
 *         fecha_limite:
 *           type: string
 *           format: date
 *           description: Fecha límite para completar el pedido (opcional)
 *         estado:
 *           type: string
 *           enum: [pendiente, completado, cancelado]
 *           description: Estado actual del pedido
 *         observacion:
 *           type: string
 *           description: Observaciones adicionales (opcional)
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que creó el pedido
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó por última vez el pedido (opcional)
 *       example:
 *         codigo: "COOPAY25-S1-01"
 *         cliente_id: 1
 *         producto_id: 2
 *         cantidad: 1000.00
 *         unidad_medida_id: 1
 *         fecha_pedido: "2023-05-15"
 *         tipo_fruta_id: 3
 *         fecha_limite: "2023-06-15"
 *         estado: "pendiente"
 *         observacion: "Pedido para exportación"
 *
 *     AvancePedido:
 *       type: object
 *       properties:
 *         pedido_id:
 *           type: integer
 *           description: ID del pedido
 *         codigo:
 *           type: string
 *           description: Código del pedido
 *         cliente:
 *           type: string
 *           description: Nombre del cliente
 *         producto:
 *           type: string
 *           description: Nombre del producto
 *         cantidad_solicitada:
 *           type: number
 *           description: Cantidad total solicitada
 *         unidad_medida:
 *           type: string
 *           description: Unidad de medida
 *         cantidad_acopiada:
 *           type: number
 *           description: Cantidad total acopiada hasta el momento
 *         cantidad_despachada:
 *           type: number
 *           description: Cantidad total despachada hasta el momento
 *         cantidad_faltante:
 *           type: number
 *           description: Cantidad que falta por acopiar
 *         cantidad_disponible:
 *           type: number
 *           description: Cantidad acopiada menos cantidad despachada
 *         porcentaje_avance:
 *           type: number
 *           description: Porcentaje de avance del acopio
 *         estado_acopio:
 *           type: string
 *           enum: [pendiente, completo]
 *           description: Estado del acopio
 *         estado_pedido:
 *           type: string
 *           enum: [pendiente, completado, cancelado]
 *           description: Estado general del pedido
 */

/**
 * @swagger
 * tags:
 *   name: Pedidos de Lotes
 *   description: API para gestionar pedidos de lotes
 */

/**
 * @swagger
 * /api/pedidos-lotes:
 *   get:
 *     summary: Obtiene todos los pedidos de lotes
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos de lotes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       500:
 *         description: Error del servidor
 */
router.get('/', pedidoLoteController.getAllPedidosLotes);

/**
 * @swagger
 * /api/pedidos-lotes/{id}:
 *   get:
 *     summary: Obtiene un pedido de lote por su ID
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
 *     responses:
 *       200:
 *         description: Detalles del pedido de lote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoLote'
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', pedidoLoteController.getPedidoLoteById);

/**
 * @swagger
 * /api/pedidos-lotes:
 *   post:
 *     summary: Crea un nuevo pedido de lote
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - cliente_id
 *               - producto_id
 *               - cantidad
 *               - unidad_medida_id
 *               - fecha_pedido
 *               - tipo_fruta_id
 *             properties:
 *               codigo:
 *                 type: string
 *               cliente_id:
 *                 type: integer
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               unidad_medida_id:
 *                 type: integer
 *               fecha_pedido:
 *                 type: string
 *                 format: date
 *               tipo_fruta_id:
 *                 type: integer
 *               fecha_limite:
 *                 type: string
 *                 format: date
 *               observacion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido de lote creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoLote'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', pedidoLoteController.createPedidoLote);

/**
 * @swagger
 * /api/pedidos-lotes/{id}:
 *   put:
 *     summary: Actualiza un pedido de lote existente
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               cliente_id:
 *                 type: integer
 *               producto_id:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               unidad_medida_id:
 *                 type: integer
 *               fecha_pedido:
 *                 type: string
 *                 format: date
 *               tipo_fruta_id:
 *                 type: integer
 *               fecha_limite:
 *                 type: string
 *                 format: date
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pedido de lote actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PedidoLote'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', pedidoLoteController.updatePedidoLote);

/**
 * @swagger
 * /api/pedidos-lotes/{id}:
 *   delete:
 *     summary: Elimina un pedido de lote
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
 *     responses:
 *       200:
 *         description: Pedido de lote eliminado exitosamente
 *       400:
 *         description: No se puede eliminar el pedido porque tiene registros asociados
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', pedidoLoteController.deletePedidoLote);

/**
 * @swagger
 * /api/pedidos-lotes/estado/{estado}:
 *   get:
 *     summary: Obtiene pedidos de lotes por estado
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, completado, cancelado]
 *         required: true
 *         description: Estado de los pedidos a buscar
 *     responses:
 *       200:
 *         description: Lista de pedidos de lotes con el estado especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       400:
 *         description: Estado no válido
 *       500:
 *         description: Error del servidor
 */
router.get('/estado/:estado', pedidoLoteController.getPedidosByEstado);

/**
 * @swagger
 * /api/pedidos-lotes/{id}/cambiar-estado:
 *   patch:
 *     summary: Cambia el estado de un pedido de lote
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
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
 *                 enum: [pendiente, completado, cancelado]
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado exitosamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/cambiar-estado', pedidoLoteController.cambiarEstadoPedido);

/**
 * @swagger
 * /api/pedidos-lotes/search:
 *   get:
 *     summary: Busca pedidos de lotes por código o cliente
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda (código o nombre de cliente)
 *     responses:
 *       200:
 *         description: Lista de pedidos de lotes que coinciden con el término de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       400:
 *         description: Término de búsqueda no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/search', pedidoLoteController.searchPedidosLotes);

/**
 * @swagger
 * /api/pedidos-lotes/avance:
 *   get:
 *     summary: Obtiene el avance de todos los pedidos
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista con el avance de todos los pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvancePedido'
 *       500:
 *         description: Error del servidor
 */
router.get('/avance', pedidoLoteController.getAvancePedidos);

/**
 * @swagger
 * /api/pedidos-lotes/{id}/avance:
 *   get:
 *     summary: Obtiene el avance de un pedido específico
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido de lote
 *     responses:
 *       200:
 *         description: Avance del pedido especificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvancePedido'
 *       404:
 *         description: Pedido de lote no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/avance', pedidoLoteController.getAvancePedidoById);

/**
 * @swagger
 * /api/pedidos-lotes/cliente/{clienteId}:
 *   get:
 *     summary: Obtiene pedidos de lotes por cliente
 *     tags: [Pedidos de Lotes]
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
 *         description: Lista de pedidos de lotes del cliente especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/cliente/:clienteId', pedidoLoteController.getPedidosByCliente);

/**
 * @swagger
 * /api/pedidos-lotes/producto/{productoId}:
 *   get:
 *     summary: Obtiene pedidos de lotes por producto
 *     tags: [Pedidos de Lotes]
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
 *         description: Lista de pedidos de lotes del producto especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/producto/:productoId', pedidoLoteController.getPedidosByProducto);

/**
 * @swagger
 * /api/pedidos-lotes/fecha:
 *   get:
 *     summary: Obtiene pedidos de lotes por rango de fechas
 *     tags: [Pedidos de Lotes]
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
 *         description: Lista de pedidos de lotes en el rango de fechas especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PedidoLote'
 *       400:
 *         description: Parámetros de fecha inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/fecha', pedidoLoteController.getPedidosByFecha);

/**
 * @swagger
 * /api/pedidos-lotes/dashboard/resumen:
 *   get:
 *     summary: Obtiene resumen estadístico de pedidos para el dashboard
 *     tags: [Pedidos de Lotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen estadístico de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPedidos:
 *                   type: integer
 *                 pedidosPendientes:
 *                   type: integer
 *                 pedidosCompletados:
 *                   type: integer
 *                 pedidosCancelados:
 *                   type: integer
 *                 cantidadTotalSolicitada:
 *                   type: number
 *                 cantidadTotalAcopiada:
 *                   type: number
 *                 porcentajeAvanceTotal:
 *                   type: number
 *       500:
 *         description: Error del servidor
 */
router.get('/dashboard/resumen', pedidoLoteController.getDashboardResumen);

/**
 * @swagger
 * /api/pedidos-lotes/reporte:
 *   get:
 *     summary: Genera un reporte de pedidos de lotes
 *     tags: [Pedidos de Lotes]
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
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [todos, pendiente, completado, cancelado]
 *         required: false
 *         description: Filtrar por estado
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
router.get('/reporte', pedidoLoteController.generarReporte);

module.exports = router;