const express = require('express');
const rolesController = require('../controllers/rolesController');
const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Retrieve a list of roles
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 */
router.get('/', rolesController.getAllRoles);

module.exports = router;