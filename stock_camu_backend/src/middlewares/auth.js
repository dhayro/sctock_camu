const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
  // Obtener el token del header
  const bearerHeader = req.headers['authorization'];
  
  // Log para verificar el encabezado de autorización
  console.log('Authorization Header:', bearerHeader);

  // Verificar si el token existe
  if (!bearerHeader) {
    console.log('Token no proporcionado');
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }
  
  try {
    // Extraer el token (formato: "Bearer TOKEN")
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    
    // Log para verificar el token extraído
    console.log('Token extraído:', token);

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
    // Log para verificar el token decodificado
    console.log('Token decodificado:', decoded);

    // Añadir el usuario decodificado a la solicitud
    req.usuario = decoded;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
exports.checkRole = (roles) => {
  return (req, res, next) => {
    // Log para verificar el usuario y su rol
    console.log('Usuario en la solicitud:', req.usuario);

    // Verificar si el usuario tiene un rol asignado
    if (!req.usuario || !req.usuario.rol) {
      console.log('Rol no asignado o usuario no autenticado');
      return res.status(403).json({ message: 'Acceso denegado. No tiene permisos suficientes.' });
    }
    
    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (roles.includes(req.usuario.rol)) {
      next();
    } else {
      console.log('Rol no permitido:', req.usuario.rol);
      res.status(403).json({ message: 'Acceso denegado. No tiene permisos suficientes.' });
    }
  };
};