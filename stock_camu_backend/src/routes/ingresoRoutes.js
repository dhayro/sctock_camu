const express = require('express');
const ingresoController = require('../controllers/ingresoController');
const { verifyToken } = require('../middlewares/auth');
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// IMPORTANTE: Las rutas más específicas deben ir ANTES que las rutas con parámetros

/**
 * @swagger
 * /api/ingresos/search:
 *   get:
 *     summary: Busca ingresos por término
 *     tags: [Ingresos]
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de ingresos encontrados
 *       400:
 *         description: Término de búsqueda requerido
 *       500:
 *         description: Error del servidor
 */
router.get('/search', ingresoController.searchIngresos);

// Rutas generales
/**
 * @swagger
 * /api/ingresos:
 *   get:
 *     summary: Obtiene todos los ingresos con paginación y filtros
 *     tags: [Ingresos]
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
 *       - in: query
 *         name: estado
 *         schema:
 *           type: boolean
 *         description: Filtro por estado
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtro
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtro
 *     responses:
 *       200:
 *         description: Lista de ingresos con paginación
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
 *                 ingresos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ingreso'
 *       500:
 *         description: Error del servidor
 */
router.get('/', ingresoController.getAllIngresos);

/**
 * @swagger
 * /api/ingresos:
 *   post:
 *     summary: Crea un nuevo ingreso
 *     tags: [Ingresos]
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
 *               - detalle_orden_id
 *             properties:
 *               numero_ingreso:
 *                 type: string
 *                 maxLength: 20
 *               fecha:
 *                 type: string
 *                 format: date
 *               socio_id:
 *                 type: integer
 *               detalle_orden_id:
 *                 type: integer
 *               num_jabas:
 *                 type: integer
 *               precio_venta_kg:
 *                 type: number
 *                 format: decimal
 *               impuesto:
 *                 type: number
 *                 format: decimal
 *                 description: Porcentaje de impuesto
 *               pago_transporte:
 *                 type: number
 *                 format: decimal
 *                 description: Porcentaje para transporte
 *               observacion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ingreso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingreso'
 *       400:
 *         description: Datos incompletos o inválidos
 *       404:
 *         description: Socio o detalle de orden no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/', ingresoController.createIngreso);

// Rutas con parámetros ID deben ir al final
/**
 * @swagger
 * /api/ingresos/{id}:
 *   get:
 *     summary: Obtiene un ingreso por su ID
 *     tags: [Ingresos]
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
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', ingresoController.getIngresoById);

/**
 * @swagger
 * /api/ingresos/{id}:
 *   put:
 *     summary: Actualiza un ingreso existente
 *     tags: [Ingresos]
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
 *                 maxLength: 20
 *               fecha:
 *                 type: string
 *                 format: date
 *               socio_id:
 *                 type: integer
 *               detalle_orden_id:
 *                 type: integer
 *               num_jabas:
 *                 type: integer
 *               precio_venta_kg:
 *                 type: number
 *                 format: decimal
 *               impuesto:
 *                 type: number
 *                 format: decimal
 *               pago_transporte:
 *                 type: number
 *                 format: decimal
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ingreso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingreso'
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', ingresoController.updateIngreso);

/**
 * @swagger
 * /api/ingresos/{id}:
 *   delete:
 *     summary: Elimina un ingreso
 *     tags: [Ingresos]
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
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', ingresoController.deleteIngreso);

/**
 * @swagger
 * /api/ingresos/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un ingreso
 *     tags: [Ingresos]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: boolean
 *                 description: Nuevo estado del ingreso
 *     responses:
 *       200:
 *         description: Estado del ingreso actualizado exitosamente
 *       400:
 *         description: Estado requerido
 *       404:
 *         description: Ingreso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/estado', ingresoController.cambiarEstadoIngreso);

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingreso:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         numero_ingreso:
 *           type: string
 *           maxLength: 20
 *         fecha:
 *           type: string
 *           format: date
 *         socio_id:
 *           type: integer
 *         detalle_orden_id:
 *           type: integer
 *         num_jabas:
 *           type: integer
 *         peso_bruto:
 *           type: number
 *           format: decimal
 *         peso_total_jabas:
 *           type: number
 *           format: decimal
 *         dscto_merma:
 *           type: number
 *           format: decimal
 *         dscto_jaba:
 *           type: number
 *           format: decimal
 *         peso_neto:
 *           type: number
 *           format: decimal
 *         precio_venta_kg:
 *           type: number
 *           format: decimal
 *         subtotal:
 *           type: number
 *           format: decimal
 *         impuesto:
 *           type: number
 *           format: decimal
 *         monto_impuesto:
 *           type: number
 *           format: decimal
 *         total:
 *           type: number
 *           format: decimal
 *         pago_transporte:
 *           type: number
 *           format: decimal
 *         monto_transporte:
 *           type: number
 *           format: decimal
 *         ingreso_cooperativa:
 *           type: number
 *           format: decimal
 *         pago_socio:
 *           type: number
 *           format: decimal
 *         pago_con_descuento:
 *           type: number
 *           format: decimal
 *         observacion:
 *           type: string
 *         estado:
 *           type: boolean
 *         usuario_creacion_id:
 *           type: integer
 *         usuario_modificacion_id:
 *           type: integer
 *         fecha_creacion:
 *           type: string
 *           format: date-time
 *         fecha_modificacion:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         numero_ingreso: "ING-2023-001"
 *         fecha: "2023-05-15"
 *         socio_id: 1
 *         detalle_orden_id: 1
 *         num_jabas: 10
 *         peso_bruto: 160.00
 *         peso_total_jabas: 10.00
 *         dscto_merma: 2.50
 *         dscto_jaba: 1.00
 *         peso_neto: 147.50
 *         precio_venta_kg: 5.50
 *         subtotal: 811.25
 *         impuesto: 18.00
 *         monto_impuesto: 145.93
 *         total: 957.18
 *         pago_transporte: 10.00
 *         monto_transporte: 95.72
 *         ingreso_cooperativa: 861.46
 *         pago_socio: 861.46
 *         pago_con_descuento: 861.46
 *         observacion: "Ingreso de camu camu fresco"
 *         estado: true
 *         usuario_creacion_id: 1
 *         usuario_modificacion_id: 1
 *         fecha_creacion: "2023-05-15T10:30:00Z"
 *         fecha_modificacion: "2023-05-15T10:30:00Z"
 */
module.exports = router;