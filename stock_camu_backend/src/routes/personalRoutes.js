const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);
/**
 * @swagger
 * components:
 *   schemas:
 *     Personal:
 *       type: object
 *       required:
 *         - dni
 *         - nombres
 *         - apellidos
 *         - cargo_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del personal
 *         dni:
 *           type: string
 *           description: DNI del personal
 *         nombres:
 *           type: string
 *           description: Nombres del personal
 *         apellidos:
 *           type: string
 *           description: Apellidos del personal
 *         cargo_id:
 *           type: integer
 *           description: ID del cargo asignado
 *         area_id:
 *           type: integer
 *           description: ID del área asignada
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         direccion:
 *           type: string
 *           description: Dirección del personal
 *         email:
 *           type: string
 *           description: Correo electrónico
 *         estado:
 *           type: boolean
 *           description: Estado del personal (activo/inactivo)
 *         cargo:
 *           $ref: '#/components/schemas/Cargo'
 *         area:
 *           $ref: '#/components/schemas/Area'
 *       example:
 *         id: 1
 *         dni: "12345678"
 *         nombres: "Juan Carlos"
 *         apellidos: "Pérez Gómez"
 *         cargo_id: 1
 *         area_id: 2
 *         telefono: "987654321"
 *         direccion: "Av. Principal 123"
 *         email: "juan.perez@example.com"
 *         estado: true
 *         cargo:
 *           id: 1
 *           nombre: "Gerente"
 *           descripcion: "Cargo de gerencia"
 *         area:
 *           id: 2
 *           nombre: "Administración"
 *           descripcion: "Área administrativa"
 */

/**
 * @swagger
 * tags:
 *   name: Personal
 *   description: API para gestionar el personal de la empresa
 */

/**
 * @swagger
 * /api/personal:
 *   get:
 *     summary: Obtiene todo el personal
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personal'
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
router.get('/', personalController.getAllPersonal);

/**
 * @swagger
 * /api/personal/{id}:
 *   get:
 *     summary: Obtiene un personal por su ID
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del personal
 *     responses:
 *       200:
 *         description: Personal encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personal'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Personal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Personal no encontrado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', personalController.getPersonalById);

/**
 * @swagger
 * /api/personal:
 *   post:
 *     summary: Crea un nuevo personal
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - nombres
 *               - apellidos
 *               - cargo_id
 *             properties:
 *               dni:
 *                 type: string
 *                 description: DNI del personal
 *               nombres:
 *                 type: string
 *                 description: Nombres del personal
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del personal
 *               cargo_id:
 *                 type: integer
 *                 description: ID del cargo asignado
 *               area_id:
 *                 type: integer
 *                 description: ID del área asignada
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               direccion:
 *                 type: string
 *                 description: Dirección del personal
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *     responses:
 *       201:
 *         description: Personal creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personal'
 *       400:
 *         description: Datos inválidos o incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.post('/', personalController.createPersonal);

/**
 * @swagger
 * /api/personal/{id}:
 *   put:
 *     summary: Actualiza un personal existente
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del personal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dni:
 *                 type: string
 *                 description: DNI del personal
 *               nombres:
 *                 type: string
 *                 description: Nombres del personal
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del personal
 *               cargo_id:
 *                 type: integer
 *                 description: ID del cargo asignado
 *               area_id:
 *                 type: integer
 *                 description: ID del área asignada
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *               direccion:
 *                 type: string
 *                 description: Dirección del personal
 *               email:
 *                 type: string
 *                 description: Correo electrónico
 *               estado:
 *                 type: boolean
 *                 description: Estado del personal (activo/inactivo)
 *     responses:
 *       200:
 *         description: Personal actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personal'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Personal no encontrado
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
router.put('/:id', personalController.updatePersonal);

/**
 * @swagger
 * /api/personal/{id}:
 *   delete:
 *     summary: Elimina un personal
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del personal
 *     responses:
 *       200:
 *         description: Personal eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Personal eliminado exitosamente
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Personal no encontrado
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
router.delete('/:id', personalController.deletePersonal);

module.exports = router;