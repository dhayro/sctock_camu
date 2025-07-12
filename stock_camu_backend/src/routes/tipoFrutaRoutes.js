const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const tipoFrutaController = require('../controllers/tipoFrutaController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoFruta:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del tipo de fruta
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de fruta
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de fruta
 */

/**
 * @swagger
 * tags:
 *   name: TiposFruta
 *   description: API para gestionar tipos de fruta
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/tipos-fruta:
 *   get:
 *     summary: Obtiene todos los tipos de fruta
 *     tags: [TiposFruta]
 *     responses:
 *       200:
 *         description: Lista de tipos de fruta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoFruta'
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
router.get('/', tipoFrutaController.getAllTiposFruta);

/**
 * @swagger
 * /api/tipos-fruta/{id}:
 *   get:
 *     summary: Obtiene un tipo de fruta por su ID
 *     tags: [TiposFruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del tipo de fruta
 *     responses:
 *       200:
 *         description: Tipo de fruta encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoFruta'
 *       404:
 *         description: Tipo de fruta no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Tipo de fruta no encontrado
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
router.get('/:id', tipoFrutaController.getTipoFrutaById);

/**
 * @swagger
 * /api/tipos-fruta:
 *   post:
 *     summary: Crea un nuevo tipo de fruta
 *     tags: [TiposFruta]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del tipo de fruta
 *               descripcion:
 *                 type: string
 *                 description: Descripción del tipo de fruta
 *             example:
 *               nombre: "Camu Camu Verde"
 *               descripcion: "Fruta en estado verde, apta para procesamiento"
 *     responses:
 *       201:
 *         description: Tipo de fruta creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoFruta'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El nombre es obligatorio
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
router.post('/', tipoFrutaController.createTipoFruta);

/**
 * @swagger
 * /api/tipos-fruta/{id}:
 *   put:
 *     summary: Actualiza un tipo de fruta existente
 *     tags: [TiposFruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del tipo de fruta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del tipo de fruta
 *               descripcion:
 *                 type: string
 *                 description: Descripción del tipo de fruta
 *             example:
 *               nombre: "Camu Camu Maduro"
 *               descripcion: "Fruta en estado maduro, lista para consumo"
 *     responses:
 *       200:
 *         description: Tipo de fruta actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoFruta'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya existe un tipo de fruta con ese nombre
 *       404:
 *         description: Tipo de fruta no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Tipo de fruta no encontrado
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
router.put('/:id', tipoFrutaController.updateTipoFruta);

/**
 * @swagger
 * /api/tipos-fruta/{id}:
 *   delete:
 *     summary: Elimina un tipo de fruta
 *     tags: [TiposFruta]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del tipo de fruta
 *     responses:
 *       200:
 *         description: Tipo de fruta eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tipo de fruta eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque está en uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No se puede eliminar este tipo de fruta porque está siendo utilizado
 *                 details:
 *                   type: string
 *                   example: Tiene 5 pedidos y 3 ingresos asociados
 *       404:
 *         description: Tipo de fruta no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Tipo de fruta no encontrado
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
router.delete('/:id', tipoFrutaController.deleteTipoFruta);

module.exports = router;