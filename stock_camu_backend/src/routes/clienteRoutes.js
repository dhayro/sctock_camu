const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const clienteController = require('../controllers/clienteController');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - razon_social
 *         - ruc
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del cliente
 *         razon_social:
 *           type: string
 *           description: Razón social del cliente
 *         ruc:
 *           type: string
 *           description: RUC del cliente (11 dígitos)
 *         direccion:
 *           type: string
 *           description: Dirección del cliente
 *         telefono:
 *           type: string
 *           description: Teléfono del cliente
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del cliente
 *         estado:
 *           type: boolean
 *           description: Estado del cliente (activo/inactivo)
 */

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: API para gestionar clientes
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtiene todos los clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
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
router.get('/', clienteController.getAllClientes);

/**
 * @swagger
 * /api/clientes/search:
 *   get:
 *     summary: Busca clientes por razón social o RUC
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda (razón social o RUC)
 *     responses:
 *       200:
 *         description: Lista de clientes que coinciden con la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
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
router.get('/search', clienteController.searchClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtiene un cliente por su ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cliente no encontrado
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
router.get('/:id', clienteController.getClienteById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razon_social
 *               - ruc
 *             properties:
 *               razon_social:
 *                 type: string
 *                 description: Razón social del cliente
 *               ruc:
 *                 type: string
 *                 description: RUC del cliente (11 dígitos)
 *               direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *               telefono:
 *                 type: string
 *                 description: Teléfono del cliente
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del cliente
 *             example:
 *               razon_social: "Empresa ABC S.A.C."
 *               ruc: "20123456789"
 *               direccion: "Av. Principal 123, Lima"
 *               telefono: "987654321"
 *               email: "contacto@empresaabc.com"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Razón social y RUC son obligatorios
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
router.post('/', clienteController.createCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualiza un cliente existente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razon_social:
 *                 type: string
 *                 description: Razón social del cliente
 *               ruc:
 *                 type: string
 *                 description: RUC del cliente (11 dígitos)
 *               direccion:
 *                 type: string
 *                 description: Dirección del cliente
 *               telefono:
 *                 type: string
 *                 description: Teléfono del cliente
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del cliente
 *               estado:
 *                 type: boolean
 *                 description: Estado del cliente (activo/inactivo)
 *             example:
 *               razon_social: "Empresa ABC Actualizada S.A.C."
 *               ruc: "20123456789"
 *               direccion: "Av. Principal 456, Lima"
 *               telefono: "987654322"
 *               email: "nuevo@empresaabc.com"
 *               estado: true
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Ya existe otro cliente con ese RUC
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cliente no encontrado
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
router.put('/:id', clienteController.updateCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Elimina un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente eliminado correctamente
 *       400:
 *         description: No se puede eliminar porque está en uso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No se puede eliminar este cliente porque está siendo utilizado
 *                 details:
 *                   type: string
 *                   example: Tiene 3 pedidos y 2 salidas asociados
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cliente no encontrado
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
router.delete('/:id', clienteController.deleteCliente);

/**
 * @swagger
 * /api/clientes/{id}/estado:
 *   patch:
 *     summary: Cambia el estado de un cliente (activar/desactivar)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del cliente
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
 *                 description: Nuevo estado del cliente
 *             example:
 *               estado: false
 *     responses:
 *       200:
 *         description: Estado del cliente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cliente desactivado correctamente
 *                 cliente:
 *                   $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: El estado es obligatorio
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cliente no encontrado
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
router.patch('/:id/estado', clienteController.cambiarEstadoCliente);

module.exports = router;