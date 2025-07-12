const express = require('express');
const ingresoController = require('../controllers/ingresoController');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingreso:
 *       type: object
 *       required:
 *         - numero_ingreso
 *         - fecha
 *         - socio_id
 *         - producto_id
 *         - pedido_lote_id
 *         - unidad_medida_id
 *         - tipo_fruta_id
 *         - num_jabas
 *         - usuario_creacion_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del ingreso
 *         numero_ingreso:
 *           type: string
 *           description: Número único de ingreso
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha del ingreso
 *         socio_id:
 *           type: integer
 *           description: ID del socio
 *         producto_id:
 *           type: integer
 *           description: ID del producto
 *         pedido_lote_id:
 *           type: integer
 *           description: ID del pedido o lote
 *         unidad_medida_id:
 *           type: integer
 *           description: ID de la unidad de medida
 *         tipo_fruta_id:
 *           type: integer
 *           description: ID del tipo de fruta
 *         num_jabas:
 *           type: integer
 *           description: Número de jabas
 *         dscto_merma:
 *           type: number
 *           format: decimal
 *           description: Descuento por merma
 *         dscto_jaba:
 *           type: number
 *           format: decimal
 *           description: Descuento por jaba
 *         peso_neto:
 *           type: number
 *           format: decimal
 *           description: Peso neto
 *         precio_venta_kg:
 *           type: number
 *           format: decimal
 *           description: Precio de venta por kilogramo
 *         total:
 *           type: number
 *           format: decimal
 *           description: Total del ingreso
 *         pago_transporte:
 *           type: number
 *           format: decimal
 *           description: Pago por transporte
 *         ingreso_cooperativa:
 *           type: number
 *           format: decimal
 *           description: Ingreso para la cooperativa
 *         pago_socio:
 *           type: number
 *           format: decimal
 *           description: Pago al socio
 *         pago_con_descuento:
 *           type: number
 *           format: decimal
 *           description: Pago con descuento
 *         observacion:
 *           type: string
 *           description: Observaciones del ingreso
 *         estado:
 *           type: boolean
 *           description: Estado del ingreso (activo/inactivo)
 *         usuario_creacion_id:
 *           type: integer
 *           description: ID del usuario que creó el registro
 *         usuario_modificacion_id:
 *           type: integer
 *           description: ID del usuario que modificó el registro
 *       example:
 *         id: 1
 *         numero_ingreso: "ING-2023-001"
 *         fecha: "2023-05-15T10:30:00Z"
 *         socio_id: 1
 *         producto_id: 1
 *         pedido_lote_id: 1
 *         unidad_medida_id: 1
 *         tipo_fruta_id: 1
 *         num_jabas: 10
 *         dscto_merma: 2.5
 *         dscto_jaba: 1.0
 *         peso_neto: 150.75
 *         precio_venta_kg: 5.50
 *         total: 829.13
 *         pago_transporte: 50.00
 *         ingreso_cooperativa: 82.91
 *         pago_socio: 696.22
 *         pago_con_descuento: 696.22
 *         observacion: "Ingreso de camu camu fresco"
 *         estado: true
 *         usuario_creacion_id: 1
 *         usuario_modificacion_id: null
 */

/**
 * @swagger
 * tags:
 *   name: Ingresos
 *   description: API para gestionar ingresos de productos
 */

/**
 * @swagger
 * /api/ingresos:
 *   get:
 *     summary: Obtiene todos los ingresos
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ingresos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingreso'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.get('/', ingresoController.getAllIngresos);

/**
 * @swagger
 * /api/ingresos/search:
 *   get:
 *     summary: Busca ingresos por número o socio
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda (número de ingreso o nombre/apellido del socio)
 *     responses:
 *       200:
 *         description: Lista de ingresos que coinciden con la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingreso'
 *       400:
 *         description: Término de búsqueda no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.get('/search', ingresoController.searchIngresos);

/**
 * @swagger
 * /api/ingresos/{id}:
 *   get:
 *     summary: Obtiene un ingreso por su ID
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Ingreso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingreso'
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
 *         description: Ingreso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ingreso no encontrado
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
router.get('/:id', ingresoController.getIngresoById);

/**
 * @swagger
 * /api/ingresos:
 *   post:
 *     summary: Crea un nuevo ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_ingreso
 *               - fecha
 *               - socio_id
 *               - producto_id
 *               - pedido_lote_id
 *               - unidad_medida_id
 *               - tipo_fruta_id
 *               - num_jabas
 *             properties:
 *               numero_ingreso:
 *                 type: string
 *                 description: Número único de ingreso
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del ingreso
 *               socio_id:
 *                 type: integer
 *                 description: ID del socio
 *               producto_id:
 *                 type: integer
 *                 description: ID del producto
 *               pedido_lote_id:
 *                 type: integer
 *                 description: ID del pedido o lote
 *               unidad_medida_id:
 *                 type: integer
 *                 description: ID de la unidad de medida
 *               tipo_fruta_id:
 *                 type: integer
 *                 description: ID del tipo de fruta
 *               num_jabas:
 *                 type: integer
 *                 description: Número de jabas
 *               dscto_merma:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por merma
 *               dscto_jaba:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por jaba
 *               peso_neto:
 *                 type: number
 *                 format: decimal
 *                 description: Peso neto
 *               precio_venta_kg:
 *                 type: number
 *                 format: decimal
 *                 description: Precio de venta por kilogramo
 *               total:
 *                 type: number
 *                 format: decimal
 *                 description: Total del ingreso
 *               pago_transporte:
 *                 type: number
 *                 format: decimal
 *                 description: Pago por transporte
 *               ingreso_cooperativa:
 *                 type: number
 *                 format: decimal
 *                 description: Ingreso para la cooperativa
 *               pago_socio:
 *                 type: number
 *                 format: decimal
 *                 description: Pago al socio
 *               pago_con_descuento:
 *                 type: number
 *                 format: decimal
 *                 description: Pago con descuento
 *               observacion:
 *                 type: string
 *                 description: Observaciones del ingreso
 *             example:
 *               numero_ingreso: "ING-2023-001"
 *               fecha: "2023-05-15T10:30:00Z"
 *               socio_id: 1
 *               producto_id: 1
 *               pedido_lote_id: 1
 *               unidad_medida_id: 1
 *               tipo_fruta_id: 1
 *               num_jabas: 10
 *               dscto_merma: 2.5
 *               dscto_jaba: 1.0
 *               peso_neto: 150.75
 *               precio_venta_kg: 5.50
 *               total: 829.13
 *               pago_transporte: 50.00
 *               ingreso_cooperativa: 82.91
 *               pago_socio: 696.22
 *               pago_con_descuento: 696.22
 *               observacion: "Ingreso de camu camu fresco"
 *     responses:
 *       201:
 *         description: Ingreso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingreso'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Faltan campos obligatorios
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.post('/', ingresoController.createIngreso);

/**
 * @swagger
 * /api/ingresos/{id}:
 *   put:
 *     summary: Actualiza un ingreso existente
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ingreso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero_ingreso:
 *                 type: string
 *                 description: Número único de ingreso
 *               fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del ingreso
 *               socio_id:
 *                 type: integer
 *                 description: ID del socio
 *               producto_id:
 *                 type: integer
 *                 description: ID del producto
 *               pedido_lote_id:
 *                 type: integer
 *                 description: ID del pedido o lote
 *               unidad_medida_id:
 *                 type: integer
 *                 description: ID de la unidad de medida
 *               tipo_fruta_id:
 *                 type: integer
 *                 description: ID del tipo de fruta
 *               num_jabas:
 *                 type: integer
 *                 description: Número de jabas
 *               dscto_merma:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por merma
 *               dscto_jaba:
 *                 type: number
 *                 format: decimal
 *                 description: Descuento por jaba
 *               peso_neto:
 *                 type: number
 *                 format: decimal
 *                 description: Peso neto
 *               precio_venta_kg:
 *                 type: number
 *                 format: decimal
 *                 description: Precio de venta por kilogramo
 *               total:
 *                 type: number
 *                 format: decimal
 *                 description: Total del ingreso
 *               pago_transporte:
 *                 type: number
 *                 format: decimal
 *                 description: Pago por transporte
 *               ingreso_cooperativa:
 *                 type: number
 *                 format: decimal
 *                 description: Ingreso para la cooperativa
 *               pago_socio:
 *                 type: number
 *                 format: decimal
 *                 description: Pago al socio
 *               pago_con_descuento:
 *                 type: number
 *                 format: decimal
 *                 description: Pago con descuento
 *               observacion:
 *                 type: string
 *                 description: Observaciones del ingreso
 *               estado:
 *                 type: boolean
 *                 description: Estado del ingreso (activo/inactivo)
 *             example:
 *               numero_ingreso: "ING-2023-001-UPDATED"
 *               fecha: "2023-05-16T10:30:00Z"
 *               socio_id: 2
 *               producto_id: 1
 *               pedido_lote_id: 1
 *               unidad_medida_id: 1
 *               tipo_fruta_id: 2
 *               num_jabas: 12
 *               dscto_merma: 3.0
 *               dscto_jaba: 1.5
 *               peso_neto: 180.50
 *               precio_venta_kg: 6.00
 *               total: 1083.00
 *               pago_transporte: 60.00
 *               ingreso_cooperativa: 108.30
 *               pago_socio: 914.70
 *               pago_con_descuento: 914.70
 *               observacion: "Ingreso actualizado de camu camu"
 *               estado: true
 *     responses:
 *       200:
 *         description: Ingreso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingreso'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *         description: Ingreso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
router.put('/:id', ingresoController.updateIngreso);

/**
 * @swagger
 * /api/ingresos/{id}:
 *   delete:
 *     summary: Elimina un ingreso
 *     tags: [Ingresos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del ingreso
 *     responses:
 *       200:
 *         description: Ingreso eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ingreso eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque está en uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No se puede eliminar este ingreso porque está siendo utilizado
 *                 details:
 *                   type: string
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
 *         description: Ingreso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ingreso no encontrado
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
router.delete('/:id', ingresoController.deleteIngreso);

module.exports = router;