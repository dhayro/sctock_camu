
const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const parcelaController = require('../controllers/parcelaController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Parcela:
 *       type: object
 *       required:
 *         - hectarias
 *         - volumen
 *         - periodo
 *         - socio_id
 *         - fecha_inicio
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la parcela
 *         codigo:
 *           type: string
 *           description: Código único de la parcela (generado automáticamente)
 *         hectarias:
 *           type: number
 *           format: decimal
 *           description: Cantidad de hectáreas de la parcela
 *         volumen:
 *           type: number
 *           format: decimal
 *           description: Volumen de la parcela
 *         periodo:
 *           type: integer
 *           description: Período de la parcela (año)
 *         estado:
 *           type: boolean
 *           description: Estado de la parcela (activa/inactiva)
 *         tipo_lote:
 *           type: string
 *           enum: [organica, convencional]
 *           description: Tipo de lote de la parcela
 *         socio_id:
 *           type: integer
 *           description: ID del socio propietario
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de la parcela
 *         fecha_fin:
 *           type: string
 *           format: date
 *           description: Fecha de fin de la parcela
 */

/**
 * @swagger
 * tags:
 *   name: Parcelas
 *   description: API para gestionar parcelas
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/parcelas:
 *   get:
 *     summary: Obtiene todas las parcelas con paginación y filtros
 *     tags: [Parcelas]
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
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por código
 *       - in: query
 *         name: socio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del socio
 *       - in: query
 *         name: tipo_lote
 *         schema:
 *           type: string
 *           enum: [organica, convencional]
 *         description: Filtrar por tipo de lote
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de parcelas con paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 parcelas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parcela'
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/', parcelaController.getAllParcelas);

/**
 * @swagger
 * /api/parcelas/activas:
 *   get:
 *     summary: Obtiene todas las parcelas activas
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parcelas activas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parcela'
 *       500:
 *         description: Error del servidor
 */
router.get('/activas', parcelaController.getParcelasActivas);

/**
 * @swagger
 * /api/parcelas/clonar-activas:
 *   post:
 *     summary: Clona todas las parcelas activas para un nuevo período
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevo_periodo
 *             properties:
 *               nuevo_periodo:
 *                 type: integer
 *                 description: Nuevo período (año) para las parcelas clonadas
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de inicio (opcional)
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de fin (opcional)
 *             example:
 *               nuevo_periodo: 2025
 *               fecha_inicio: "2025-01-01"
 *               fecha_fin: "2025-12-31"
 *     responses:
 *       201:
 *         description: Parcelas clonadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Parcelas clonadas exitosamente"
 *                 parcelas_clonadas:
 *                   type: integer
 *                   example: 15
 *                 parcelas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parcela'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/clonar-activas', parcelaController.clonarParcelasActivas);

/**
 * @swagger
 * /api/parcelas/verificar-vencidas:
 *   post:
 *     summary: Verifica y desactiva parcelas vencidas
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verificación de parcelas vencidas completada"
 *                 parcelas_desactivadas:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Error del servidor
 */
router.post('/verificar-vencidas', parcelaController.verificarParcelasVencidas);

/**
 * @swagger
 * /api/parcelas/verificar-vencidas:
 *   post:
 *     summary: Verifica y desactiva parcelas vencidas
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verificación de parcelas vencidas completada"
 *                 parcelas_desactivadas:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Error del servidor
 */
router.post('/verificar-vencidas', parcelaController.verificarParcelasVencidas);

/**
 * @swagger
 * /api/parcelas/socio/{socio_id}:
 *   get:
 *     summary: Obtiene todas las parcelas de un socio específico
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: socio_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del socio
 *     responses:
 *       200:
 *         description: Lista de parcelas del socio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parcela'
 *       500:
 *         description: Error del servidor
 */
router.get('/socio/:socio_id', parcelaController.getParcelasBySocio);

/**
 * @swagger
 * /api/parcelas/{id}:
 *   get:
 *     summary: Obtiene una parcela por su ID
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la parcela
 *     responses:
 *       200:
 *         description: Parcela encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parcela'
 *       404:
 *         description: Parcela no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', parcelaController.getParcelaById);

/**
 * @swagger
 * /api/parcelas:
 *   post:
 *     summary: Crea una nueva parcela
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hectarias
 *               - volumen
 *               - periodo
 *               - socio_id
 *               - fecha_inicio
 *             properties:
 *               hectarias:
 *                 type: number
 *                 format: decimal
 *                 description: Cantidad de hectáreas
 *               volumen:
 *                 type: number
 *                 format: decimal
 *                 description: Volumen de la parcela
 *               periodo:
 *                 type: integer
 *                 description: Período de la parcela (año)
 *               tipo_lote:
 *                 type: string
 *                 enum: [organica, convencional]
 *                 description: Tipo de lote
 *               socio_id:
 *                 type: integer
 *                 description: ID del socio propietario
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin (opcional)
 *               estado:
 *                 type: boolean
 *                 default: true
 *                 description: Estado de la parcela
 *             example:
 *               hectarias: 2.5
 *               volumen: 1500.00
 *               periodo: 2024
 *               tipo_lote: "organica"
 *               socio_id: 1
 *               fecha_inicio: "2024-01-01"
 *               fecha_fin: "2024-12-31"
 *               estado: true
 *     responses:
 *       201:
 *         description: Parcela creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parcela'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', parcelaController.createParcela);

/**
 * @swagger
 * /api/parcelas/{id}:
 *   put:
 *     summary: Actualiza una parcela existente
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la parcela
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hectarias:
 *                 type: number
 *                 format: decimal
 *                 description: Cantidad de hectáreas
 *               volumen:
 *                 type: number
 *                 format: decimal
 *                 description: Volumen de la parcela
 *               periodo:
 *                 type: integer
 *                 description: Período de la parcela (año)
 *               tipo_lote:
 *                 type: string
 *                 enum: [organica, convencional]
 *                 description: Tipo de lote
 *               socio_id:
 *                 type: integer
 *                 description: ID del socio propietario
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin
 *               estado:
 *                 type: boolean
 *                 description: Estado de la parcela
 *             example:
 *               hectarias: 3.0
 *               volumen: 1800.00
 *               periodo: 2024
 *               tipo_lote: "convencional"
 *               socio_id: 1
 *               fecha_inicio: "2024-01-01"
 *               fecha_fin: "2024-12-31"
 *               estado: true
 *     responses:
 *       200:
 *         description: Parcela actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parcela'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Parcela no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', parcelaController.updateParcela);

/**
 * @swagger
 * /api/parcelas/{id}:
 *   delete:
 *     summary: Elimina una parcela (soft delete)
 *     tags: [Parcelas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la parcela
 *     responses:
 *       200:
 *         description: Parcela eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parcela eliminada correctamente
 *       404:
 *         description: Parcela no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', parcelaController.deleteParcela);

module.exports = router;
