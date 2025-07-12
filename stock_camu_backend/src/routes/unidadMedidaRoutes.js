const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const unidadMedidaController = require('../controllers/unidadMedidaController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UnidadMedida:
 *       type: object
 *       required:
 *         - nombre
 *         - abreviatura
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la unidad de medida
 *         nombre:
 *           type: string
 *           description: Nombre de la unidad de medida
 *         abreviatura:
 *           type: string
 *           description: Abreviatura de la unidad de medida
 */

/**
 * @swagger
 * tags:
 *   name: UnidadesMedida
 *   description: API para gestionar unidades de medida
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/unidades-medida:
 *   get:
 *     summary: Obtiene todas las unidades de medida
 *     tags: [UnidadesMedida]
 *     responses:
 *       200:
 *         description: Lista de unidades de medida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UnidadMedida'
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
router.get('/', unidadMedidaController.getAllUnidadesMedida);

/**
 * @swagger
 * /api/unidades-medida/{id}:
 *   get:
 *     summary: Obtiene una unidad de medida por su ID
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la unidad de medida
 *     responses:
 *       200:
 *         description: Unidad de medida encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
 *       404:
 *         description: Unidad de medida no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unidad de medida no encontrada
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
router.get('/:id', unidadMedidaController.getUnidadMedidaById);

/**
 * @swagger
 * /api/unidades-medida:
 *   post:
 *     summary: Crea una nueva unidad de medida
 *     tags: [UnidadesMedida]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - abreviatura
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la unidad de medida
 *               abreviatura:
 *                 type: string
 *                 description: Abreviatura de la unidad de medida
 *             example:
 *               nombre: "Kilogramo"
 *               abreviatura: "kg"
 *     responses:
 *       201:
 *         description: Unidad de medida creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El nombre y la abreviatura son obligatorios
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
router.post('/', unidadMedidaController.createUnidadMedida);

/**
 * @swagger
 * /api/unidades-medida/{id}:
 *   put:
 *     summary: Actualiza una unidad de medida existente
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la unidad de medida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la unidad de medida
 *               abreviatura:
 *                 type: string
 *                 description: Abreviatura de la unidad de medida
 *             example:
 *               nombre: "Tonelada"
 *               abreviatura: "t"
 *     responses:
 *       200:
 *         description: Unidad de medida actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnidadMedida'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya existe una unidad de medida con ese nombre
 *       404:
 *         description: Unidad de medida no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unidad de medida no encontrada
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
router.put('/:id', unidadMedidaController.updateUnidadMedida);

/**
 * @swagger
 * /api/unidades-medida/{id}:
 *   delete:
 *     summary: Elimina una unidad de medida
 *     tags: [UnidadesMedida]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la unidad de medida
 *     responses:
 *       200:
 *         description: Unidad de medida eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unidad de medida eliminada correctamente
 *       400:
 *         description: No se puede eliminar porque está en uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No se puede eliminar esta unidad de medida porque está siendo utilizada
 *                 details:
 *                   type: string
 *                   example: Tiene 5 productos, 3 pedidos, 2 ingresos y 1 salidas asociados
 *       404:
 *         description: Unidad de medida no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unidad de medida no encontrada
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
router.delete('/:id', unidadMedidaController.deleteUnidadMedida);

module.exports = router;