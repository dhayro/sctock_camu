const express = require('express');
const router = express.Router();
const cargosController = require('../controllers/cargosController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     Cargo:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del cargo
 *         nombre:
 *           type: string
 *           description: Nombre del cargo
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del cargo
 *       example:
 *         id: 1
 *         nombre: Gerente
 *         descripcion: Cargo de gerencia con responsabilidades administrativas
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de error
 *       example:
 *         message: Error al procesar la solicitud
 */

/**
 * @swagger
 * tags:
 *   name: Cargos
 *   description: API para gestionar cargos del personal
 */

/**
 * @swagger
 * /api/cargos:
 *   get:
 *     summary: Obtiene todos los cargos
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cargos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cargo'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Acceso denegado. Token no proporcionado.
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', cargosController.getAllCargos);

/**
 * @swagger
 * /api/cargos/{id}:
 *   get:
 *     summary: Obtiene un cargo por su ID
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cargo
 *     responses:
 *       200:
 *         description: Cargo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cargo'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cargo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cargo no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', cargosController.getCargoById);

/**
 * @swagger
 * /api/cargos:
 *   post:
 *     summary: Crea un nuevo cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
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
 *                 description: Nombre del cargo
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del cargo
 *             example:
 *               nombre: Supervisor
 *               descripcion: Cargo de supervisión de operaciones
 *     responses:
 *       201:
 *         description: Cargo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cargo'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: El nombre del cargo es requerido
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', cargosController.createCargo);

/**
 * @swagger
 * /api/cargos/{id}:
 *   put:
 *     summary: Actualiza un cargo existente
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cargo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cargo
 *               descripcion:
 *                 type: string
 *                 description: Descripción detallada del cargo
 *             example:
 *               nombre: Supervisor Actualizado
 *               descripcion: Cargo de supervisión con responsabilidades actualizadas
 *     responses:
 *       200:
 *         description: Cargo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cargo'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Datos inválidos para actualizar el cargo
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cargo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cargo no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', cargosController.updateCargo);

/**
 * @swagger
 * /api/cargos/{id}:
 *   delete:
 *     summary: Elimina un cargo existente
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cargo
 *     responses:
 *       200:
 *         description: Cargo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cargo eliminado exitosamente
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cargo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Cargo no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', cargosController.deleteCargo);

module.exports = router;