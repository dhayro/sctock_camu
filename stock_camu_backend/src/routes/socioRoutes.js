const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const socioController = require('../controllers/socioController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Socio:
 *       type: object
 *       required:
 *         - codigo
 *         - dni
 *         - apellidos
 *         - nombres
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del socio
 *         codigo:
 *           type: string
 *           description: Código único del socio
 *         dni:
 *           type: string
 *           description: DNI del socio (8 dígitos)
 *         apellidos:
 *           type: string
 *           description: Apellidos del socio
 *         nombres:
 *           type: string
 *           description: Nombres del socio
 *         caserio:
 *           type: string
 *           description: Caserío donde vive el socio
 *         certificado:
 *           type: boolean
 *           description: Indica si el socio tiene certificado
 *         direccion:
 *           type: string
 *           description: Dirección del socio
 *         telefono:
 *           type: string
 *           description: Número de teléfono del socio
 *         email:
 *           type: string
 *           description: Correo electrónico del socio
 *         estado:
 *           type: boolean
 *           description: Estado del socio (activo/inactivo)
 */

/**
 * @swagger
 * tags:
 *   name: Socios
 *   description: API para gestionar socios
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/socios:
 *   get:
 *     summary: Obtiene todos los socios
 *     tags: [Socios]
 *     responses:
 *       200:
 *         description: Lista de socios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Socio'
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
router.get('/', socioController.getAllSocios);

/**
 * @swagger
 * /api/socios/{id}:
 *   get:
 *     summary: Obtiene un socio por su ID
 *     tags: [Socios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del socio
 *     responses:
 *       200:
 *         description: Socio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Socio'
 *       404:
 *         description: Socio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Socio no encontrado
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
router.get('/:id', socioController.getSocioById);

/**
 * @swagger
 * /api/socios:
 *   post:
 *     summary: Crea un nuevo socio
 *     tags: [Socios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - dni
 *               - apellidos
 *               - nombres
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único del socio
 *               dni:
 *                 type: string
 *                 description: DNI del socio (8 dígitos)
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del socio
 *               nombres:
 *                 type: string
 *                 description: Nombres del socio
 *               caserio:
 *                 type: string
 *                 description: Caserío donde vive el socio
 *               certificado:
 *                 type: boolean
 *                 description: Indica si el socio tiene certificado
 *               direccion:
 *                 type: string
 *                 description: Dirección del socio
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono del socio
 *               email:
 *                 type: string
 *                 description: Correo electrónico del socio
 *             example:
 *               codigo: "SOC-001"
 *               dni: "12345678"
 *               apellidos: "Pérez Gómez"
 *               nombres: "Juan Carlos"
 *               caserio: "San Juan"
 *               certificado: true
 *               direccion: "Av. Principal 123"
 *               telefono: "987654321"
 *               email: "juan.perez@example.com"
 *     responses:
 *       201:
 *         description: Socio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Socio'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Código, DNI, apellidos y nombres son obligatorios
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
router.post('/', socioController.createSocio);

/**
 * @swagger
 * /api/socios/{id}:
 *   put:
 *     summary: Actualiza un socio existente
 *     tags: [Socios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del socio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único del socio
 *               dni:
 *                 type: string
 *                 description: DNI del socio (8 dígitos)
 *               apellidos:
 *                 type: string
 *                 description: Apellidos del socio
 *               nombres:
 *                 type: string
 *                 description: Nombres del socio
 *               caserio:
 *                 type: string
 *                 description: Caserío donde vive el socio
 *               certificado:
 *                 type: boolean
 *                 description: Indica si el socio tiene certificado
 *               direccion:
 *                 type: string
 *                 description: Dirección del socio
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono del socio
 *               email:
 *                 type: string
 *                 description: Correo electrónico del socio
 *               estado:
 *                 type: boolean
 *                 description: Estado del socio (activo/inactivo)
 *             example:
 *               codigo: "SOC-001"
 *               dni: "12345678"
 *               apellidos: "Pérez Gómez Actualizado"
 *               nombres: "Juan Carlos"
 *               caserio: "San Juan"
 *               certificado: true
 *               direccion: "Av. Principal 456"
 *               telefono: "987654321"
 *               email: "juan.perez.actualizado@example.com"
 *               estado: true
 *     responses:
 *       200:
 *         description: Socio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Socio'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Socio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Socio no encontrado
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
router.put('/:id', socioController.updateSocio);

/**
 * @swagger
 * /api/socios/{id}:
 *   delete:
 *     summary: Elimina un socio
 *     tags: [Socios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del socio
 *     responses:
 *       200:
 *         description: Socio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Socio eliminado correctamente
 *       404:
 *         description: Socio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Socio no encontrado
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
router.delete('/:id', socioController.deleteSocio);

module.exports = router;